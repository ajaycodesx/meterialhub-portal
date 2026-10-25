"""End-to-End Staging Business Workflow Tests against Live PostgreSQL.

Verifies the complete MaterialHub business workflow across all roles:
1. Buyer: Register, login, browse catalog, calculate order, place order, verify history.
2. Vendor: Login, view scoped dashboard, update inventory stock, verify role boundaries.
3. Driver: Login, view driver feed, reject unauthorized cross-driver trip updates,
   perform valid status transitions, and verify OTP implementation status.
4. Admin: Login, view platform GMV overview, verify privileged route rejection for other roles.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, delete

from app.main import app
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.merchant import HardwareMerchant
from app.models.category import MaterialCategory
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.delivery import DeliveryTrip, TripStatus

TEST_PG_URL = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/materialhub_staging"

pg_engine = create_async_engine(TEST_PG_URL, echo=False)
PgSessionLocal = async_sessionmaker(pg_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with PgSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest.fixture(scope="module", autouse=True)
def setup_db_override():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)


async def prepare_staging_fixtures():
    """Seed prerequisite merchant, products, vendor, driver, and admin accounts in PostgreSQL."""
    async with PgSessionLocal() as db:
        await db.execute(delete(DeliveryTrip))
        await db.execute(delete(OrderItem))
        await db.execute(delete(Order))
        await db.execute(delete(Product))
        await db.execute(delete(MaterialCategory))
        await db.execute(delete(User))
        await db.execute(delete(HardwareMerchant))
        await db.commit()

        merchant = HardwareMerchant(
            id=f"mer_{uuid.uuid4().hex[:8]}",
            name="UltraTech Building Materials Depot",
            owner_name="Ramesh Sharma",
            phone="+919811001100",
            email="depot@ultratech-staging.in",
            address="Plot 12, Industrial Area, Sector 62, Noida",
            pincode="201301",
            verified=True,
            rating=4.8,
            reviews_count=120,
            distance_km=3.5,
            delivery_eta_minutes=45,
            min_order_value=5000,
            main_category="All Hardware & Building Materials",
            brands=["UltraTech", "Tata Tiscon"],
            is_online=True,
            avatar_url="/images/depot.png",
            gstin="07AAAAA0000A1Z5",
            bank_account="9876543210123",
            wallet_balance=145000.0,
        )
        db.add(merchant)

        category = MaterialCategory(
            id="cement",
            title="Cement & Concrete",
            subtitle="Structural & masonry cement",
            icon_name="FaIndustry",
            color_bg="bg-[#FF6500]",
            item_count=15,
            image="/images/cement.png",
            subcategories=["OPC 53", "PPC", "White Cement"],
            featured_brands=["UltraTech", "Ambuja"],
        )
        db.add(category)

        product = Product(
            id=f"prod_{uuid.uuid4().hex[:8]}",
            title="UltraTech Super OPC 53 Grade Cement 50kg",
            category="cement",
            brand="UltraTech",
            price=380.0,
            unit="50kg Bag",
            moq=10,
            weight_spec="50kg",
            image="/images/products/cement-50kg.png",
            grade="53 Grade OPC",
            weight_kg=50.0,
            stock_qty=500,
            merchant_id=merchant.id,
        )
        db.add(product)

        vendor_user = User(
            id=f"usr_ven_{uuid.uuid4().hex[:6]}",
            email="vendor@staging.mh",
            hashed_password=get_password_hash("VendorPass123!"),
            name="Ramesh Sharma (Vendor)",
            phone="+919811001100",
            role=UserRole.VENDOR,
            merchant_id=merchant.id,
            is_verified=True,
            is_active=True,
        )
        driver1 = User(
            id=f"usr_drv1_{uuid.uuid4().hex[:6]}",
            email="driver1@staging.mh",
            hashed_password=get_password_hash("DriverPass123!"),
            name="Suresh Kumar (Driver 1)",
            phone="+919822002200",
            role=UserRole.DRIVER,
            vehicle_type="Mini Commercial Truck (3 Ton)",
            is_verified=True,
            is_active=True,
        )
        driver2 = User(
            id=f"usr_drv2_{uuid.uuid4().hex[:6]}",
            email="driver2@staging.mh",
            hashed_password=get_password_hash("DriverPass123!"),
            name="Rajesh Singh (Driver 2)",
            phone="+919833003300",
            role=UserRole.DRIVER,
            vehicle_type="Mini Commercial Truck (3 Ton)",
            is_verified=True,
            is_active=True,
        )
        admin_user = User(
            id=f"usr_adm_{uuid.uuid4().hex[:6]}",
            email="admin@staging.mh",
            hashed_password=get_password_hash("AdminPass123!"),
            name="MaterialHub Operations Admin",
            phone="+919800000000",
            role=UserRole.ADMIN,
            is_verified=True,
            is_active=True,
        )

        db.add_all([vendor_user, driver1, driver2, admin_user])
        await db.commit()

        return {
            "merchant_id": merchant.id,
            "product_id": product.id,
            "category_id": category.id,
            "vendor_id": vendor_user.id,
            "driver1_id": driver1.id,
            "driver2_id": driver2.id,
            "admin_id": admin_user.id,
        }


from app.core.rate_limit import limiter

@pytest.mark.asyncio
async def test_full_business_workflow():
    """Execute complete end-to-end lifecycle across Buyer, Vendor, Driver, and Admin roles."""
    if hasattr(limiter, "_storage") and hasattr(limiter._storage, "reset"):
        limiter._storage.reset()

    fixtures = await prepare_staging_fixtures()
    merchant_id = fixtures["merchant_id"]
    product_id = fixtures["product_id"]
    driver1_id = fixtures["driver1_id"]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:


        reg_payload = {
            "name": "Apex Infra Contractors",
            "email": "contractor@staging.mh",
            "password": "BuyerSecurePass123!",
            "phone": "+919911223344",
            "role": "buyer",
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 200, res_reg.text
        reg_data = res_reg.json()
        assert reg_data["success"] is True

        async with PgSessionLocal() as db:
            res = await db.execute(select(User).where(User.email == "contractor@staging.mh"))
            buyer_user = res.scalars().first()
            buyer_user.is_verified = True
            await db.commit()

        login_res = await client.post(
            "/api/v1/auth/login",
            json={"phone_or_email": "contractor@staging.mh", "password": "BuyerSecurePass123!"},
        )
        assert login_res.status_code == 200, login_res.text
        buyer_token = login_res.json()["data"]["access_token"]
        buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

        home_res = await client.get("/api/v1/buyer/home", headers=buyer_headers)
        assert home_res.status_code == 200
        assert home_res.json()["success"] is True

        catalog_res = await client.get("/api/v1/buyer/catalog", headers=buyer_headers)
        assert catalog_res.status_code == 200
        products_list = catalog_res.json()["data"]["products"]
        assert len(products_list) >= 1
        assert any(p["id"] == product_id for p in products_list)

        calc_payload = {
            "items": [{"productId": product_id, "quantity": 20}],
            "pincode": "201301",
            "distanceKm": 3.5,
            "craneNeeded": False,
        }
        calc_res = await client.post(
            "/api/v1/buyer/calculate-order", json=calc_payload, headers=buyer_headers
        )
        assert calc_res.status_code == 200
        calc_data = calc_res.json()["data"]
        assert calc_data["itemsTotal"] == 7600.0
        assert calc_data["deliveryFee"] > 0
        assert calc_data["grandTotal"] > calc_data["itemsTotal"]

        order_payload = {
            "merchantId": merchant_id,
            "items": [{"productId": product_id, "quantity": 20}],
            "deliveryAddress": "Plot 42, Sector 62, Noida",
            "pincode": "201301",
            "siteConstraints": {
                "roadWidth": "12ft+",
                "craneNeeded": False,
                "unloadingTimeSlot": "Morning (8 AM - 12 PM)",
            },
            "paymentMode": "Cash on Unloading",
        }
        order_res = await client.post(
            "/api/v1/buyer/orders", json=order_payload, headers=buyer_headers
        )
        assert order_res.status_code == 200, order_res.text
        order_data = order_res.json()["data"]
        created_order_id = order_data["orderId"]
        assert created_order_id is not None
        assert order_data["status"] == "confirmed"

        orders_hist = await client.get("/api/v1/buyer/orders", headers=buyer_headers)
        assert orders_hist.status_code == 200
        hist_orders = orders_hist.json()["data"]["orders"]
        assert any(o["orderId"] == created_order_id for o in hist_orders)


        v_login = await client.post(
            "/api/v1/auth/login",
            json={"phone_or_email": "vendor@staging.mh", "password": "VendorPass123!"},
        )
        assert v_login.status_code == 200, v_login.text
        vendor_token = v_login.json()["data"]["access_token"]
        vendor_headers = {"Authorization": f"Bearer {vendor_token}"}

        v_dash = await client.get("/api/v1/vendor/dashboard", headers=vendor_headers)
        assert v_dash.status_code == 200
        dash_data = v_dash.json()["data"]
        assert dash_data["merchantId"] == merchant_id
        assert "todayRevenue" in dash_data
        assert "activeOrdersCount" in dash_data

        stock_res = await client.post(
            "/api/v1/vendor/update-stock",
            json={"productId": product_id, "newStockQty": 420},
            headers=vendor_headers,
        )
        assert stock_res.status_code == 200, stock_res.text
        assert stock_res.json()["data"]["updated"] is True

        async with PgSessionLocal() as db:
            prod = (await db.execute(select(Product).where(Product.id == product_id))).scalars().first()
            assert prod.stock_qty == 420

        buyer_v_attempt = await client.get("/api/v1/vendor/dashboard", headers=buyer_headers)
        assert buyer_v_attempt.status_code == 403


        async with PgSessionLocal() as db:
            trip_res = await db.execute(
                select(DeliveryTrip).where(DeliveryTrip.order_id == created_order_id)
            )
            created_trip = trip_res.scalars().first()
            assert created_trip is not None
            created_trip_id = created_trip.id
            created_trip.driver_id = driver1_id
            created_trip.status = TripStatus.ASSIGNED
            await db.commit()

        d1_login = await client.post(
            "/api/v1/auth/login",
            json={"phone_or_email": "driver1@staging.mh", "password": "DriverPass123!"},
        )
        assert d1_login.status_code == 200, d1_login.text
        d1_token = d1_login.json()["data"]["access_token"]
        d1_headers = {"Authorization": f"Bearer {d1_token}"}

        d1_feed = await client.get("/api/v1/driver/feed", headers=d1_headers)
        assert d1_feed.status_code == 200
        feed_data = d1_feed.json()["data"]
        assert feed_data["activeTrip"] is not None
        assert feed_data["activeTrip"]["tripId"] == created_trip_id

        d2_login = await client.post(
            "/api/v1/auth/login",
            json={"phone_or_email": "driver2@staging.mh", "password": "DriverPass123!"},
        )
        assert d2_login.status_code == 200, d2_login.text
        d2_token = d2_login.json()["data"]["access_token"]
        d2_headers = {"Authorization": f"Bearer {d2_token}"}

        unauthorized_update = await client.post(
            "/api/v1/driver/update-trip",
            json={"tripId": created_trip_id, "status": "arrived_at_store"},
            headers=d2_headers,
        )
        assert unauthorized_update.status_code in (403, 404)

        statuses = [
            "arrived_at_store",
            "loaded",
            "in_transit",
            "arrived_at_site",
            "unloaded_completed",
        ]
        for st in statuses:
            update_res = await client.post(
                "/api/v1/driver/update-trip",
                json={
                    "tripId": created_trip_id,
                    "status": st,
                    "currentLat": 28.5355,
                    "currentLng": 77.3910,
                },
                headers=d1_headers,
            )
            assert update_res.status_code == 200, f"Failed updating to {st}: {update_res.text}"
            assert update_res.json()["data"]["newStatus"] == st

        async with PgSessionLocal() as db:
            completed_trip = (
                await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == created_trip_id))
            ).scalars().first()
            assert completed_trip.status == TripStatus.UNLOADED_COMPLETED
            assert completed_trip.completed_at is not None

        from app.schemas.driver import UpdateTripStatusRequest
        assert "otp" not in UpdateTripStatusRequest.model_fields, "OTP field unexpectedly found in schema"

        buyer_d_attempt = await client.get("/api/v1/driver/feed", headers=buyer_headers)
        assert buyer_d_attempt.status_code == 403


        adm_login = await client.post(
            "/api/v1/auth/login",
            json={"phone_or_email": "admin@staging.mh", "password": "AdminPass123!"},
        )
        assert adm_login.status_code == 200, adm_login.text
        admin_token = adm_login.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        adm_res = await client.get("/api/v1/admin/overview", headers=admin_headers)
        assert adm_res.status_code == 200
        adm_data = adm_res.json()["data"]
        assert "totalGmv" in adm_data
        assert "merchantRoster" in adm_data
        assert "liveCommodityRates" in adm_data
        assert any(m["id"] == merchant_id for m in adm_data["merchantRoster"])

        assert (await client.get("/api/v1/admin/overview", headers=buyer_headers)).status_code == 403
        assert (await client.get("/api/v1/admin/overview", headers=vendor_headers)).status_code == 403
        assert (await client.get("/api/v1/admin/overview", headers=d1_headers)).status_code == 403
