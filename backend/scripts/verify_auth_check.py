import asyncio
import httpx
from app.core.config import settings
from app.main import app


async def test_auth():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("Testing Admin Login with admin@materialhub.in...")
        resp = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "admin@materialhub.in", "password": "Gatsbyajayrenjith@9633"}
        )
        print("Status code:", resp.status_code)
        print("Response:", resp.json())
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        token = resp.json()["data"]["access_token"]
        role = resp.json()["data"]["role"]
        print(f"Login success! Role: {role}, Token generated: {token[:20]}...")

        print("\nTesting Admin Login with ajayrenjith.work@gmail.com...")
        resp2 = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "ajayrenjith.work@gmail.com", "password": "Gatsbyajayrenjith@9633"}
        )
        print("Status code:", resp2.status_code)
        assert resp2.status_code == 200
        print("Personal admin login success!")

        print("\nTesting Authenticated Admin Endpoint /admin/overview with JWT token...")
        headers = {"Authorization": f"Bearer {token}"}
        resp_overview = await client.get(f"{settings.API_V1_STR}/admin/overview", headers=headers)
        print("Overview status code:", resp_overview.status_code)
        print("Overview payload:", resp_overview.json())
        assert resp_overview.status_code == 200

        print("\nTesting Non-Admin Rejection (Invalid credentials)...")
        bad_resp = await client.post(
            f"{settings.API_V1_STR}/auth/login",
            json={"phone_or_email": "admin@materialhub.in", "password": "wrongpassword"}
        )
        print("Bad login status code:", bad_resp.status_code)
        assert bad_resp.status_code == 401
        print("All verification checks passed cleanly!")


if __name__ == "__main__":
    asyncio.run(test_auth())
