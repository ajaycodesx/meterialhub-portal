"""Regression tests for the fraud and authorization fixes.

Each test pins down one abuse path that was previously open: client-controlled
payment amounts, cross-tenant access, direct delivery completion, unauthenticated
uploads, and buyer-initiated refunds.
"""

import pytest
from httpx import AsyncClient
from app.core.config import settings

pytestmark = pytest.mark.asyncio

API = settings.API_V1_STR


from tests.helpers import auth, dispatch_to_driver, place_cash_order  # noqa: E402


def order_body(quantity: int = 1, payment_mode: str = "Cash on Unloading") -> dict:
    return {
        "merchantId": "m1",
        "items": [{"productId": "p1", "quantity": quantity}],
        "deliveryAddress": "Site 4",
        "pincode": "682030",
        "siteConstraints": {"roadWidth": "12ft+", "craneNeeded": False, "unloadingTimeSlot": "Morning"},
        "paymentMode": payment_mode,
    }


async def test_tracking_hides_other_buyers_orders_and_otp(async_client: AsyncClient):
    order_id = await place_cash_order(async_client)

    other = await async_client.get(f"{API}/buyer/orders/{order_id}/tracking", headers=auth("u_vendor_1"))
    assert other.status_code == 404

    missing = await async_client.get(f"{API}/buyer/orders/ord_does_not_exist/tracking", headers=auth("u_buyer_1"))
    assert missing.status_code == 404

    owner = await async_client.get(f"{API}/buyer/orders/{order_id}/tracking", headers=auth("u_buyer_1"))
    assert owner.status_code == 200


async def test_non_positive_quantities_are_rejected(async_client: AsyncClient):
    for quantity in (0, -5):
        res = await async_client.post(
            f"{API}/buyer/orders", json=order_body(quantity=quantity), headers=auth("u_buyer_1")
        )
        assert res.status_code == 422

        calc = await async_client.post(
            f"{API}/buyer/calculate-order",
            json={"items": [{"productId": "p1", "quantity": quantity}], "distanceKm": 3.5},
        )
        assert calc.status_code == 422


async def test_online_payment_amount_is_taken_from_the_order(async_client: AsyncClient):
    created = await async_client.post(
        f"{API}/buyer/orders",
        json=order_body(payment_mode="Online Payment (Razorpay)"),
        headers=auth("u_buyer_1"),
    )
    assert created.status_code == 200
    order = created.json()["data"]

    res = await async_client.post(
        f"{API}/payment/create-order",
        json={"order_id": order["orderId"], "amount": 1, "currency": "INR"},
        headers=auth("u_buyer_1"),
    )
    assert res.status_code == 200
    assert res.json()["data"]["amount"] == round(order["grandTotal"] * 100)


async def test_cash_order_cannot_be_paid_online(async_client: AsyncClient):
    created = await async_client.post(
        f"{API}/buyer/orders", json=order_body(), headers=auth("u_buyer_1")
    )
    order_id = created.json()["data"]["orderId"]

    res = await async_client.post(
        f"{API}/payment/create-order",
        json={"order_id": order_id, "currency": "INR"},
        headers=auth("u_buyer_1"),
    )
    assert res.status_code == 400


async def test_buyer_cannot_refund_their_own_order(async_client: AsyncClient):
    res = await async_client.post(
        f"{API}/payment/refund",
        json={"payment_id": "pay_anything", "amount": 100},
        headers=auth("u_buyer_1"),
    )
    assert res.status_code == 403


async def test_driver_cannot_mark_delivery_complete_without_otp(async_client: AsyncClient):
    _, trip_id = await dispatch_to_driver(async_client)
    res = await async_client.post(
        f"{API}/driver/update-trip",
        json={"tripId": trip_id, "status": "unloaded_completed"},
        headers=auth("u_driver_1"),
    )
    assert res.status_code == 400


async def test_vendor_cannot_edit_another_merchants_products(async_client: AsyncClient):
    catalog = await async_client.get(f"{API}/buyer/catalog")
    foreign = [p for p in catalog.json()["data"]["products"] if p.get("merchantId") not in (None, "m1")]
    if not foreign:
        pytest.skip("Seed data has no products belonging to another merchant")
    product_id = foreign[0]["id"]

    stock = await async_client.post(
        f"{API}/vendor/update-stock",
        json={"productId": product_id, "newStockQty": 1, "newPrice": 1.0},
        headers=auth("u_vendor_1"),
    )
    assert stock.status_code == 404

    delete = await async_client.delete(f"{API}/vendor/products/{product_id}", headers=auth("u_vendor_1"))
    assert delete.status_code == 404


async def test_vendor_deal_is_hidden_from_buyers_until_approved(async_client: AsyncClient):
    material = "Pending Test Material XYZ"
    proposed = await async_client.post(
        f"{API}/vendor/deals/propose",
        json={
            "material": material,
            "brand": "Test",
            "image": "/images/hero_banner.png",
            "originalRate": 100.0,
            "dealRate": 90.0,
            "unit": "bag",
        },
        headers=auth("u_vendor_1"),
    )
    assert proposed.status_code == 200

    home = await async_client.get(f"{API}/buyer/home")
    assert all(d["material"] != material for d in home.json()["data"]["trendingDeals"])


async def test_vendor_deal_must_be_a_real_discount(async_client: AsyncClient):
    res = await async_client.post(
        f"{API}/vendor/deals/propose",
        json={
            "material": "Fake Deal",
            "brand": "Test",
            "image": "/images/hero_banner.png",
            "originalRate": 100.0,
            "dealRate": 120.0,
            "unit": "bag",
        },
        headers=auth("u_vendor_1"),
    )
    assert res.status_code == 422


async def test_upload_requires_vendor_or_admin(async_client: AsyncClient):
    png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
    anonymous = await async_client.post(
        f"{API}/upload", files={"file": ("banner.png", png, "image/png")}
    )
    assert anonymous.status_code == 401

    buyer = await async_client.post(
        f"{API}/upload",
        files={"file": ("banner.png", png, "image/png")},
        headers=auth("u_buyer_1"),
    )
    assert buyer.status_code == 403


async def test_upload_rejects_renamed_non_images(async_client: AsyncClient):
    res = await async_client.post(
        f"{API}/upload",
        files={"file": ("payload.png", b"<html><script>alert(1)</script></html>", "image/png")},
        headers=auth("u_vendor_1"),
    )
    assert res.status_code == 400


async def test_driver_exception_report_is_recorded(async_client: AsyncClient):
    # Regression: the audit call used an unsupported keyword and raised TypeError.
    _, trip_id = await dispatch_to_driver(async_client)
    res = await async_client.post(
        f"{API}/driver/trips/exception",
        json={"tripId": trip_id, "exceptionType": "site_closed", "description": "Gate locked"},
        headers=auth("u_driver_1"),
    )
    assert res.status_code == 200
