import uuid

import pytest
from httpx import AsyncClient

from app.core.config import settings

pytestmark = pytest.mark.asyncio

API = settings.API_V1_STR


async def test_seeded_buyer_can_sign_in(async_client: AsyncClient):
    res = await async_client.post(
        f"{API}/auth/login", json={"phone_or_email": "buyer@materialhub.in", "password": "buyer123"}
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["access_token"]
    assert data["role"] == "buyer"


async def test_wrong_password_is_rejected_with_generic_message(async_client: AsyncClient):
    res = await async_client.post(
        f"{API}/auth/login", json={"phone_or_email": "buyer@materialhub.in", "password": "not-the-password"}
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Incorrect phone/email or password"


async def test_registration_rejects_short_password(async_client: AsyncClient):
    res = await async_client.post(
        f"{API}/auth/register",
        json={
            "name": "Short Pass",
            "email": f"short-{uuid.uuid4().hex[:8]}@example.com",
            "phone": "9000000001",
            "password": "short",
        },
    )
    assert res.status_code == 422


async def test_new_buyer_registers_and_gets_working_token(async_client: AsyncClient):
    email = f"buyer-{uuid.uuid4().hex[:8]}@example.com"
    res = await async_client.post(
        f"{API}/auth/register",
        json={
            "name": "New Buyer",
            "email": email,
            "phone": "9000000002",
            "password": "LongEnough123",
            "role": "buyer",
        },
    )
    assert res.status_code == 200
    token = res.json()["data"]["access_token"]

    me = await async_client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["data"]["email"] == email
    assert me.json()["data"]["role"] == "buyer"


async def test_duplicate_registration_is_refused(async_client: AsyncClient):
    payload = {
        "name": "Dup Buyer",
        "email": f"dup-{uuid.uuid4().hex[:8]}@example.com",
        "phone": "9000000003",
        "password": "LongEnough123",
    }
    first = await async_client.post(f"{API}/auth/register", json=payload)
    assert first.status_code == 200
    second = await async_client.post(f"{API}/auth/register", json=payload)
    assert second.status_code == 400
