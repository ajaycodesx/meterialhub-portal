import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio


async def test_order_logistics_and_tax_calculation(async_client: AsyncClient):
    payload = {
        "items": [
            {"productId": "p1", "quantity": 10},
            {"productId": "p4", "quantity": 2},
        ],
        "pincode": "682030",
        "distanceKm": 3.5
    }
    res = await async_client.post(f"{settings.API_V1_STR}/buyer/calculate-order", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]

    assert data["itemsTotal"] == 120900.0
    assert data["totalWeightKg"] == 2500.0
    assert data["totalTonnage"] == 2.5
    expected_gst = round(120900.0 * 0.18, 2)
    assert data["gstTotal"] == expected_gst

    expected_grand_total = round(data["itemsTotal"] + data["deliveryFee"] + data["craneFee"] + data["gstTotal"], 2)
    assert data["grandTotal"] == expected_grand_total

    assert "Truck" in data["recommendedVehicle"]


async def test_order_creation_and_history(async_client: AsyncClient, buyer_token: str):
    headers = {"Authorization": f"Bearer {buyer_token}"}
    create_payload = {
        "merchantId": "m1",
        "items": [
            {"productId": "p1", "quantity": 5}
        ],
        "deliveryAddress": "Infopark Campus, Phase 1, Kakkanad",
        "pincode": "682030",
        "paymentMode": "Cash on Unloading",
        "siteConstraints": {"roadWidth": "16ft+", "craneNeeded": False}
    }
    res = await async_client.post(f"{settings.API_V1_STR}/buyer/orders", json=create_payload, headers=headers)
    assert res.status_code == 200
    order_data = res.json()["data"]
    assert order_data["orderId"].startswith("ord_")
    assert order_data["status"] == "confirmed"
    assert order_data["grandTotal"] > order_data["itemsTotal"]

    history_res = await async_client.get(f"{settings.API_V1_STR}/buyer/orders", headers=headers)
    assert history_res.status_code == 200
    orders = history_res.json()["data"]["orders"]
    assert any(o["orderId"] == order_data["orderId"] for o in orders)
