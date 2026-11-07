import asyncio
import httpx
from app.core.config import settings
from app.main import app


async def test_full_onboarding_flow():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("1. Submitting Vendor Onboarding Application...")
        vendor_payload = {
            "owner_name": "Test Yard Owner",
            "store_name": "Kakkanad Test Cement Yard",
            "email": "vendor.test@materialhub.in",
            "phone": "+919847099999",
            "password": "Password123!",
            "address": "Plot 10, Infopark Phase 2, Kakkanad",
            "pincode": "682030",
            "city": "Kochi",
            "main_category": "Cement & Aggregates",
            "gstin": "32AAACH7409R1ZZ",
            "pan_number": "AAACH7409R",
            "trade_license": "TR-2026-9999",
            "min_order_value": 2500,
            "proof_documents": {
                "gstCertificate": "/uploads/test_gst.pdf",
                "storePhoto": "/uploads/test_store.jpg"
            }
        }
        res_v = await client.post(f"{settings.API_V1_STR}/auth/onboard/vendor", json=vendor_payload)
        print("Vendor Onboard Status:", res_v.status_code)
        assert res_v.status_code == 200
        vendor_user_id = res_v.json()["data"]["user_id"]
        print("Vendor registered awaiting review. ID:", vendor_user_id)

        print("\n2. Attempting Vendor Login Before Admin Approval (Must be rejected with 403)...")
        res_v_login = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "vendor.test@materialhub.in", "password": "Password123!"}
        )
        print("Unverified Vendor Login Status:", res_v_login.status_code)
        assert res_v_login.status_code == 403
        print("Unverified vendor successfully blocked with message:", res_v_login.json()["detail"])

        print("\n3. Submitting Driver Onboarding Application...")
        driver_payload = {
            "name": "Test Carrier Driver",
            "email": "driver.test@materialhub.in",
            "phone": "+919447088888",
            "password": "Password123!",
            "vehicle_type": "Mini Commercial Truck (3 Ton)",
            "vehicle_reg_number": "KL-07-TEST-1234",
            "payload_capacity_tons": 3.5,
            "driver_license": "KL-07-2024-009999",
            "license_expiry": "2030-12-31",
            "city": "Kochi",
            "proof_documents": {
                "licenseDoc": "/uploads/test_license.pdf",
                "vehicleRc": "/uploads/test_rc.pdf"
            }
        }
        res_d = await client.post(f"{settings.API_V1_STR}/auth/onboard/driver", json=driver_payload)
        print("Driver Onboard Status:", res_d.status_code)
        assert res_d.status_code == 200
        driver_user_id = res_d.json()["data"]["user_id"]
        print("Driver registered awaiting review. ID:", driver_user_id)

        print("\n4. Attempting Driver Login Before Admin Approval (Must be rejected with 403)...")
        res_d_login = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "driver.test@materialhub.in", "password": "Password123!"}
        )
        print("Unverified Driver Login Status:", res_d_login.status_code)
        assert res_d_login.status_code == 403
        print("Unverified driver successfully blocked with message:", res_d_login.json()["detail"])

        print("\n5. Admin Logging in to Inspect Verification Queue...")
        res_admin = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "admin@materialhub.in", "password": "Gatsbyajayrenjith@9633"}
        )
        assert res_admin.status_code == 200
        admin_token = res_admin.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}

        res_v_queue = await client.get(f"{settings.API_V1_STR}/admin/verifications?role=vendor&status=pending", headers=headers)
        assert res_v_queue.status_code == 200
        print("Admin Pending Vendors count:", res_v_queue.json()["data"]["count"])
        assert any(item["userId"] == vendor_user_id for item in res_v_queue.json()["data"]["items"])

        res_d_queue = await client.get(f"{settings.API_V1_STR}/admin/verifications?role=driver&status=pending", headers=headers)
        assert res_d_queue.status_code == 200
        print("Admin Pending Drivers count:", res_d_queue.json()["data"]["count"])
        assert any(item["userId"] == driver_user_id for item in res_d_queue.json()["data"]["items"])

        print("\n6. Admin Approving Vendor...")
        res_v_approve = await client.post(
            f"{settings.API_V1_STR}/admin/verifications/{vendor_user_id}/decision",
            headers=headers,
            json={"approve": True}
        )
        print("Vendor Approval Status:", res_v_approve.status_code)
        assert res_v_approve.status_code == 200

        print("\n7. Vendor Logging in After Admin Approval (Must succeed with 200)...")
        res_v_login_after = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "vendor.test@materialhub.in", "password": "Password123!"}
        )
        print("Approved Vendor Login Status:", res_v_login_after.status_code)
        assert res_v_login_after.status_code == 200
        assert res_v_login_after.json()["data"]["role"] == "vendor"
        print("Vendor login successful! Access token received.")

        print("\n8. Admin Approving Driver...")
        res_d_approve = await client.post(
            f"{settings.API_V1_STR}/admin/verifications/{driver_user_id}/decision",
            headers=headers,
            json={"approve": True}
        )
        print("Driver Approval Status:", res_d_approve.status_code)
        assert res_d_approve.status_code == 200

        print("\n9. Driver Logging in After Admin Approval (Must succeed with 200)...")
        res_d_login_after = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "driver.test@materialhub.in", "password": "Password123!"}
        )
        print("Approved Driver Login Status:", res_d_login_after.status_code)
        assert res_d_login_after.status_code == 200
        assert res_d_login_after.json()["data"]["role"] == "driver"
        print("Driver login successful! Access token received.")

        print("\nALL VERIFICATION & ONBOARDING WORKFLOW CHECKS PASSED WITH 100% SUCCESS!")


if __name__ == "__main__":
    asyncio.run(test_full_onboarding_flow())

