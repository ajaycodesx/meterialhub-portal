import uuid
import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio
API = settings.API_V1_STR


async def test_buyer_boq_quote_lifecycle(async_client: AsyncClient):
    login_res = await async_client.post(
        f"{API}/auth/login", json={"phone_or_email": "buyer@materialhub.in", "password": "buyer123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_res = await async_client.post(
        f"{API}/buyer/boq-quotes",
        json={
            "projectName": "Grand Horizon Towers",
            "deliveryPincode": "682030",
            "siteAddress": "Tower 3, Seaport Airport Road, Kakkanad",
            "rawMaterialsText": "1000 Bags UltraTech Cement, 25 MT Fe550D TMT Steel",
            "fileUrl": "/uploads/test_boq.pdf"
        },
        headers=headers
    )
    assert create_res.status_code == 200
    boq_data = create_res.json()["data"]
    assert boq_data["id"].startswith("BOQ-")
    assert boq_data["projectName"] == "Grand Horizon Towers"
    assert boq_data["status"] == "under_review"

    list_res = await async_client.get(f"{API}/buyer/boq-quotes", headers=headers)
    assert list_res.status_code == 200
    quotes = list_res.json()["data"]["quotes"]
    assert any(q["id"] == boq_data["id"] for q in quotes)


async def test_buyer_order_cancellation_and_inventory_restore(async_client: AsyncClient):
    login_res = await async_client.post(
        f"{API}/auth/login", json={"phone_or_email": "buyer@materialhub.in", "password": "buyer123"}
    )
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    order_payload = {
        "merchantId": "m1",
        "items": [{"productId": "p1", "quantity": 10}],
        "deliveryAddress": "Site 9B, Infopark Phase 2, Kochi",
        "pincode": "682030",
        "siteConstraints": {
            "roadWidth": "12ft+",
            "craneNeeded": False,
            "unloadingTimeSlot": "Morning (8 AM - 12 PM)"
        },
        "paymentMode": "Cash on Unloading"
    }

    place_res = await async_client.post(f"{API}/buyer/orders", json=order_payload, headers=headers)
    assert place_res.status_code == 200
    order_id = place_res.json()["data"]["orderId"]

    cancel_res = await async_client.post(
        f"{API}/buyer/orders/{order_id}/cancel",
        json={"reason": "Project postponed by client"},
        headers=headers
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["data"]["status"] == "cancelled"

    second_cancel = await async_client.post(
        f"{API}/buyer/orders/{order_id}/cancel",
        json={"reason": "Trying again"},
        headers=headers
    )
    assert second_cancel.status_code == 400


async def test_buyer_delivered_order_rating(async_client: AsyncClient):
    login_res = await async_client.post(
        f"{API}/auth/login", json={"phone_or_email": "buyer@materialhub.in", "password": "buyer123"}
    )
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    order_payload = {
        "merchantId": "m1",
        "items": [{"productId": "p1", "quantity": 5}],
        "deliveryAddress": "Site Rating Test, Kochi",
        "pincode": "682030",
        "siteConstraints": {
            "roadWidth": "12ft+",
            "craneNeeded": False,
            "unloadingTimeSlot": "Morning (8 AM - 12 PM)"
        },
        "paymentMode": "Cash on Unloading"
    }
    place_res = await async_client.post(f"{API}/buyer/orders", json=order_payload, headers=headers)
    order_id = place_res.json()["data"]["orderId"]

    admin_login = await async_client.post(
        f"{API}/auth/login", json={"phone_or_email": "admin@materialhub.in", "password": "admin123"}
    )
    admin_token = admin_login.json()["data"]["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    update_res = await async_client.post(
        f"{API}/admin/orders/{order_id}/status",
        json={"status": "delivered"},
        headers=admin_headers
    )
    assert update_res.status_code == 200

    rate_res = await async_client.post(
        f"{API}/buyer/orders/{order_id}/rate",
        json={"rating": 5, "reviewText": "Fast delivery and genuine UltraTech cement!"},
        headers=headers
    )
    assert rate_res.status_code == 200
    assert rate_res.json()["data"]["rated"] is True
    assert rate_res.json()["data"]["rating"] == 5
