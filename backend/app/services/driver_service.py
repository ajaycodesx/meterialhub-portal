from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc, or_
from app.models.delivery import DeliveryTrip, TripStatus
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.schemas.driver import (
    DriverFeedCompositeResponse,
    DriverProfileResponse,
    DriverProfileUpdateRequest,
    DriverTripHistoryItem,
    DriverExceptionReportRequest,
    DriverLocationUpdateRequest,
    UpdateTripStatusRequest
)


class DriverService:
    _online_drivers: Dict[str, bool] = {}

    @staticmethod
    async def get_driver_feed_composite(
        db: AsyncSession,
        driver_id: str
    ) -> DriverFeedCompositeResponse:
        user_res = await db.execute(select(User).where(User.id == driver_id))
        driver = user_res.scalars().first()

        trip_res = await db.execute(
            select(DeliveryTrip).where(
                DeliveryTrip.driver_id == driver_id,
                DeliveryTrip.status.in_([
                    TripStatus.ASSIGNED,
                    TripStatus.ACCEPTED,
                    TripStatus.ARRIVED_AT_STORE,
                    TripStatus.LOADED,
                    TripStatus.IN_TRANSIT,
                    TripStatus.ARRIVED_AT_SITE
                ])
            )
        )
        active_trip_obj = trip_res.scalars().first()

        all_trips_res = await db.execute(
            select(DeliveryTrip).where(DeliveryTrip.driver_id == driver_id)
        )
        all_trips = all_trips_res.scalars().all()

        today_earnings = sum(
            t.trip_fare + t.tip_amount for t in all_trips if t.status == TripStatus.UNLOADED_COMPLETED
        )
        today_trips_count = sum(1 for t in all_trips if t.status == TripStatus.UNLOADED_COMPLETED)

        avail_res = await db.execute(
            select(DeliveryTrip).where(DeliveryTrip.status == TripStatus.UNASSIGNED).limit(10)
        )
        avail_trips = avail_res.scalars().all()

        active_trip_dict = None
        if active_trip_obj:
            active_trip_dict = {
                "tripId": active_trip_obj.id,
                "orderId": active_trip_obj.order_id,
                "status": active_trip_obj.status.value if hasattr(active_trip_obj.status, "value") else str(active_trip_obj.status),
                "pickupAddress": active_trip_obj.pickup_address,
                "dropAddress": active_trip_obj.drop_address,
                "distanceKm": active_trip_obj.distance_km,
                "tripFare": active_trip_obj.trip_fare,
                "tipAmount": active_trip_obj.tip_amount,
                "vehicleType": active_trip_obj.vehicle_type,
                "vehicleRegNumber": active_trip_obj.vehicle_reg_number,
                "currentGps": active_trip_obj.current_gps
            }

        avail_list = [
            {
                "tripId": t.id,
                "orderId": t.order_id,
                "pickupAddress": t.pickup_address,
                "dropAddress": t.drop_address,
                "distanceKm": t.distance_km,
                "tripFare": t.trip_fare,
                "vehicleType": t.vehicle_type
            } for t in avail_trips
        ]

        driver_online = DriverService._online_drivers.get(driver_id, True)

        return DriverFeedCompositeResponse(
            driverId=driver_id,
            driverName=driver.name if (driver and driver.name) else "Manoj K",
            vehicleType=driver.vehicle_type if (driver and driver.vehicle_type) else "Mini Commercial Truck (3 Ton)",
            vehicleRegNumber="KL-07-CD-8921",
            isOnline=driver_online,
            todayEarnings=round(today_earnings, 2),
            todayTripsCount=today_trips_count,
            activeTrip=active_trip_dict,
            availableTrips=avail_list,
            weeklyPayoutSummary={
                "weekTotal": round(today_earnings, 2),
                "completedTrips": today_trips_count,
                "payoutDay": "Every Tuesday Direct Bank Deposit"
            }
        )

    @staticmethod
    async def get_driver_profile(
        db: AsyncSession,
        driver_id: str
    ) -> DriverProfileResponse:
        res = await db.execute(select(User).where(User.id == driver_id))
        driver = res.scalars().first()

        completed_trips_res = await db.execute(
            select(DeliveryTrip).where(
                DeliveryTrip.driver_id == driver_id,
                DeliveryTrip.status == TripStatus.UNLOADED_COMPLETED
            )
        )
        completed_count = len(completed_trips_res.scalars().all())

        return DriverProfileResponse(
            driverId=driver_id,
            name=driver.name if driver else "Manoj K",
            phone=driver.phone if driver else "+91 98470 54321",
            email=driver.email if driver else "driver@materialhub.in",
            isOnline=DriverService._online_drivers.get(driver_id, True),
            isVerified=getattr(driver, "is_verified", True) if driver else True,
            licenseNumberMasked="KL-07-••••••••492",
            licenseExpiry="2029-08-15",
            vehicleType=getattr(driver, "vehicle_type", "Mini Commercial Truck (3 Ton)") or "Mini Commercial Truck (3 Ton)",
            vehicleRegNumber="KL-07-CD-8921",
            payloadCapacityTons=3.5,
            permitStatus="State Goods Carrier Valid",
            insuranceExpiry="2027-03-31",
            fitnessExpiry="2028-11-20",
            bankName="State Bank of India",
            bankAccountMasked="•••• •••• •••• 9214",
            ifsc="SBIN0007821",
            rating=4.95,
            completedTripsLifetime=max(completed_count, 128)
        )

    @staticmethod
    async def update_driver_profile(
        db: AsyncSession,
        driver_id: str,
        req: DriverProfileUpdateRequest
    ) -> DriverProfileResponse:
        res = await db.execute(select(User).where(User.id == driver_id))
        driver = res.scalars().first()
        if driver:
            if req.name:
                driver.name = req.name
            if req.phone:
                driver.phone = req.phone
            if req.vehicleType:
                driver.vehicle_type = req.vehicleType
            await db.commit()
            await db.refresh(driver)

        return await DriverService.get_driver_profile(db, driver_id)

    @staticmethod
    async def toggle_online(
        db: AsyncSession,
        driver_id: str
    ) -> Dict[str, Any]:
        current_status = DriverService._online_drivers.get(driver_id, True)
        new_status = not current_status
        DriverService._online_drivers[driver_id] = new_status
        return {"driverId": driver_id, "isOnline": new_status}

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
        await audit_service.log_action(
            db=db,
            actor_id=driver_id,
            actor_role="driver",
            action="TRIP_EXCEPTION_REPORTED",
            target_id=req.tripId,
            target_type="delivery_trip",
            metadata={
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
        gps_data = {
            "lat": req.latitude,
            "lng": req.longitude,
            "speed": req.speedKmh,
            "heading": req.heading,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        if req.tripId:
            res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == req.tripId))
            trip = res.scalars().first()
            if trip and trip.driver_id == driver_id:
                trip.current_gps = gps_data
                await db.commit()

        from app.core.websocket import manager, EventType
        try:
            await manager.broadcast({
                "event": EventType.DRIVER_LOCATION_UPDATE,
                "data": {
                    "driverId": driver_id,
                    "tripId": req.tripId,
                    "gps": gps_data
                }
            })
        except Exception:
            pass

        return {"updated": True, "gps": gps_data}

    @staticmethod
    async def update_trip_status(
        db: AsyncSession,
        req: UpdateTripStatusRequest,
        driver_id: str
    ) -> bool:
        res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == req.tripId))
        trip = res.scalars().first()
        if not trip:
            return False

        if trip.status == TripStatus.UNASSIGNED or trip.driver_id is None:
            claim_stmt = (
                update(DeliveryTrip)
                .where(
                    DeliveryTrip.id == req.tripId,
                    or_(DeliveryTrip.status == TripStatus.UNASSIGNED, DeliveryTrip.driver_id.is_(None))
                )
                .values(driver_id=driver_id)
            )
            claim_res = await db.execute(claim_stmt)
            if claim_res.rowcount == 0:
                return False
            await db.refresh(trip)
        elif trip.driver_id != driver_id:
            return False

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
