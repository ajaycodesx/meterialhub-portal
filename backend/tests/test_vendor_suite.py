import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio


async def test_vendor_full_suite(
    async_client: AsyncClient, vendor_token: str, buyer_token: str
):
    vendor_headers = {"Authorization": f"Bearer {vendor_token}"}
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    res_dash = await async_client.get(f"{settings.API_V1_STR}/vendor/dashboard", headers=vendor_headers)
    assert res_dash.status_code == 200
    dash_data = res_dash.json()["data"]
    assert dash_data["merchantId"] == "m1"
    assert "grossSales" in dash_data
    assert "ordersPreparingCount" in dash_data

    res_profile = await async_client.get(f"{settings.API_V1_STR}/vendor/profile", headers=vendor_headers)
    assert res_profile.status_code == 200
    prof = res_profile.json()["data"]
    assert prof["id"] == "m1"
    assert "gstin" in prof

    res_toggle = await async_client.post(f"{settings.API_V1_STR}/vendor/toggle-online", headers=vendor_headers)
    assert res_toggle.status_code == 200
    assert "isOnline" in res_toggle.json()["data"]

    res_orders = await async_client.get(f"{settings.API_V1_STR}/vendor/orders", headers=vendor_headers)
    assert res_orders.status_code == 200
    assert "orders" in res_orders.json()["data"]

    res_products = await async_client.get(f"{settings.API_V1_STR}/vendor/products", headers=vendor_headers)
    assert res_products.status_code == 200
    assert "products" in res_products.json()["data"]
    prods = res_products.json()["data"]["products"]
    if len(prods) > 0:
        first_prod = prods[0]
        res_adj = await async_client.post(
            f"{settings.API_V1_STR}/vendor/products/{first_prod['id']}/adjust-stock",
            json={"productId": first_prod["id"], "adjustmentQty": 20, "reason": "Physical stock check"},
            headers=vendor_headers
        )
        assert res_adj.status_code == 200
        assert res_adj.json()["data"]["newQty"] == first_prod["stockQty"] + 20

    res_boq = await async_client.get(f"{settings.API_V1_STR}/vendor/boq-quotes", headers=vendor_headers)
    assert res_boq.status_code == 200

    res_rates = await async_client.get(f"{settings.API_V1_STR}/vendor/commodity-rates", headers=vendor_headers)
    assert res_rates.status_code == 200
    assert len(res_rates.json()["data"]) > 0

    res_settlements = await async_client.get(f"{settings.API_V1_STR}/vendor/settlements", headers=vendor_headers)
    assert res_settlements.status_code == 200
    assert "netSettlement" in res_settlements.json()["data"]

    res_forbidden = await async_client.get(f"{settings.API_V1_STR}/vendor/dashboard", headers=buyer_headers)
    assert res_forbidden.status_code == 403
    assert "Vendor role required" in res_forbidden.json()["detail"]
