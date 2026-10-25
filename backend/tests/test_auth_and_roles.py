import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio


async def test_buyer_login_and_profile(async_client: AsyncClient, buyer_token: str):
    headers = {"Authorization": f"Bearer {buyer_token}"}
    res = await async_client.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["email"] == "buyer@materialhub.in"
    assert data["role"] == "buyer"


async def test_vendor_dashboard_and_authorization(
    async_client: AsyncClient, vendor_token: str, buyer_token: str
):
    vendor_headers = {"Authorization": f"Bearer {vendor_token}"}
    res = await async_client.get(f"{settings.API_V1_STR}/vendor/dashboard", headers=vendor_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["merchantId"] == "m1"
    assert "storeName" in data
    assert "walletBalance" in data
    assert "quickStats" in data

    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
    res_forbidden = await async_client.get(f"{settings.API_V1_STR}/vendor/dashboard", headers=buyer_headers)
    assert res_forbidden.status_code == 403
    assert "Vendor role required" in res_forbidden.json()["detail"]


async def test_driver_feed_and_authorization(
    async_client: AsyncClient, driver_token: str, buyer_token: str
):
    driver_headers = {"Authorization": f"Bearer {driver_token}"}
    res = await async_client.get(f"{settings.API_V1_STR}/driver/feed", headers=driver_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["driverId"] == "u_driver_1"
    assert "driverName" in data
    assert "todayEarnings" in data

    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
    res_forbidden = await async_client.get(f"{settings.API_V1_STR}/driver/feed", headers=buyer_headers)
    assert res_forbidden.status_code == 403
    assert "Driver role required" in res_forbidden.json()["detail"]


async def test_admin_overview_and_authorization(
    async_client: AsyncClient, admin_token: str, buyer_token: str
):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    res = await async_client.get(f"{settings.API_V1_STR}/admin/overview", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "totalGmv" in data
    assert "merchantRoster" in data

    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
    res_forbidden = await async_client.get(f"{settings.API_V1_STR}/admin/overview", headers=buyer_headers)
    assert res_forbidden.status_code == 403
    assert "Admin role required" in res_forbidden.json()["detail"]


async def test_privileged_self_registration_prevented(async_client: AsyncClient):
    payload = {
        "email": "hacker@test.com",
        "phone": "+919999988888",
        "name": "Intruder",
        "password": "password123",
        "role": "admin"
    }
    res = await async_client.post(f"{settings.API_V1_STR}/auth/register", json=payload)
    assert res.status_code == 403
    assert "dedicated onboarding procedure for admin" in res.json()["detail"]


async def test_unauthenticated_request_rejected(async_client: AsyncClient):
    res = await async_client.get(f"{settings.API_V1_STR}/auth/me")
    assert res.status_code == 401
    assert "Authentication token required" in res.json()["detail"]
