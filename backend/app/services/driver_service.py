from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.delivery import DeliveryTrip, TripStatus
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.schemas.driver import DriverFeedCompositeResponse, UpdateTripStatusRequest


class DriverService:

    @staticmethod
    async def get_driver_feed_composite(
        db: AsyncSession,
        driver_id: str = "u_driver_1"
    ) -> DriverFeedCompositeResponse:
        """
        Single aggregated API endpoint returning all driver feed data in 1 call.
        """
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
        
        today_earnings = sum(t.trip_fare + t.tip_amount for t in all_trips if t.status == TripStatus.UNLOADED_COMPLETED)
        today_trips_count = sum(1 for t in all_trips if t.status == TripStatus.UNLOADED_COMPLETED)
        
        avail_res = await db.execute(
            select(DeliveryTrip).where(DeliveryTrip.status == TripStatus.UNASSIGNED).limit(5)
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
        
        return DriverFeedCompositeResponse(
            driverId=driver_id,
            driverName=driver.name if (driver and driver.name) else "Manoj K",
            vehicleType=driver.vehicle_type if (driver and driver.vehicle_type) else "Mini Commercial Truck (3 Ton)",
            isOnline=True,
            todayEarnings=round(today_earnings, 2),
            todayTripsCount=today_trips_count,
            activeTrip=active_trip_dict,
            availableTrips=avail_list,
            weeklyPayoutSummary={
                "weekTotal": today_earnings,
                "completedTrips": today_trips_count,
                "payoutDay": "Every Tuesday Direct Bank Deposit"
            }
        )

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
            trip.driver_id = driver_id
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
