import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.api.deps import get_current_user
from app.models.user import User
from app.models.order import Order
from app.services.buyer_service import BuyerService
from app.services.audit_service import audit_service
from app.schemas.buyer import (
    BuyerHomeCompositeResponse,
    BuyerCatalogCompositeResponse,
    OrderCalculationRequest,
    OrderCalculationResponse,
    OrderCreateRequest,
    OrderDetailResponse,
    BoqQuoteCreateRequest,
    BoqQuoteResponse,
    OrderCancelRequest,
    OrderRatingRequest
)
from app.schemas.common import ApiResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/buyer", tags=["Buyer BFF Endpoints"])


@router.get("/home", response_model=ApiResponse[BuyerHomeCompositeResponse])
async def get_buyer_home(
    db: AsyncSession = Depends(get_db)
):
    """
    SINGLE COMPOSITE API FOR BUYER HOME PAGE:
    Returns hero config, trending deals with countdown timers, all material categories,
    nearby verified hardware stores, and live market commodity rate index in one high-speed call.
    """
    data = await BuyerService.get_home_composite(db)
    return ApiResponse(data=data, message="Buyer home feed retrieved successfully")


@router.get("/catalog", response_model=ApiResponse[BuyerCatalogCompositeResponse])
async def get_buyer_catalog(
    category: Optional[str] = Query(None, description="Category filter (cement, steel, pvc, paints, electricals, tools)"),
    brand: Optional[str] = Query(None, description="Brand filter (UltraTech, Tata Tiscon, Supreme, etc.)"),
    merchant_id: Optional[str] = Query(None, description="Specific merchant store filter"),
    query: Optional[str] = Query(None, description="Search query"),
    db: AsyncSession = Depends(get_db)
):
    """
    SINGLE COMPOSITE API FOR BUYER CATALOG:
    Returns filtered products, merchant stock info, and category filter facets in one call.
    """
    data = await BuyerService.get_catalog_composite(db, category, brand, merchant_id, query)
    return ApiResponse(data=data, message="Catalog data retrieved successfully")


@router.post("/calculate-order", response_model=ApiResponse[OrderCalculationResponse])
@limiter.limit(settings.RATE_LIMIT_CALCULATE_ORDER)
async def calculate_order_logistics_and_taxes(
    request: Request,
    req: OrderCalculationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    SINGLE API FOR CART & LOGISTICS CALCULATION:
    Calculates total tonnage, recommended delivery truck size, GST tax breakdown, and delivery fee.
    """
    data = await BuyerService.calculate_order_payload(db, req)
    return ApiResponse(data=data, message="Order payload calculated successfully")


@router.post("/orders", response_model=ApiResponse[OrderDetailResponse])
@limiter.limit(settings.RATE_LIMIT_CREATE_ORDER)
async def place_order(
    request: Request,
    req: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    SINGLE ATOMIC API FOR ORDER PLACEMENT:
    Validates cart, generates GST invoice number, and dispatches driver trip.
    """
    logger.info("Order placement initiated by buyer user_id=%s, merchant_id=%s", current_user.id, req.merchantId)
    data = await BuyerService.create_order(db, current_user.id, req)
    logger.info("Order created successfully: order_id=%s, grand_total=%s", data.orderId, data.grandTotal)

    await audit_service.log_order_created(
        db, current_user, data.orderId, req.model_dump(), request
    )

    return ApiResponse(data=data, message="Order placed successfully with instant dispatch allocation")


@router.get("/orders", response_model=ApiResponse)
async def list_buyer_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all recent orders for the current logged-in buyer.
    """
    res = await db.execute(
        select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    )
    orders = res.scalars().all()
    orders_list = [
        {
            "orderId": o.id,
            "invoiceNumber": o.invoice_number,
            "grandTotal": o.grand_total,
            "itemsTotal": o.items_total,
            "status": o.status.value if hasattr(o.status, "value") else str(o.status),
            "deliveryAddress": o.delivery_address,
            "pincode": o.pincode,
            "totalWeightKg": o.total_weight_kg,
            "createdAt": o.created_at.isoformat() if o.created_at else None
        } for o in orders
    ]
    return ApiResponse(data={"orders": orders_list, "count": len(orders_list)})


@router.get("/orders/{order_id}/tracking", response_model=ApiResponse[dict])
async def get_buyer_order_tracking(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.delivery import DeliveryTrip, TripStatus
    from app.models.merchant import HardwareMerchant
    from app.models.dispatch import DispatchOffer
    from app.services.dispatch_service import haversine_km
    from app.services.otp_service import otp_service

    order = (await db.execute(select(Order).where(Order.id == order_id))).scalars().first()
    # 404 for other buyers' orders so their existence is not disclosed.
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    trip = (await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == order.id))).scalars().first()
    store = (await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == order.merchant_id))).scalars().first()

    driver_info = None
    driver_location = None
    eta_minutes = None
    distance_to_drop_km = None
    if trip and trip.driver_id:
        driver = (await db.execute(select(User).where(User.id == trip.driver_id))).scalars().first()
        if driver:
            driver_info = {
                "id": driver.id,
                "name": driver.name,
                "phone": driver.phone,
                "vehicleType": trip.vehicle_type or driver.vehicle_type,
                "regNumber": trip.vehicle_reg_number or driver.vehicle_reg_number,
            }
        gps = trip.current_gps or {}
        if gps.get("lat") is not None and gps.get("lng") is not None:
            driver_location = {"lat": gps["lat"], "lng": gps["lng"], "updatedAt": gps.get("timestamp")}
            # Before the load is picked up the driver is heading to the store; after, to the site.
            if trip.status in (TripStatus.ASSIGNED, TripStatus.ACCEPTED, TripStatus.ARRIVED_AT_STORE):
                target_lat, target_lng = trip.pickup_lat, trip.pickup_lng
            else:
                target_lat, target_lng = trip.drop_lat, trip.drop_lng
            if target_lat is not None and target_lng is not None:
                distance_to_drop_km = round(haversine_km(gps["lat"], gps["lng"], target_lat, target_lng), 2)
                # Average 25 km/h with a 1.3 road factor over straight-line distance.
                eta_minutes = max(1, round(distance_to_drop_km * 1.3 / 25 * 60))

    stored_otp_data = await otp_service.get_stored_otp(f"delivery_{order.id}")
    active_otp = stored_otp_data.get("otp") if stored_otp_data else None

    pending_offers = 0
    if trip and trip.driver_id is None:
        pending_offers = len((await db.execute(
            select(DispatchOffer.id).where(DispatchOffer.trip_id == trip.id, DispatchOffer.status == "offered")
        )).all())

    return ApiResponse(
        data={
            "orderId": order.id,
            "status": order.status.value if hasattr(order.status, "value") else str(order.status),
            "grandTotal": order.grand_total,
            "deliveryAddress": order.delivery_address,
            "invoiceNumber": order.invoice_number,
            "store": {
                "name": store.name if store else None,
                "address": store.address if store else None,
                "phone": store.phone if store else None,
                "lat": store.latitude if store else None,
                "lng": store.longitude if store else None,
            },
            "trip": {
                "tripId": trip.id,
                "status": trip.status.value,
                "dispatchStatus": trip.dispatch_status,
                "pendingOffers": pending_offers,
                "distanceKm": trip.distance_km,
                "pickup": {"lat": trip.pickup_lat, "lng": trip.pickup_lng, "address": trip.pickup_address},
                "drop": {"lat": trip.drop_lat, "lng": trip.drop_lng, "address": trip.drop_address},
                "driverLocation": driver_location,
                "etaMinutes": eta_minutes,
                "distanceToTargetKm": distance_to_drop_km,
                "driver": driver_info,
            } if trip else None,
            "verificationOtp": active_otp,
        },
        message="Tracking telemetry retrieved"
    )


@router.post("/boq-quotes", response_model=ApiResponse[BoqQuoteResponse])
async def submit_buyer_boq_quote(
    req: BoqQuoteCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    BUYER BOQ QUOTE SUBMISSION:
    Allows contractors and builders to submit their Bill of Quantities (BOQ),
    site drawings, and bulk material requests for direct wholesale factory pricing.
    """
    data = await BuyerService.create_boq_quote(db, current_user.id, req)
    return ApiResponse(data=data, message="BOQ quote request submitted successfully")


@router.get("/boq-quotes", response_model=ApiResponse)
async def list_buyer_boq_quotes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns all submitted BOQ quotes and live review status for the authenticated buyer.
    """
    quotes = await BuyerService.list_boq_quotes(db, current_user.id)
    return ApiResponse(data={"quotes": [q.model_dump() for q in quotes], "count": len(quotes)})


@router.post("/orders/{order_id}/cancel", response_model=ApiResponse[dict])
async def cancel_buyer_order(
    request: Request,
    order_id: str,
    req: Optional[OrderCancelRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    BUYER ORDER CANCELLATION:
    Allows buyers to cancel un-dispatched orders in pending or confirmed status.
    Automatically restocks inventory and cancels pending delivery dispatches.
    """
    reason = req.reason if req else "Cancelled by buyer"
    result = await BuyerService.cancel_order(db, current_user.id, order_id, reason)
    await audit_service.log_order_cancelled(db, current_user, order_id, reason, request)
    return ApiResponse(data=result, message="Order cancelled successfully")


@router.post("/orders/{order_id}/rate", response_model=ApiResponse[dict])
async def rate_buyer_order(
    order_id: str,
    req: OrderRatingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    DELIVERED ORDER & MERCHANT RATING:
    Enables contractors to rate their material delivery, merchant fulfillment speed, and service quality.
    """
    result = await BuyerService.rate_order(db, current_user.id, order_id, req.rating, req.reviewText)
    return ApiResponse(data=result, message="Thank you for rating your delivery")
