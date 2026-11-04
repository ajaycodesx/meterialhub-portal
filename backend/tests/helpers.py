"""Shared helpers that drive the real marketplace and dispatch flow through the API."""

from httpx import AsyncClient
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token
from app.services.dispatch_service import run_cycle

API = settings.API_V1_STR
STORE_LAT, STORE_LNG = 10.0159, 76.3419


def auth(subject: str) -> dict:
    return {"Authorization": f"Bearer {create_access_token(subject=subject)}"}


def cash_order_body(quantity: int = 1) -> dict:
    return {
        "merchantId": "m1",
        "items": [{"productId": "p1", "quantity": quantity}],
        "deliveryAddress": "Site 4",
        "pincode": "682030",
        "siteConstraints": {"roadWidth": "12ft+", "craneNeeded": False, "unloadingTimeSlot": "Morning"},
    }


async def place_cash_order(client: AsyncClient, quantity: int = 1) -> str:
    res = await client.post(f"{API}/buyer/orders", json=cash_order_body(quantity), headers=auth("u_buyer_1"))
    assert res.status_code == 200, res.text
    return res.json()["data"]["orderId"]


async def release_driver_trips(driver_subject: str) -> None:
    """Test-only: close trips still open for this driver from earlier tests.

    A driver with an active trip is correctly treated as busy by dispatch, so each
    dispatch test starts from a driver with nothing in progress.
    """
    from sqlalchemy import update
    from app.models.delivery import DeliveryTrip, TripStatus
    from app.services.dispatch_service import ACTIVE_TRIP_STATUSES

    async with AsyncSessionLocal() as session:
        await session.execute(
            update(DeliveryTrip)
            .where(DeliveryTrip.driver_id == driver_subject, DeliveryTrip.status.in_(ACTIVE_TRIP_STATUSES))
            .values(status=TripStatus.UNLOADED_COMPLETED)
        )
        await session.commit()


async def isolate_driver(driver_subject: str) -> None:
    """Test-only: make this driver the only one dispatch can choose.

    Drivers created by other tests stay online in the shared test database, and
    dispatch correctly offers to the nearest of them. Taking them offline keeps
    each scenario's expected driver deterministic.
    """
    from sqlalchemy import update
    from app.models.user import User, UserRole

    async with AsyncSessionLocal() as session:
        await session.execute(
            update(User)
            .where(User.role == UserRole.DRIVER, User.id != driver_subject)
            .values(is_online=False)
        )
        await session.commit()
    await release_driver_trips(driver_subject)


async def dispatch_to_driver(client: AsyncClient, driver_subject: str = "u_driver_1") -> tuple:
    """Set up store and driver locations, place an order, and accept the dispatch offer.

    Returns (order_id, trip_id).
    """
    await isolate_driver(driver_subject)
    store = await client.put(
        f"{API}/vendor/profile",
        json={"latitude": STORE_LAT, "longitude": STORE_LNG},
        headers=auth("u_vendor_1"),
    )
    assert store.status_code == 200, store.text

    location = await client.post(
        f"{API}/driver/location",
        json={"latitude": STORE_LAT + 0.001, "longitude": STORE_LNG + 0.001},
        headers=auth(driver_subject),
    )
    assert location.status_code == 200, location.text

    feed = await client.get(f"{API}/driver/feed", headers=auth(driver_subject))
    if not feed.json()["data"]["isOnline"]:
        toggled = await client.post(f"{API}/driver/toggle-online", headers=auth(driver_subject))
        assert toggled.status_code == 200, toggled.text

    order_id = await place_cash_order(client)

    async with AsyncSessionLocal() as session:
        await run_cycle(session)

    offers = await client.get(f"{API}/driver/offers", headers=auth(driver_subject))
    assert offers.status_code == 200, offers.text
    offer = next(o for o in offers.json()["data"] if o["orderId"] == order_id)

    accepted = await client.post(
        f"{API}/driver/offers/{offer['offerId']}/accept",
        headers=auth(driver_subject),
    )
    assert accepted.status_code == 200, accepted.text
    return order_id, offer["tripId"]


def use_simulated_gateway(monkeypatch) -> None:
    """Test-only: a real Razorpay payment needs a customer to pay in checkout, so tests
    that confirm payments run the gateway in simulation mode. Create-order still runs
    against Razorpay's test API in the other tests."""
    from app.services.payment_service import payment_service

    monkeypatch.setattr(payment_service, "simulation_mode", True)
