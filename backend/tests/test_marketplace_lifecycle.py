import pytest
import asyncio
from httpx import AsyncClient
from app.core.config import settings
from app.core.security import create_access_token

pytestmark = pytest.mark.asyncio

async def test_full_marketplace_lifecycle_end_to_end(async_client: AsyncClient):
    buyer_token = create_access_token(subject="u_buyer_1")
    vendor_token = create_access_token(subject="u_vendor_1")
    driver1_token = create_access_token(subject="u_driver_1")
    driver2_token = create_access_token(subject="u_driver_2")
    admin_token = create_access_token(subject="u_admin_1")

    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
    vendor_headers = {"Authorization": f"Bearer {vendor_token}"}
    driver1_headers = {"Authorization": f"Bearer {driver1_token}"}
    driver2_headers = {"Authorization": f"Bearer {driver2_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res = await async_client.get(f"{settings.API_V1_STR}/auth/me", headers=buyer_headers)
    assert res.status_code == 200
    buyer_info = res.json()["data"]
    assert buyer_info["id"] == "u_buyer_1"

    res = await async_client.get(f"{settings.API_V1_STR}/buyer/catalog?category=cement")
    assert res.status_code == 200
    catalog = res.json()["data"]
    assert len(catalog["products"]) > 0

    target_product = catalog["products"][0]
    initial_stock = target_product["stockQty"]
    prod_id = target_product["id"]
    merchant_id = target_product["merchantId"]

    calc_res = await async_client.post(
        f"{settings.API_V1_STR}/buyer/calculate-order",
        json={
            "items": [{"productId": prod_id, "quantity": 5}],
            "pincode": "682030",
            "distanceKm": 3.5
        }
    )
    assert calc_res.status_code == 200
    calc_data = calc_res.json()["data"]
    assert calc_data["grandTotal"] > 0

    order_payload = {
        "merchantId": merchant_id,
        "items": [{"productId": prod_id, "quantity": 5}],
        "deliveryAddress": "42 Coastal Expressway, Ernakulam, Kerala",
        "pincode": "682030",
        "siteConstraints": {
            "roadWidth": "12ft+",
            "craneNeeded": False,
            "unloadingTimeSlot": "Morning (8 AM - 12 PM)"
        },
        "paymentMode": "Online Payment (Razorpay)"
    }
    create_res = await async_client.post(
        f"{settings.API_V1_STR}/buyer/orders",
        json=order_payload,
        headers=buyer_headers
    )
    assert create_res.status_code == 200, f"Failed: {create_res.text}"
    order_data = create_res.json()["data"]
    order_id = order_data["orderId"]
    assert order_id is not None
    assert order_data["grandTotal"] == calc_data["grandTotal"]
    assert order_data["grandTotal"] == round(order_data["itemsTotal"] + order_data["deliveryFee"] + order_data["gstAmount"], 2)

    res = await async_client.get(f"{settings.API_V1_STR}/buyer/catalog?category=cement")
    updated_product = [p for p in res.json()["data"]["products"] if p["id"] == prod_id][0]
    assert updated_product["stockQty"] == initial_stock - 5

    pay_order_res = await async_client.post(
        f"{settings.API_V1_STR}/payment/create-order",
        json={
            "order_id": order_id,
            "amount": int(order_data["grandTotal"] * 100),
            "currency": "INR",
            "receipt": f"rcpt_{order_id}"
        },
        headers=buyer_headers
    )
    assert pay_order_res.status_code == 200
    pay_order = pay_order_res.json()["data"]
    razorpay_order_id = pay_order["id"]

    verify_pay_res = await async_client.post(
        f"{settings.API_V1_STR}/payment/verify",
        json={
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": f"pay_{order_id}",
            "razorpay_signature": "simulated_valid_sig"
        },
        headers=buyer_headers
    )
    assert verify_pay_res.status_code == 200
    assert verify_pay_res.json()["data"]["verified"] is True

    vendor_dash_res = await async_client.get(f"{settings.API_V1_STR}/vendor/dashboard", headers=vendor_headers)
    assert vendor_dash_res.status_code == 200
    vendor_data = vendor_dash_res.json()["data"]
    assert "grossSales" in vendor_data

    order_status_res = await async_client.post(
        f"{settings.API_V1_STR}/vendor/update-order-status",
        json={"orderId": order_id, "status": "packing"},
        headers=vendor_headers
    )
    assert order_status_res.status_code == 200

    feed_res = await async_client.get(f"{settings.API_V1_STR}/driver/feed", headers=driver1_headers)
    assert feed_res.status_code == 200
    available_trips = feed_res.json()["data"]["availableTrips"]
    assert len(available_trips) > 0
    target_trip = available_trips[0]
    trip_id = target_trip["tripId"]

    claim_1 = await async_client.post(
        f"{settings.API_V1_STR}/driver/update-trip",
        json={"tripId": trip_id, "status": "accepted"},
        headers=driver1_headers
    )
    assert claim_1.status_code == 200

    claim_2 = await async_client.post(
        f"{settings.API_V1_STR}/driver/update-trip",
        json={"tripId": trip_id, "status": "accepted"},
        headers=driver2_headers
    )
    assert claim_2.status_code in [403, 404]

    loc_res = await async_client.post(
        f"{settings.API_V1_STR}/driver/location",
        json={
            "tripId": trip_id,
            "latitude": 9.9816,
            "longitude": 76.2999,
            "speedKmh": 35.5,
            "heading": 180.0
        },
        headers=driver1_headers
    )
    assert loc_res.status_code == 200

    transit_res = await async_client.post(
        f"{settings.API_V1_STR}/driver/update-trip",
        json={"tripId": trip_id, "status": "in_transit"},
        headers=driver1_headers
    )
    assert transit_res.status_code == 200

    arrive_res = await async_client.post(
        f"{settings.API_V1_STR}/driver/update-trip",
        json={"tripId": trip_id, "status": "arrived_at_site"},
        headers=driver1_headers
    )
    assert arrive_res.status_code == 200

    otp_req_res = await async_client.post(
        f"{settings.API_V1_STR}/driver/request-delivery-otp",
        json={"tripId": trip_id},
        headers=driver1_headers
    )
    assert otp_req_res.status_code == 200
    otp_data = otp_req_res.json()["data"]
    assert "devOtp" not in otp_data
    assert otp_data["otpSent"] is True

    trip_order_id = target_trip["orderId"]
    from app.services.otp_service import otp_service
    stored_otp_data = await otp_service.get_stored_otp(f"delivery_{trip_order_id}")
    assert stored_otp_data is not None
    real_secret_otp = stored_otp_data["otp"]

    invalid_otp_res = await async_client.post(
        f"{settings.API_V1_STR}/driver/verify-delivery-otp",
        json={"tripId": trip_id, "otp": "000000"},
        headers=driver1_headers
    )
    assert invalid_otp_res.status_code in [400, 422]

    verify_otp_res = await async_client.post(
        f"{settings.API_V1_STR}/driver/verify-delivery-otp",
        json={"tripId": trip_id, "otp": real_secret_otp},
        headers=driver1_headers
    )
    assert verify_otp_res.status_code == 200
    assert verify_otp_res.json()["data"]["verified"] is True

    consumed_otp = await otp_service.get_stored_otp(f"delivery_{trip_order_id}")
    assert consumed_otp is None

    admin_res = await async_client.get(f"{settings.API_V1_STR}/admin/overview", headers=admin_headers)
    assert admin_res.status_code == 200
    admin_overview = admin_res.json()["data"]
    assert admin_overview["totalOrders"] > 0
    assert admin_overview["totalGmv"] > 0


async def test_marketplace_failure_paths_and_invariants(async_client: AsyncClient):
    buyer_token = create_access_token(subject="u_buyer_1")
    vendor_token = create_access_token(subject="u_vendor_1")
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
    vendor_headers = {"Authorization": f"Bearer {vendor_token}"}

    insufficient_stock_res = await async_client.post(
        f"{settings.API_V1_STR}/buyer/orders",
        json={
            "merchantId": "m1",
            "items": [{"productId": "p1", "quantity": 999999}],
            "deliveryAddress": "Site 4",
            "pincode": "682030",
            "siteConstraints": {"roadWidth": "12ft+", "craneNeeded": False, "unloadingTimeSlot": "Morning"}
        },
        headers=buyer_headers
    )
    assert insufficient_stock_res.status_code == 400

    cross_merchant_res = await async_client.post(
        f"{settings.API_V1_STR}/buyer/orders",
        json={
            "merchantId": "m2",
            "items": [{"productId": "p1", "quantity": 1}],
            "deliveryAddress": "Site 4",
            "pincode": "682030",
            "siteConstraints": {"roadWidth": "12ft+", "craneNeeded": False, "unloadingTimeSlot": "Morning"}
        },
        headers=buyer_headers
    )
    assert cross_merchant_res.status_code == 400

    invalid_vendor_order_res = await async_client.post(
        f"{settings.API_V1_STR}/vendor/update-order-status",
        json={"orderId": "non_existent_order_id", "status": "packing"},
        headers=vendor_headers
    )
    assert invalid_vendor_order_res.status_code == 404

    unauthorized_vendor = await async_client.get(f"{settings.API_V1_STR}/vendor/dashboard", headers=buyer_headers)
    assert unauthorized_vendor.status_code == 403

    unauthorized_driver = await async_client.get(f"{settings.API_V1_STR}/driver/feed", headers=buyer_headers)
    assert unauthorized_driver.status_code == 403

    unauthorized_admin = await async_client.get(f"{settings.API_V1_STR}/admin/overview", headers=buyer_headers)
    assert unauthorized_admin.status_code == 403

    cat_res = await async_client.get(f"{settings.API_V1_STR}/buyer/catalog?category=cement")
    target_product = cat_res.json()["data"]["products"][0]
    target_prod_id = target_product["id"]
    target_merchant_id = target_product["merchantId"]
    initial_stock = target_product["stockQty"]

    rejectable_order_res = await async_client.post(
        f"{settings.API_V1_STR}/buyer/orders",
        json={
            "merchantId": target_merchant_id,
            "items": [{"productId": target_prod_id, "quantity": 2}],
            "deliveryAddress": "Site Reject Test",
            "pincode": "682030",
            "siteConstraints": {"roadWidth": "12ft+", "craneNeeded": False, "unloadingTimeSlot": "Morning"},
            "paymentMode": "Cash on Unloading"
        },
        headers=buyer_headers
    )
    assert rejectable_order_res.status_code == 200
    rejectable_order_id = rejectable_order_res.json()["data"]["orderId"]

    cat_res_after_order = await async_client.get(f"{settings.API_V1_STR}/buyer/catalog?category=cement")
    decremented_stock = [p for p in cat_res_after_order.json()["data"]["products"] if p["id"] == target_prod_id][0]["stockQty"]
    assert decremented_stock == initial_stock - 2

    reject_res = await async_client.post(
        f"{settings.API_V1_STR}/vendor/orders/{rejectable_order_id}/reject",
        json={"orderId": rejectable_order_id, "status": "cancelled", "reason": "Immediate depot stock out"},
        headers=vendor_headers
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["data"]["cancelled"] is True

    cat_res_after_reject = await async_client.get(f"{settings.API_V1_STR}/buyer/catalog?category=cement")
    restored_stock = [p for p in cat_res_after_reject.json()["data"]["products"] if p["id"] == target_prod_id][0]["stockQty"]
    assert restored_stock == initial_stock
