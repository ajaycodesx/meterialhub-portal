from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.delivery import DeliveryTrip, TripStatus
from app.models.order import Order, OrderStatus
from app.services.driver_service import DriverService
from app.services.otp_service import otp_service
from app.services.audit_service import audit_service
from app.schemas.driver import (
    DriverFeedCompositeResponse,
    DriverProfileResponse,
    DriverProfileUpdateRequest,
    DriverTripHistoryItem,
    DriverExceptionReportRequest,
    DriverLocationUpdateRequest,
    UpdateTripStatusRequest,
    DeliveryOtpRequest,
    VerifyDeliveryOtpRequest
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/driver", tags=["Driver BFF Endpoints"])


@router.get("/feed", response_model=ApiResponse[DriverFeedCompositeResponse])
async def get_driver_feed(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    driver_id = current_user.id
    data = await DriverService.get_driver_feed_composite(db, driver_id)
    return ApiResponse(data=data, message="Driver feed data retrieved successfully")


@router.get("/profile", response_model=ApiResponse[DriverProfileResponse])
async def get_driver_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    data = await DriverService.get_driver_profile(db, current_user.id)
    return ApiResponse(data=data, message="Driver profile retrieved successfully")


@router.put("/profile", response_model=ApiResponse[DriverProfileResponse])
async def update_driver_profile(
    req: DriverProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    data = await DriverService.update_driver_profile(db, current_user.id, req)
    return ApiResponse(data=data, message="Driver profile updated successfully")


@router.post("/toggle-online", response_model=ApiResponse[Dict[str, Any]])
async def toggle_online(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    res = await DriverService.toggle_online(db, current_user.id)
    return ApiResponse(data=res, message="Driver availability updated")


@router.get("/trips/history", response_model=ApiResponse[List[DriverTripHistoryItem]])
async def get_trip_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    history = await DriverService.get_trip_history(db, current_user.id)
    return ApiResponse(data=history, message="Trip history retrieved successfully")


@router.post("/trips/exception", response_model=ApiResponse[Dict[str, Any]])
async def report_trip_exception(
    req: DriverExceptionReportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    result = await DriverService.report_trip_exception(db, current_user.id, req)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Unable to report exception"))

    return ApiResponse(data=result, message="Exception reported successfully")


@router.post("/location", response_model=ApiResponse[Dict[str, Any]])
async def update_location_telemetry(
    req: DriverLocationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    result = await DriverService.update_location_telemetry(db, current_user.id, req)
    return ApiResponse(data=result, message="Driver location telemetry updated")


@router.post("/update-trip", response_model=ApiResponse[dict])
@router.post("/update-trip-status", response_model=ApiResponse[dict])
async def update_trip_status(
    req: UpdateTripStatusRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    success = await DriverService.update_trip_status(db, req, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found or access denied")
    return ApiResponse(data={"updated": True, "tripId": req.tripId, "newStatus": req.status}, message="Trip status updated")


@router.post("/request-delivery-otp", response_model=ApiResponse[dict])
async def request_delivery_otp(
    req: Optional[DeliveryOtpRequest] = None,
    trip_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    target_trip_id = (req.tripId if req else None) or trip_id
    if not target_trip_id:
        raise HTTPException(status_code=400, detail="tripId is required")

    trip_result = await db.execute(
        select(DeliveryTrip).where(DeliveryTrip.id == target_trip_id)
    )
    trip = trip_result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied. Trip does not belong to current driver.")

    order_result = await db.execute(
        select(Order).where(Order.id == trip.order_id)
    )
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user_result = await db.execute(
        select(User).where(User.id == order.user_id)
    )
    customer = user_result.scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    otp = await otp_service.generate_delivery_otp(order.id, customer.phone)

    from app.core.websocket import manager, EventType
    try:
        await manager.send_personal_message({
            "event": EventType.DELIVERY_VERIFICATION,
            "data": {
                "orderId": order.id,
                "tripId": target_trip_id,
                "verificationOtp": otp,
                "message": "Delivery verification OTP generated"
            }
        }, order.user_id)
    except Exception:
        pass

    return ApiResponse(
        data={"otpSent": True, "tripId": target_trip_id, "orderId": order.id},
        message="OTP sent to customer's phone for delivery verification"
    )


@router.post("/verify-delivery-otp", response_model=ApiResponse[dict])
async def verify_delivery_otp(
    req: Optional[VerifyDeliveryOtpRequest] = None,
    trip_id: Optional[str] = None,
    otp: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Access denied. Driver role required.")

    target_trip_id = (req.tripId if req else None) or trip_id
    target_otp = (req.otp if req else None) or otp
    if not target_trip_id or not target_otp:
        raise HTTPException(status_code=400, detail="tripId and otp are required")

    trip_result = await db.execute(
        select(DeliveryTrip).where(DeliveryTrip.id == target_trip_id)
    )
    trip = trip_result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied. Trip does not belong to current driver.")

    is_valid = await otp_service.validate_delivery_otp(trip.order_id, target_otp)

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    await db.execute(
        update(DeliveryTrip)
        .where(DeliveryTrip.id == target_trip_id)
        .values(
            status=TripStatus.UNLOADED_COMPLETED,
            completed_at=datetime.now(timezone.utc)
        )
    )

    await db.execute(
        update(Order)
        .where(Order.id == trip.order_id)
        .values(status=OrderStatus.DELIVERED)
    )

    await db.commit()

    from app.core.websocket import manager, EventType
    try:
        order_res = await db.execute(select(Order).where(Order.id == trip.order_id))
        order_obj = order_res.scalar_one_or_none()
        if order_obj:
            await manager.send_personal_message({
                "event": EventType.ORDER_STATUS_UPDATE,
                "data": {
                    "orderId": trip.order_id,
                    "orderStatus": "delivered",
                    "tripId": target_trip_id,
                    "tripStatus": "unloaded_completed",
                    "message": "Delivery verified and completed successfully"
                }
            }, order_obj.user_id)
    except Exception:
        pass

    await audit_service.log_delivery_verified(
        db, current_user.id, current_user.role.value, trip.order_id, target_trip_id
    )

    return ApiResponse(
        data={"verified": True, "tripId": target_trip_id, "orderId": trip.order_id},
        message="OTP verified successfully. Delivery completed."
    )
