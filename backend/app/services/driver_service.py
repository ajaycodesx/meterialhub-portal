from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.delivery import DeliveryTrip, TripStatus
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.services import dispatch_service
from app.schemas.driver import (
    DriverFeedCompositeResponse,
    DriverProfileResponse,
    DriverProfileUpdateRequest,
    DriverTripHistoryItem,
    DriverExceptionReportRequest,
    DriverLocationUpdateRequest,
    UpdateTripStatusRequest
)


# Order in which a trip moves from dispatch to delivery.
TRIP_PROGRESSION = [
    TripStatus.UNASSIGNED,
    TripStatus.ASSIGNED,
    TripStatus.ACCEPTED,
    TripStatus.ARRIVED_AT_STORE,
    TripStatus.LOADED,
    TripStatus.IN_TRANSIT,
    TripStatus.ARRIVED_AT_SITE,
    TripStatus.UNLOADED_COMPLETED,
]

# Statuses a driver may set directly. UNLOADED_COMPLETED is intentionally absent:
# it is only reachable through customer OTP verification.
DRIVER_SETTABLE_STATUSES = [
    TripStatus.ACCEPTED,
    TripStatus.ARRIVED_AT_STORE,
    TripStatus.LOADED,
    TripStatus.IN_TRANSIT,
    TripStatus.ARRIVED_AT_SITE,
]

# Orders a driver may pick up. Online-payment orders stay PENDING until paid.
DISPATCHABLE_ORDER_STATUSES = [
    OrderStatus.CONFIRMED,
    OrderStatus.PACKING,
    OrderStatus.OUT_FOR_DELIVERY,
]


class DriverService:

    @staticmethod
    async def get_driver_feed_composite(
        db: AsyncSession,
        driver_id: str
    ) -> DriverFeedCompositeResponse:
        driver = (await db.execute(select(User).where(User.id == driver_id))).scalars().first()
        if driver is None:
            raise HTTPException(status_code=404, detail="Driver not found")

        active_trip_obj = (await db.execute(
            select(DeliveryTrip).where(
                DeliveryTrip.driver_id == driver_id,
                DeliveryTrip.status.in_(dispatch_service.ACTIVE_TRIP_STATUSES),
            )
        )).scalars().first()

        all_trips = (await db.execute(
            select(DeliveryTrip).where(DeliveryTrip.driver_id == driver_id)
        )).scalars().all()
        completed = [t for t in all_trips if t.status == TripStatus.UNLOADED_COMPLETED]
        today_earnings = sum(t.trip_fare + t.tip_amount for t in completed)

        active_trip_dict = None
        if active_trip_obj:
            active_trip_dict = {
                "tripId": active_trip_obj.id,
                "orderId": active_trip_obj.order_id,
                "status": active_trip_obj.status.value,
                "pickupAddress": active_trip_obj.pickup_address,
                "dropAddress": active_trip_obj.drop_address,
                "vehicleType": active_trip_obj.vehicle_type,
                "tripFare": active_trip_obj.trip_fare,
            }

        offers = await dispatch_service.get_driver_offers(db, driver_id)

        return DriverFeedCompositeResponse(
            driverId=driver_id,
            driverName=driver.name,
            vehicleType=driver.vehicle_type,
            vehicleRegNumber=driver.vehicle_reg_number,
            isOnline=bool(driver.is_online),
            todayEarnings=round(today_earnings, 2),
            todayTripsCount=len(completed),
            activeTrip=active_trip_dict,
            availableTrips=offers,
            weeklyPayoutSummary={
                "weekTotal": round(today_earnings, 2),
                "completedTrips": len(completed),
            }
        )

    @staticmethod
    async def get_driver_profile(
        db: AsyncSession,
        driver_id: str
    ) -> DriverProfileResponse:
        driver = (await db.execute(select(User).where(User.id == driver_id))).scalars().first()
        if driver is None:
            raise HTTPException(status_code=404, detail="Driver not found")

        completed_count = len((await db.execute(
            select(DeliveryTrip.id).where(
                DeliveryTrip.driver_id == driver_id,
                DeliveryTrip.status == TripStatus.UNLOADED_COMPLETED,
            )
        )).all())

        license_masked = None
        if driver.driver_license:
            license_masked = "•" * max(0, len(driver.driver_license) - 4) + driver.driver_license[-4:]

        # Only values stored for this driver are returned. Anything not recorded is null.
        return DriverProfileResponse(
            driverId=driver.id,
            name=driver.name,
            phone=driver.phone,
            email=driver.email,
            isOnline=bool(driver.is_online),
            isVerified=bool(driver.is_verified),
            verificationReason=driver.verification_reason,
            licenseNumberMasked=license_masked,
            vehicleType=driver.vehicle_type,
            vehicleRegNumber=driver.vehicle_reg_number,
            payloadCapacityTons=driver.payload_capacity_tons,
            completedTripsLifetime=completed_count,
        )

    @staticmethod
    async def update_driver_profile(
        db: AsyncSession,
        driver_id: str,
        req: DriverProfileUpdateRequest
    ) -> DriverProfileResponse:
        driver = (await db.execute(select(User).where(User.id == driver_id))).scalars().first()
        if driver is None:
            raise HTTPException(status_code=404, detail="Driver not found")

        if req.name:
            driver.name = req.name
        if req.phone:
            driver.phone = req.phone
        if req.vehicleType:
            driver.vehicle_type = req.vehicleType
        if req.vehicleRegNumber:
            driver.vehicle_reg_number = req.vehicleRegNumber.upper()
        if req.payloadCapacityTons is not None:
            driver.payload_capacity_tons = req.payloadCapacityTons
        await db.commit()
        return await DriverService.get_driver_profile(db, driver_id)

    @staticmethod
    async def toggle_online(
        db: AsyncSession,
        driver_id: str
    ) -> Dict[str, Any]:
        driver = (await db.execute(select(User).where(User.id == driver_id))).scalars().first()
        if driver is None:
            raise HTTPException(status_code=404, detail="Driver not found")
        if not driver.is_verified:
            raise HTTPException(status_code=403, detail="Driver account is pending admin verification")
        driver.is_online = not bool(driver.is_online)
        await db.commit()
        return {"driverId": driver_id, "isOnline": bool(driver.is_online)}

    @staticmethod
    async def get_trip_history(
        db: AsyncSession,
        driver_id: str
    ) -> List[DriverTripHistoryItem]:
        res = await db.execute(
            select(DeliveryTrip)
            .where(DeliveryTrip.driver_id == driver_id)
            .order_by(desc(DeliveryTrip.created_at))
            .limit(50)
        )
        trips = res.scalars().all()

        history_items = []
        for t in trips:
            status_str = t.status.value if hasattr(t.status, "value") else str(t.status)
            history_items.append(
                DriverTripHistoryItem(
                    tripId=t.id,
                    orderId=t.order_id,
                    pickupAddress=t.pickup_address,
                    dropAddress=t.drop_address,
                    distanceKm=t.distance_km,
                    tripFare=t.trip_fare,
                    tipAmount=t.tip_amount,
                    totalEarned=t.trip_fare + t.tip_amount,
                    status=status_str,
                    completedAt=t.completed_at.isoformat() if t.completed_at else None,
                    vehicleType=t.vehicle_type
                )
            )

        return history_items

    @staticmethod
    async def report_trip_exception(
        db: AsyncSession,
        driver_id: str,
        req: DriverExceptionReportRequest
    ) -> Dict[str, Any]:
        res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == req.tripId))
        trip = res.scalars().first()
        if not trip:
            return {"success": False, "message": "Trip not found"}

        if trip.driver_id != driver_id:
            return {"success": False, "message": "Access denied to trip"}

        from app.services.audit_service import audit_service
        from app.models.audit_log import AuditAction
        await audit_service.log_action(
            db=db,
            actor_id=driver_id,
            actor_role="driver",
            action=AuditAction.TRIP_EXCEPTION_REPORTED,
            target_id=req.tripId,
            target_type="delivery_trip",
            context={
                "exceptionType": req.exceptionType,
                "description": req.description,
                "orderId": trip.order_id
            }
        )

        from app.core.websocket import manager, EventType
        try:
            await manager.broadcast({
                "event": EventType.SYSTEM_ALERT,
                "data": {
                    "alertType": "DRIVER_EXCEPTION",
                    "tripId": trip.id,
                    "orderId": trip.order_id,
                    "driverId": driver_id,
                    "exceptionType": req.exceptionType,
                    "description": req.description
                }
            })
        except Exception:
            pass

        return {
            "success": True,
            "tripId": req.tripId,
            "exceptionType": req.exceptionType,
            "message": "Exception recorded and dispatched to operations supervisor"
        }

    @staticmethod
    async def update_location_telemetry(
        db: AsyncSession,
        driver_id: str,
        req: DriverLocationUpdateRequest
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        gps_data = {
            "lat": req.latitude,
            "lng": req.longitude,
            "speed": req.speedKmh,
            "heading": req.heading,
            "timestamp": now.isoformat()
        }

        driver = (await db.execute(select(User).where(User.id == driver_id))).scalars().first()
        if driver is None:
            raise HTTPException(status_code=404, detail="Driver not found")
        driver.latitude = req.latitude
        driver.longitude = req.longitude
        driver.location_updated_at = now

        active_trip = (await db.execute(
            select(DeliveryTrip).where(
                DeliveryTrip.driver_id == driver_id,
                DeliveryTrip.status.in_(dispatch_service.ACTIVE_TRIP_STATUSES),
            )
        )).scalars().first()
        if active_trip:
            active_trip.current_gps = gps_data
        await db.commit()

        if active_trip:
            # Live position goes only to the buyer whose order this trip serves.
            from app.core.websocket import manager, EventType
            order = (await db.execute(select(Order).where(Order.id == active_trip.order_id))).scalars().first()
            if order:
                try:
                    await manager.send_personal_message({
                        "event": EventType.DRIVER_LOCATION_UPDATE,
                        "data": {
                            "orderId": order.id,
                            "tripId": active_trip.id,
                            "gps": gps_data
                        }
                    }, order.user_id)
                except Exception:
                    pass

        return {"updated": True, "gps": gps_data, "tripId": active_trip.id if active_trip else None}

    @staticmethod
    async def update_trip_status(
        db: AsyncSession,
        req: UpdateTripStatusRequest,
        driver_id: str
    ) -> bool:
        if req.status not in DRIVER_SETTABLE_STATUSES:
            raise HTTPException(
                status_code=400,
                detail="Delivery completion requires customer OTP verification"
            )

        res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == req.tripId))
        trip = res.scalars().first()
        if not trip:
            return False

        order_res = await db.execute(select(Order).where(Order.id == trip.order_id))
        order = order_res.scalars().first()

        # Trips are only given to a driver through an accepted dispatch offer.
        if trip.driver_id != driver_id:
            return False

        current_index = TRIP_PROGRESSION.index(trip.status)
        requested_index = TRIP_PROGRESSION.index(req.status)
        if requested_index <= current_index:
            raise HTTPException(
                status_code=400,
                detail=f"Trip cannot move from {trip.status.value} to {req.status.value}"
            )

        trip.status = req.status
        if req.currentLat and req.currentLng:
            trip.current_gps = {"lat": req.currentLat, "lng": req.currentLng}
        if req.status == TripStatus.UNLOADED_COMPLETED:
            trip.completed_at = datetime.now(timezone.utc)

        order_res = await db.execute(select(Order).where(Order.id == trip.order_id))
        order = order_res.scalars().first()
        if order:
            if req.status in [TripStatus.ACCEPTED, TripStatus.ARRIVED_AT_STORE, TripStatus.LOADED]:
                order.status = OrderStatus.PACKING
            elif req.status in [TripStatus.IN_TRANSIT, TripStatus.ARRIVED_AT_SITE]:
                order.status = OrderStatus.OUT_FOR_DELIVERY
            elif req.status == TripStatus.UNLOADED_COMPLETED:
                order.status = OrderStatus.DELIVERED

            from app.core.websocket import manager, EventType
            status_val = order.status.value if hasattr(order.status, "value") else str(order.status)
            trip_status_val = trip.status.value if hasattr(trip.status, "value") else str(trip.status)
            try:
                await manager.send_personal_message({
                    "event": EventType.ORDER_STATUS_UPDATE,
                    "data": {
                        "orderId": order.id,
                        "orderStatus": status_val,
                        "tripId": trip.id,
                        "tripStatus": trip_status_val,
                        "gps": trip.current_gps,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                }, order.user_id)
                if trip.driver_id:
                    await manager.send_personal_message({
                        "event": EventType.TRIP_STATUS_UPDATE,
                        "data": {
                            "tripId": trip.id,
                            "tripStatus": trip_status_val,
                            "orderId": order.id,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                    }, trip.driver_id)
            except Exception:
                pass

        await db.commit()
        return True
