import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio


async def test_rate_limiting_enforcement(async_client: AsyncClient):
    """Test that rapid successive login requests trigger HTTP 429."""
    if not settings.RATE_LIMIT_ENABLED:
        pytest.skip("Rate limiting is disabled in settings")

    rate_limited_response = None
    for _ in range(10):
        res = await async_client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "nonexistent@test.com", "password": "wrongpassword"}
        )
        if res.status_code == 429:
            rate_limited_response = res
            break

    assert rate_limited_response is not None, "Expected at least one response with status 429"
    assert rate_limited_response.status_code == 429

    body = rate_limited_response.json()
    assert body["success"] is False
    assert "Rate limit exceeded" in body["message"]
    assert "Retry-After" in rate_limited_response.headers
