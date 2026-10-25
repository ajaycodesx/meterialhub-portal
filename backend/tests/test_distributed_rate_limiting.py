import pytest
from starlette.requests import Request
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request as FastAPIRequest
from httpx import AsyncClient, ASGITransport

from app.core.rate_limit import get_client_ip, rate_limit_exceeded_handler


def test_proxy_ip_spoofing_protection():
    """Verify that arbitrary X-Forwarded-For headers from untrusted hosts are rejected."""
    scope = {
        "type": "http",
        "client": ("203.0.113.5", 54321),
        "headers": [
            (b"x-forwarded-for", b"198.51.100.99"),
            (b"x-real-ip", b"198.51.100.99"),
        ],
    }
    req = Request(scope)
    resolved_ip = get_client_ip(req)
    assert resolved_ip == "203.0.113.5"


def test_trusted_proxy_forwarded_ip_accepted():
    """Verify that X-Forwarded-For is accepted only when connection is from trusted proxy."""
    scope = {
        "type": "http",
        "client": ("127.0.0.1", 54321),
        "headers": [
            (b"x-forwarded-for", b"203.0.113.42, 10.0.0.1"),
        ],
    }
    req = Request(scope)
    resolved_ip = get_client_ip(req)
    assert resolved_ip == "203.0.113.42"


@pytest.mark.asyncio
async def test_distributed_rate_limiting_across_instances():
    """Verify that multiple application instances share rate limits via Redis storage."""
    import fakeredis
    from limits.storage import RedisStorage
    from limits.strategies import STRATEGIES

    from redis.connection import ConnectionPool

    fake_server = fakeredis.FakeServer()
    pool = ConnectionPool(connection_class=fakeredis.FakeRedisConnection, server=fake_server)

    storage = RedisStorage("redis://localhost:6379/0", connection_pool=pool)

    limiter_a = Limiter(key_func=lambda request: "test_shared_client", storage_uri="memory://")
    limiter_a._storage = storage
    limiter_a._limiter = STRATEGIES["fixed-window"](storage)

    limiter_b = Limiter(key_func=lambda request: "test_shared_client", storage_uri="memory://")
    limiter_b._storage = storage
    limiter_b._limiter = STRATEGIES["fixed-window"](storage)

    app_a = FastAPI()
    app_a.state.limiter = limiter_a
    app_a.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

    app_b = FastAPI()
    app_b.state.limiter = limiter_b
    app_b.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

    @app_a.get("/test")
    @limiter_a.limit("3/minute")
    async def route_a(request: FastAPIRequest):
        return {"status": "ok", "instance": "A"}

    @app_b.get("/test")
    @limiter_b.limit("3/minute")
    async def route_b(request: FastAPIRequest):
        return {"status": "ok", "instance": "B"}

    async with AsyncClient(transport=ASGITransport(app=app_a), base_url="http://test") as client_a:
        for _ in range(3):
            res_a = await client_a.get("/test")
            assert res_a.status_code == 200

    async with AsyncClient(transport=ASGITransport(app=app_b), base_url="http://test") as client_b:
        res_b = await client_b.get("/test")
        assert res_b.status_code == 429
        body = res_b.json()
        assert body["success"] is False
        assert "Rate limit exceeded" in body["message"]
        assert "Retry-After" in res_b.headers
