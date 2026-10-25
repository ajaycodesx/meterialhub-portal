"""Rate limiting module using slowapi.

Provides IP-based rate limiting with configurable storage backend (in-memory or Redis)
and support for reverse proxy forwarded client headers.

IMPORTANT ARCHITECTURAL NOTE:
When running multiple backend instances (e.g., in Kubernetes, AWS ECS, or behind load balancers),
in-memory rate limiting is isolated per-instance. For true distributed rate limiting across
multiple workers/containers, set RATE_LIMIT_STORAGE_URL in your environment (e.g. redis://redis:6379/0).
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from app.core.config import settings


def get_client_ip(request: Request) -> str:
    """Extract client IP, inspecting X-Forwarded-For if caller is a trusted proxy."""
    client_host = request.client.host if request.client else "127.0.0.1"

    if client_host in settings.TRUSTED_PROXY_IPS:
        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        x_real_ip = request.headers.get("X-Real-IP")
        if x_real_ip:
            return x_real_ip.strip()

    return client_host


limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[settings.RATE_LIMIT_DEFAULT] if settings.RATE_LIMIT_ENABLED else [],
    storage_uri=settings.RATE_LIMIT_STORAGE_URL,
    enabled=settings.RATE_LIMIT_ENABLED,
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Standardized HTTP 429 response when rate limit is exceeded."""
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "message": "Too many requests. Rate limit exceeded.",
            "error": {
                "detail": str(exc.detail),
                "retry_after": getattr(exc, "retry_after", None),
            },
            "data": None,
        },
        headers={"Retry-After": str(getattr(exc, "retry_after", 60))},
    )
