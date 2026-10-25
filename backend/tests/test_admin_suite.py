import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio


async def test_admin_full_suite(
    async_client: AsyncClient, admin_token: str, buyer_token: str
):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    res_overview = await async_client.get(f"{settings.API_V1_STR}/admin/overview", headers=admin_headers)
    assert res_overview.status_code == 200
    ov_data = res_overview.json()["data"]
    assert "totalGmv" in ov_data
    assert "ordersByStatus" in ov_data
    assert "merchantsStats" in ov_data

    res_orders = await async_client.get(f"{settings.API_V1_STR}/admin/orders", headers=admin_headers)
    assert res_orders.status_code == 200
    assert "orders" in res_orders.json()["data"]

    res_merchants = await async_client.get(f"{settings.API_V1_STR}/admin/merchants", headers=admin_headers)
    assert res_merchants.status_code == 200
    assert "merchants" in res_merchants.json()["data"]

    res_products = await async_client.get(f"{settings.API_V1_STR}/admin/products", headers=admin_headers)
    assert res_products.status_code == 200
    assert "products" in res_products.json()["data"]

    res_categories = await async_client.get(f"{settings.API_V1_STR}/admin/categories", headers=admin_headers)
    assert res_categories.status_code == 200
    assert len(res_categories.json()["data"]) > 0

    res_buyers = await async_client.get(f"{settings.API_V1_STR}/admin/buyers", headers=admin_headers)
    assert res_buyers.status_code == 200
    assert "buyers" in res_buyers.json()["data"]

    res_drivers = await async_client.get(f"{settings.API_V1_STR}/admin/drivers", headers=admin_headers)
    assert res_drivers.status_code == 200
    assert "drivers" in res_drivers.json()["data"]

    res_trips = await async_client.get(f"{settings.API_V1_STR}/admin/trips", headers=admin_headers)
    assert res_trips.status_code == 200
    assert "trips" in res_trips.json()["data"]

    res_payments = await async_client.get(f"{settings.API_V1_STR}/admin/payments", headers=admin_headers)
    assert res_payments.status_code == 200
    assert "payments" in res_payments.json()["data"]

    res_boq = await async_client.get(f"{settings.API_V1_STR}/admin/boq-quotes", headers=admin_headers)
    assert res_boq.status_code == 200
    assert "quotes" in res_boq.json()["data"]

    res_rates = await async_client.get(f"{settings.API_V1_STR}/admin/commodity-rates", headers=admin_headers)
    assert res_rates.status_code == 200
    assert len(res_rates.json()["data"]) > 0

    res_deals = await async_client.get(f"{settings.API_V1_STR}/admin/deals", headers=admin_headers)
    assert res_deals.status_code == 200
    assert len(res_deals.json()["data"]) > 0

    res_settings = await async_client.get(f"{settings.API_V1_STR}/admin/settings", headers=admin_headers)
    assert res_settings.status_code == 200
    assert "platformCommissionPercent" in res_settings.json()["data"]

    res_disputes = await async_client.get(f"{settings.API_V1_STR}/admin/disputes", headers=admin_headers)
    assert res_disputes.status_code == 200

    res_templates = await async_client.get(f"{settings.API_V1_STR}/admin/templates", headers=admin_headers)
    assert res_templates.status_code == 200

    res_logs = await async_client.get(f"{settings.API_V1_STR}/admin/audit-logs", headers=admin_headers)
    assert res_logs.status_code == 200

    res_forbidden = await async_client.get(f"{settings.API_V1_STR}/admin/orders", headers=buyer_headers)
    assert res_forbidden.status_code == 403
    assert "Admin role required" in res_forbidden.json()["detail"]
