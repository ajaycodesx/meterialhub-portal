import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio


async def test_driver_full_suite(
    async_client: AsyncClient, driver_token: str, buyer_token: str
):
    headers = {"Authorization": f"Bearer {driver_token}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    res_feed = await async_client.get(f"{settings.API_V1_STR}/driver/feed", headers=headers)
    assert res_feed.status_code == 200
    feed_data = res_feed.json()["data"]
    assert "driverId" in feed_data
    assert "todayEarnings" in feed_data

    res_profile = await async_client.get(f"{settings.API_V1_STR}/driver/profile", headers=headers)
    assert res_profile.status_code == 200
    profile_data = res_profile.json()["data"]
    assert profile_data["driverId"] == "u_driver_1"
    assert "vehicleRegNumber" in profile_data

    res_toggle = await async_client.post(f"{settings.API_V1_STR}/driver/toggle-online", headers=headers)
    assert res_toggle.status_code == 200

    res_history = await async_client.get(f"{settings.API_V1_STR}/driver/trips/history", headers=headers)
    assert res_history.status_code == 200
    assert isinstance(res_history.json()["data"], list)

    res_loc = await async_client.post(
        f"{settings.API_V1_STR}/driver/location",
        headers=headers,
        json={"latitude": 10.0159, "longitude": 76.3419, "speedKmh": 35.5, "heading": 180.0}
    )
    assert res_loc.status_code == 200

    res_denied = await async_client.get(
        f"{settings.API_V1_STR}/driver/feed",
        headers=buyer_headers
    )
    assert res_denied.status_code == 403
