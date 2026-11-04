"""Driver dispatch for MaterialHub.

When an order is confirmed, its delivery trip is offered to the nearest eligible
driver. Eligible means: verified, online, recent location, within the dispatch
radius of the store, and a vehicle that can carry the order's load. The offer
lasts OFFER_TIMEOUT_SECONDS. A decline or timeout moves the trip on to the next
driver. Searching continues until a driver accepts, the order is cancelled, or
the trip is taken.
"""

import logging
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.delivery import DeliveryTrip, TripStatus
from app.models.merchant import HardwareMerchant
from app.models.dispatch import DispatchOffer
from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

DISPATCH_RADIUS_KM = 15.0
OFFER_TIMEOUT_SECONDS = 120
# A driver's location older than this is not trusted for matching.
LOCATION_MAX_AGE = timedelta(minutes=10)

# Statuses in which a driver is already busy with a trip.
ACTIVE_TRIP_STATUSES = [
    TripStatus.ASSIGNED,
    TripStatus.ACCEPTED,
    TripStatus.ARRIVED_AT_STORE,
    TripStatus.LOADED,
    TripStatus.IN_TRANSIT,
    TripStatus.ARRIVED_AT_SITE,
]

# Orders that may be dispatched: paid or confirmed, not yet cancelled or delivered.
DISPATCHABLE_ORDER_STATUSES = [OrderStatus.CONFIRMED, OrderStatus.PACKING, OrderStatus.OUT_FOR_DELIVERY]


class DispatchError(Exception):
    """A dispatch action that the caller is not allowed to take right now."""

    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    """SQLite returns naive datetimes; treat them as UTC."""
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    import math

    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


_TON_PATTERN = re.compile(r"(\d+(?:\.\d+)?)\s*ton", re.IGNORECASE)


def parse_tons(text: Optional[str]) -> Optional[float]:
    """Read the tonnage out of a vehicle label such as 'Mini Commercial Truck (3.5 Ton)'."""
    if not text:
        return None
    match = _TON_PATTERN.search(text)
    return float(match.group(1)) if match else None


def driver_capacity_tons(driver: User) -> Optional[float]:
    if driver.payload_capacity_tons:
        return driver.payload_capacity_tons
    return parse_tons(driver.vehicle_type)


def required_tons(trip: DeliveryTrip) -> float:
    # An unreadable vehicle label is treated as the largest class, so the trip
    # is never offered to a vehicle that might be too small.
    return parse_tons(trip.vehicle_type) or 25.0


async def _busy_driver_ids(db: AsyncSession) -> set:
    res = await db.execute(
        select(DeliveryTrip.driver_id).where(
            DeliveryTrip.driver_id.is_not(None),
            DeliveryTrip.status.in_(ACTIVE_TRIP_STATUSES),
        )
    )
    return {row[0] for row in res.all()}


async def _previously_offered_driver_ids(db: AsyncSession, trip_id: str) -> set:
    res = await db.execute(
        select(DispatchOffer.driver_id).where(
            DispatchOffer.trip_id == trip_id,
            DispatchOffer.status.in_(["declined", "expired"]),
        )
    )
    return {row[0] for row in res.all()}


async def find_candidates(db: AsyncSession, trip: DeliveryTrip) -> List[Tuple[User, float]]:
    """Eligible drivers for a trip, nearest first, with their distance to the store."""
    if trip.pickup_lat is None or trip.pickup_lng is None:
        return []

    now = _now()
    res = await db.execute(
        select(User).where(
            User.role == UserRole.DRIVER,
            User.is_active.is_(True),
            User.is_verified.is_(True),
            User.is_online.is_(True),
            User.latitude.is_not(None),
            User.longitude.is_not(None),
        )
    )
    drivers = res.scalars().all()

    busy = await _busy_driver_ids(db)
    excluded = await _previously_offered_driver_ids(db, trip.id)
    need = required_tons(trip)

    candidates: List[Tuple[User, float]] = []
    for driver in drivers:
        if driver.id in busy or driver.id in excluded:
            continue
        seen_at = _aware(driver.location_updated_at)
        if seen_at is None or now - seen_at > LOCATION_MAX_AGE:
            continue
        capacity = driver_capacity_tons(driver)
        if capacity is None or capacity < need:
            continue
        distance = haversine_km(trip.pickup_lat, trip.pickup_lng, driver.latitude, driver.longitude)
        if distance <= DISPATCH_RADIUS_KM:
            candidates.append((driver, distance))

    candidates.sort(key=lambda item: item[1])
    return candidates


async def _active_offer(db: AsyncSession, trip_id: str) -> Optional[DispatchOffer]:
    res = await db.execute(
        select(DispatchOffer).where(DispatchOffer.trip_id == trip_id, DispatchOffer.status == "offered")
    )
    for offer in res.scalars().all():
        if _aware(offer.expires_at) > _now():
            return offer
    return None


async def _notify_driver(driver_id: str, payload: Dict[str, Any]) -> None:
    from app.core.websocket import manager, EventType

    try:
        await manager.send_personal_message({"event": EventType.DISPATCH_OFFER, "data": payload}, driver_id)
    except Exception:
        logger.warning("Could not push dispatch offer to driver %s", driver_id)


async def _ensure_pickup_location(db: AsyncSession, trip: DeliveryTrip) -> None:
    """Copy the store's coordinates onto the trip if the store has added them since the order."""
    if trip.pickup_lat is not None and trip.pickup_lng is not None:
        return
    order = (await db.execute(select(Order).where(Order.id == trip.order_id))).scalars().first()
    if order is None:
        return
    store = (await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == order.merchant_id))).scalars().first()
    if store and store.latitude is not None and store.longitude is not None:
        trip.pickup_lat = store.latitude
        trip.pickup_lng = store.longitude
        if trip.dispatch_status == "no_store_location":
            trip.dispatch_status = "searching"


async def dispatch_trip(db: AsyncSession, trip: DeliveryTrip) -> Optional[DispatchOffer]:
    """Offer the trip to the next eligible driver, unless it is already offered or taken."""
    if trip.status != TripStatus.UNASSIGNED or trip.driver_id is not None:
        return None

    await _ensure_pickup_location(db, trip)
    if trip.pickup_lat is None or trip.pickup_lng is None:
        trip.dispatch_status = "no_store_location"
        await db.commit()
        return None

    existing = await _active_offer(db, trip.id)
    if existing:
        return existing

    candidates = await find_candidates(db, trip)
    if not candidates:
        trip.dispatch_status = "searching"
        await db.commit()
        return None

    driver, distance = candidates[0]
    offer = DispatchOffer(
        id=f"off_{uuid.uuid4().hex[:10]}",
        trip_id=trip.id,
        driver_id=driver.id,
        status="offered",
        distance_km=round(distance, 2),
        expires_at=_now() + timedelta(seconds=OFFER_TIMEOUT_SECONDS),
    )
    db.add(offer)
    trip.dispatch_status = "searching"
    await db.commit()

    await _notify_driver(driver.id, {
        "offerId": offer.id,
        "tripId": trip.id,
        "orderId": trip.order_id,
        "pickupAddress": trip.pickup_address,
        "dropAddress": trip.drop_address,
        "distanceToPickupKm": offer.distance_km,
        "vehicleRequired": trip.vehicle_type,
        "tripFare": trip.trip_fare,
        "secondsToRespond": OFFER_TIMEOUT_SECONDS,
    })
    logger.info("Dispatch offer %s: trip=%s driver=%s distance=%.2fkm", offer.id, trip.id, driver.id, distance)
    return offer


async def run_cycle(db: AsyncSession) -> Dict[str, int]:
    """One pass of the dispatch loop: expire stale offers and keep unassigned trips moving."""
    now = _now()
    expired = 0

    offers_res = await db.execute(select(DispatchOffer).where(DispatchOffer.status == "offered"))
    for offer in offers_res.scalars().all():
        if _aware(offer.expires_at) <= now:
            offer.status = "expired"
            offer.responded_at = now
            expired += 1
    await db.commit()

    trips_res = await db.execute(
        select(DeliveryTrip)
        .join(Order, Order.id == DeliveryTrip.order_id)
        .where(
            DeliveryTrip.status == TripStatus.UNASSIGNED,
            DeliveryTrip.driver_id.is_(None),
            Order.status.in_(DISPATCHABLE_ORDER_STATUSES),
        )
        .limit(200)
    )
    offered = 0
    for trip in trips_res.scalars().all():
        if await dispatch_trip(db, trip):
            offered += 1
    return {"expired": expired, "offered": offered}


async def get_driver_offers(db: AsyncSession, driver_id: str) -> List[Dict[str, Any]]:
    res = await db.execute(
        select(DispatchOffer, DeliveryTrip)
        .join(DeliveryTrip, DeliveryTrip.id == DispatchOffer.trip_id)
        .where(DispatchOffer.driver_id == driver_id, DispatchOffer.status == "offered")
    )
    now = _now()
    offers = []
    for offer, trip in res.all():
        expires = _aware(offer.expires_at)
        if expires <= now:
            continue
        offers.append({
            "offerId": offer.id,
            "tripId": trip.id,
            "orderId": trip.order_id,
            "pickupAddress": trip.pickup_address,
            "dropAddress": trip.drop_address,
            "distanceToPickupKm": offer.distance_km,
            "vehicleRequired": trip.vehicle_type,
            "tripFare": trip.trip_fare,
            "secondsLeft": max(0, int((expires - now).total_seconds())),
        })
    return offers


async def accept_offer(db: AsyncSession, offer_id: str, driver_id: str) -> Dict[str, Any]:
    offer = (await db.execute(select(DispatchOffer).where(DispatchOffer.id == offer_id))).scalars().first()
    if not offer or offer.driver_id != driver_id:
        raise DispatchError(404, "Offer not found")
    if offer.status != "offered":
        raise DispatchError(409, "This offer is no longer available")

    now = _now()
    if _aware(offer.expires_at) <= now:
        offer.status = "expired"
        offer.responded_at = now
        await db.commit()
        raise DispatchError(409, "This offer has expired")

    driver = (await db.execute(select(User).where(User.id == driver_id))).scalars().first()

    # Claim the trip atomically: only succeeds while it is still unassigned.
    claim = await db.execute(
        update(DeliveryTrip)
        .where(
            DeliveryTrip.id == offer.trip_id,
            DeliveryTrip.driver_id.is_(None),
            DeliveryTrip.status == TripStatus.UNASSIGNED,
        )
        .values(
            driver_id=driver_id,
            status=TripStatus.ASSIGNED,
            dispatch_status="assigned",
            vehicle_type=driver.vehicle_type or DeliveryTrip.vehicle_type,
            vehicle_reg_number=driver.vehicle_reg_number,
        )
    )
    if claim.rowcount == 0:
        offer.status = "cancelled"
        offer.responded_at = now
        await db.commit()
        raise DispatchError(409, "Another driver has already taken this trip")

    offer.status = "accepted"
    offer.responded_at = now

    others = await db.execute(
        select(DispatchOffer).where(
            DispatchOffer.trip_id == offer.trip_id,
            DispatchOffer.id != offer.id,
            DispatchOffer.status == "offered",
        )
    )
    for other in others.scalars().all():
        other.status = "cancelled"
        other.responded_at = now

    trip = (await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == offer.trip_id))).scalars().first()
    order = (await db.execute(select(Order).where(Order.id == trip.order_id))).scalars().first()
    await db.commit()

    await _notify_buyer_assigned(order, trip, driver)
    return {"tripId": trip.id, "orderId": trip.order_id, "status": trip.status.value}


async def decline_offer(db: AsyncSession, offer_id: str, driver_id: str) -> Dict[str, Any]:
    offer = (await db.execute(select(DispatchOffer).where(DispatchOffer.id == offer_id))).scalars().first()
    if not offer or offer.driver_id != driver_id:
        raise DispatchError(404, "Offer not found")
    if offer.status != "offered":
        raise DispatchError(409, "This offer is no longer available")

    offer.status = "declined"
    offer.responded_at = _now()
    trip = (await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == offer.trip_id))).scalars().first()
    await db.commit()

    # Pass the trip straight on to the next driver.
    await dispatch_trip(db, trip)
    return {"offerId": offer.id, "status": "declined"}


async def _notify_buyer_assigned(order: Optional[Order], trip: DeliveryTrip, driver: Optional[User]) -> None:
    if order is None:
        return
    from app.core.websocket import manager, EventType

    try:
        await manager.send_personal_message({
            "event": EventType.ORDER_STATUS_UPDATE,
            "data": {
                "orderId": order.id,
                "orderStatus": order.status.value,
                "tripId": trip.id,
                "tripStatus": trip.status.value,
                "message": "A driver has accepted your delivery",
                "driver": {
                    "name": driver.name if driver else None,
                    "vehicleType": trip.vehicle_type,
                    "regNumber": trip.vehicle_reg_number,
                },
            },
        }, order.user_id)
    except Exception:
        logger.warning("Could not notify buyer %s of driver assignment", order.user_id)
