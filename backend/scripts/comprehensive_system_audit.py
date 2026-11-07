import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.merchant import HardwareMerchant
from app.models.commodity_rate import CommodityRate
from app.models.order import Order
from app.models.delivery import DeliveryTrip
from sqlalchemy import select, delete, text
from app.core.security import get_password_hash

async def run_audit():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver/api/v1") as client:
        print("[1] Verifying Clean Initial State...")
        home_res = await client.get("/buyer/home")
        assert home_res.status_code == 200, f"buyer/home failed: {home_res.text}"
        home_data = home_res.json()["data"]
        assert len(home_data.get("categories", [])) == 0, "Categories must be 0 in clean state"
        assert len(home_data.get("trendingDeals", [])) == 0, "Trending deals must be 0 in clean state"
        assert len(home_data.get("nearbyMerchants", [])) == 0, "Nearby merchants must be 0 in clean state"
        assert len(home_data.get("rateTicker", [])) == 0, "Rate ticker must be 0 in clean state"
        print(" -> Buyer home composite is completely clean and empty (0 mock records).")

        catalog_res = await client.get("/buyer/catalog")
        assert catalog_res.status_code == 200, f"buyer/catalog failed: {catalog_res.text}"
        catalog_data = catalog_res.json()["data"]
        assert len(catalog_data.get("products", [])) == 0, "Products must be 0"
        assert len(catalog_data.get("merchants", [])) == 0, "Merchants must be 0"
        print(" -> Buyer catalog composite is completely clean and empty (0 mock records).")

        print("\n[2] Testing Admin Authentication...")
        admin_login = await client.post("/auth/login", json={
            "phone_or_email": "admin@materialhub.in",
            "password": "Gatsbyajayrenjith@9633"
        })
        assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
        admin_token = admin_login.json()["data"]["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print(" -> Admin authenticated successfully.")

        overview_res = await client.get("/admin/overview", headers=admin_headers)
        assert overview_res.status_code == 200, f"Admin overview failed: {overview_res.text}"
        overview_data = overview_res.json()["data"]
        metrics = overview_data.get("metrics", {})
        assert metrics.get("gmvTotal", 0) == 0, "GMV must be 0"
        assert metrics.get("activeOrders", 0) == 0, "Active orders must be 0"
        assert metrics.get("tonnageDispatched", 0) == 0, "Tonnage dispatched must be 0"
        assert metrics.get("inventoryAlerts", 0) == 0, "Inventory alerts must be 0"
        print(" -> Admin platform metrics report genuine 0 values (no dummy fallback numbers).")

        vendors_res = await client.get("/admin/verifications?role=vendor&status=pending", headers=admin_headers)
        assert vendors_res.status_code == 200, f"Vendors queue failed: {vendors_res.text}"
        vendor_items = vendors_res.json()["data"]["items"]
        assert len(vendor_items) == 0, "Initial vendor queue must be empty"

        drivers_res = await client.get("/admin/verifications?role=driver&status=pending", headers=admin_headers)
        assert drivers_res.status_code == 200, f"Drivers queue failed: {drivers_res.text}"
        driver_items = drivers_res.json()["data"]["items"]
        assert len(driver_items) == 0, "Initial driver queue must be empty"
        print(" -> Verification queue is empty.")

        print("\n[3] Testing Vendor Onboarding & Verification Gatekeeping...")
        vendor_email = "audit.vendor@materialhub.in"
        vendor_onboard = await client.post("/auth/onboard/vendor", json={
            "owner_name": "Suresh Babu",
            "store_name": "Kakkanad Building Mart",
            "email": vendor_email,
            "phone": "+919847111222",
            "password": "VendorSecurePassword123!",
            "address": "Yard 4, Infopark Expressway",
            "pincode": "682042",
            "city": "Kochi",
            "main_category": "Cement & Aggregates",
            "gstin": "32AAACH7409R1ZZ",
            "pan_number": "AAACH7409R",
            "trade_license": "TR-KOCHI-9921",
            "min_order_value": 2500,
            "proof_documents": {
                "gstCertificate": "/uploads/test_gst_cert.pdf",
                "storePhoto": "/uploads/test_store_front.jpg"
            }
        })
        assert vendor_onboard.status_code == 200, f"Vendor onboarding failed: {vendor_onboard.text}"
        print(" -> Vendor registered with statutory details and proofs.")

        blocked_vendor_login = await client.post("/auth/login", json={
            "phone_or_email": vendor_email,
            "password": "VendorSecurePassword123!"
        })
        assert blocked_vendor_login.status_code == 403, f"Expected 403 for unverified vendor, got: {blocked_vendor_login.status_code}"
        print(" -> Gatekeeper successfully blocked unverified vendor from signing in (403 Forbidden).")

        print("\n[4] Testing Driver Onboarding & Verification Gatekeeping...")
        driver_email = "audit.driver@materialhub.in"
        driver_onboard = await client.post("/auth/onboard/driver", json={
            "name": "Pradeep Kumar",
            "email": driver_email,
            "phone": "+919847333444",
            "password": "DriverSecurePassword123!",
            "vehicle_type": "Mini Commercial Truck (3 Ton)",
            "vehicle_reg_number": "KL-07-BZ-5566",
            "payload_capacity_tons": 3.0,
            "driver_license": "DL-1420110099887",
            "city": "Kochi",
            "proof_documents": {
                "licenseDoc": "/uploads/test_license.pdf",
                "vehicleRc": "/uploads/test_rc.pdf"
            }
        })
        assert driver_onboard.status_code == 200, f"Driver onboarding failed: {driver_onboard.text}"
        print(" -> Driver registered with vehicle details and license proofs.")

        blocked_driver_login = await client.post("/auth/login", json={
            "phone_or_email": driver_email,
            "password": "DriverSecurePassword123!"
        })
        assert blocked_driver_login.status_code == 403, f"Expected 403 for unverified driver, got: {blocked_driver_login.status_code}"
        print(" -> Gatekeeper successfully blocked unverified driver from signing in (403 Forbidden).")

        print("\n[5] Inspecting Admin Queue & Approving Applicants...")
        vendors_res = await client.get("/admin/verifications?role=vendor&status=pending", headers=admin_headers)
        assert vendors_res.status_code == 200, f"Vendor queue failed: {vendors_res.text}"
        vendors_queue = vendors_res.json()["data"]["items"]

        drivers_res = await client.get("/admin/verifications?role=driver&status=pending", headers=admin_headers)
        assert drivers_res.status_code == 200, f"Driver queue failed: {drivers_res.text}"
        drivers_queue = drivers_res.json()["data"]["items"]

        assert len(vendors_queue) == 1, f"Expected 1 pending vendor, got: {len(vendors_queue)}"
        assert len(drivers_queue) == 1, f"Expected 1 pending driver, got: {len(drivers_queue)}"

        pending_vendor = vendors_queue[0]
        assert pending_vendor["gstin"] == "32AAACH7409R1ZZ"
        assert pending_vendor["panNumber"] == "AAACH7409R"
        assert "gstCertificate" in pending_vendor.get("proofDocuments", {})
        print(f" -> Admin inspected pending vendor: {pending_vendor['storeName']} (GST: {pending_vendor['gstin']}).")

        pending_driver = drivers_queue[0]
        assert pending_driver["vehicleRegNumber"] == "KL-07-BZ-5566"
        assert pending_driver["payloadCapacityTons"] == 3.0
        assert "licenseDoc" in pending_driver.get("proofDocuments", {})
        print(f" -> Admin inspected pending driver: {pending_driver['name']} (Plate: {pending_driver['vehicleRegNumber']}).")

        approve_vendor = await client.post(
            f"/admin/verifications/{pending_vendor['userId']}/decision",
            headers=admin_headers,
            json={"approve": True, "reason": None}
        )
        assert approve_vendor.status_code == 200, f"Vendor approval failed: {approve_vendor.text}"
        print(" -> Admin approved vendor application.")

        approve_driver = await client.post(
            f"/admin/verifications/{pending_driver['userId']}/decision",
            headers=admin_headers,
            json={"approve": True, "reason": None}
        )
        assert approve_driver.status_code == 200, f"Driver approval failed: {approve_driver.text}"
        print(" -> Admin approved driver application.")

        print("\n[6] Verifying Authorized Sign-In Post-Approval...")
        vendor_login_ok = await client.post("/auth/login", json={
            "phone_or_email": vendor_email,
            "password": "VendorSecurePassword123!"
        })
        assert vendor_login_ok.status_code == 200, f"Approved vendor login failed: {vendor_login_ok.text}"
        vendor_token = vendor_login_ok.json()["data"]["access_token"]
        vendor_dash = await client.get("/vendor/dashboard", headers={"Authorization": f"Bearer {vendor_token}"})
        assert vendor_dash.status_code == 200, f"Vendor dashboard failed: {vendor_dash.text}"
        print(" -> Approved vendor signed in and accessed vendor console.")

        driver_login_ok = await client.post("/auth/login", json={
            "phone_or_email": driver_email,
            "password": "DriverSecurePassword123!"
        })
        assert driver_login_ok.status_code == 200, f"Approved driver login failed: {driver_login_ok.text}"
        driver_token = driver_login_ok.json()["data"]["access_token"]
        driver_feed = await client.get("/driver/feed", headers={"Authorization": f"Bearer {driver_token}"})
        assert driver_feed.status_code == 200, f"Driver feed failed: {driver_feed.text}"
        print(" -> Approved driver signed in and accessed driver fleet feed.")

        print("\n[7] Testing Dynamic Commodity Rates Stream...")
        async with AsyncSessionLocal() as session:
            rate = CommodityRate(
                id="rate_fe550d_test",
                material_name="TMT Steel Fe550D",
                unit="Ton",
                wholesale_rate=58500.0,
                retail_rate=61000.0,
                change_percent=0.42,
                trend="up"
            )
            session.add(rate)
            await session.commit()

        updated_home = await client.get("/buyer/home")
        updated_rates = updated_home.json()["data"].get("rateTicker", [])
        assert len(updated_rates) == 1, f"Expected 1 rate in ticker, got: {len(updated_rates)}"
        assert updated_rates[0]["materialName"] == "TMT Steel Fe550D"
        assert updated_rates[0]["wholesaleRate"] == 58500.0
        print(" -> Commodity rate dynamically updated in buyer home stream from PostgreSQL database.")

    print("\n[8] Cleaning database to hold ONLY admin credentials...")
    async with AsyncSessionLocal() as session:
        await session.execute(delete(AuditLog))
        await session.execute(delete(DeliveryTrip))
        await session.execute(delete(Order))
        await session.execute(delete(CommodityRate))
        await session.execute(delete(HardwareMerchant))
        await session.execute(text("DELETE FROM users WHERE role != 'ADMIN'"))
        await session.commit()

        user_count = (await session.execute(text("SELECT count(*) FROM users"))).scalar()
        merchant_count = (await session.execute(text("SELECT count(*) FROM merchants"))).scalar()
        orders_count = (await session.execute(text("SELECT count(*) FROM orders"))).scalar()
        rates_count = (await session.execute(text("SELECT count(*) FROM commodity_rates"))).scalar()

        print(f" -> Database Final Counts: users={user_count} (Admins only), merchants={merchant_count}, orders={orders_count}, commodity_rates={rates_count}")
        assert user_count == 2, f"Expected exactly 2 admin users, found: {user_count}"
        assert merchant_count == 0, f"Expected 0 merchants, found: {merchant_count}"
        assert orders_count == 0, f"Expected 0 orders, found: {orders_count}"
        assert rates_count == 0, f"Expected 0 rates, found: {rates_count}"

    print("\n=== SYSTEM INTEGRATION AUDIT PASSED 100% ===")

if __name__ == "__main__":
    from app.models.audit_log import AuditLog
    asyncio.run(run_audit())
