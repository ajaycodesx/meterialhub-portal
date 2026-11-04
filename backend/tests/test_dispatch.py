"""Dispatch rules: who is offered a trip, what happens on decline or timeout, and races."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy import update

from app.core.database import AsyncSessionLocal
from app.models.dispatch import DispatchOffer
from app.models.user import User, UserRole
from app.services.dispatch_service import run_cycle
from tests.helpers import API, STORE_LAT, STORE_LNG, auth, isolate_driver, place_cash_order

pytestmark = pytest.mark.asyncio


async def make_driver(lat: float, lng: float, capacity: float, online: bool = True) -> str:
    """Create a verified driver directly in the test database. Returns the driver id."""
    driver_id = f"u_driver_{uuid.uuid4().hex[:8]}"
    async with AsyncSessionLocal() as session:
        session.add(User(
            id=driver_id,
            email=f"{driver_id}@test.local",
            phone=f"+91{uuid.uuid4().int % 10**10:010d}",
            name=f"Test driver {driver_id}",
            hashed_password="not-used",
            role=UserRole.DRIVER,
            vehicle_type="Mini Commercial Truck (3 Ton)",
            vehicle_reg_number="KL-TEST-0001",
            payload_capacity_tons=capacity,
            is_verified=True,
            is_active=True,
            is_online=online,
            latitude=lat,
            longitude=lng,
            location_updated_at=datetime.now(timezone.utc),
        ))
        await session.commit()
    return driver_id


async def locate(client: AsyncClient, subject: str, lat: float, lng: float) -> None:
    """Send a live position for a driver who is online and ready for dispatch."""
    res = await client.post(f"{API}/driver/location", json={"latitude": lat, "longitude": lng}, headers=auth(subject))
    assert res.status_code == 200, res.text
    feed = await client.get(f"{API}/driver/feed", headers=auth(subject))
    if not feed.json()["data"]["isOnline"]:
        toggled = await client.post(f"{API}/driver/toggle-online", headers=auth(subject))
        assert toggled.status_code == 200, toggled.text


async def set_store_location(client: AsyncClient) -> None:
    res = await client.put(
        f"{API}/vendor/profile", json={"latitude": STORE_LAT, "longitude": STORE_LNG}, headers=auth("u_vendor_1")
    )
    assert res.status_code == 200, res.text


async def offers_for(client: AsyncClient, subject: str, order_id: str) -> list:
    res = await client.get(f"{API}/driver/offers", headers=auth(subject))
    assert res.status_code == 200, res.text
    return [o for o in res.json()["data"] if o["orderId"] == order_id]


async def cycle() -> None:
    async with AsyncSessionLocal() as session:
        await run_cycle(session)


async def test_declined_offer_passes_to_the_next_driver(async_client: AsyncClient):
    await isolate_driver("u_driver_1")
    await set_store_location(async_client)
    nearest = "u_driver_1"
    await locate(async_client, nearest, STORE_LAT + 0.001, STORE_LNG + 0.001)
    farther = await make_driver(STORE_LAT + 0.02, STORE_LNG + 0.02, capacity=3.5)

    order_id = await place_cash_order(async_client)
    await cycle()

    first = await offers_for(async_client, nearest, order_id)
    assert len(first) == 1
    assert await offers_for(async_client, farther, order_id) == []

    declined = await async_client.post(
        f"{API}/driver/offers/{first[0]['offerId']}/decline", headers=auth(nearest)
    )
    assert declined.status_code == 200

    # The trip is offered on straight away to the next driver.
    assert len(await offers_for(async_client, farther, order_id)) == 1


async def test_expired_offer_moves_on_to_the_next_driver(async_client: AsyncClient):
    await isolate_driver("u_driver_1")
    await set_store_location(async_client)
    nearest = "u_driver_1"
    await locate(async_client, nearest, STORE_LAT + 0.001, STORE_LNG + 0.001)
    farther = await make_driver(STORE_LAT + 0.02, STORE_LNG + 0.02, capacity=3.5)

    order_id = await place_cash_order(async_client)
    await cycle()
    first = await offers_for(async_client, nearest, order_id)
    assert len(first) == 1

    # Simulate the two minutes running out without a response.
    async with AsyncSessionLocal() as session:
        await session.execute(
            update(DispatchOffer)
            .where(DispatchOffer.id == first[0]["offerId"])
            .values(expires_at=datetime.now(timezone.utc) - timedelta(seconds=1))
        )
        await session.commit()

    await cycle()
    assert await offers_for(async_client, nearest, order_id) == []
    assert len(await offers_for(async_client, farther, order_id)) == 1


async def test_driver_outside_the_15_km_radius_is_not_offered(async_client: AsyncClient):
    await isolate_driver("u_driver_1")
    await set_store_location(async_client)
    far = await make_driver(STORE_LAT + 0.3, STORE_LNG + 0.3, capacity=3.5)  # roughly 40 km away

    order_id = await place_cash_order(async_client)
    await cycle()
    assert await offers_for(async_client, far, order_id) == []


async def test_driver_whose_truck_is_too_small_is_not_offered(async_client: AsyncClient):
    await isolate_driver("u_driver_1")
    await set_store_location(async_client)
    small = await make_driver(STORE_LAT + 0.001, STORE_LNG + 0.001, capacity=0.5)

    order_id = await place_cash_order(async_client, quantity=10)  # a 500 kg load needs a 1 ton vehicle
    await cycle()
    assert await offers_for(async_client, small, order_id) == []


async def test_only_one_driver_can_accept_a_trip(async_client: AsyncClient):
    await isolate_driver("u_driver_1")
    await set_store_location(async_client)
    first_driver = "u_driver_1"
    await locate(async_client, first_driver, STORE_LAT + 0.001, STORE_LNG + 0.001)
    second_driver = await make_driver(STORE_LAT + 0.002, STORE_LNG + 0.002, capacity=3.5)

    order_id = await place_cash_order(async_client)
    await cycle()
    offer = (await offers_for(async_client, first_driver, order_id))[0]

    accepted = await async_client.post(f"{API}/driver/offers/{offer['offerId']}/accept", headers=auth(first_driver))
    assert accepted.status_code == 200

    # The second driver had no offer for this trip, so accepting another offer id must fail.
    intruder = await async_client.post(f"{API}/driver/offers/{offer['offerId']}/accept", headers=auth(second_driver))
    assert intruder.status_code in [403, 404]

    # The trip is no longer offered to anyone.
    assert await offers_for(async_client, second_driver, order_id) == []
