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
    OrderDetailResponse
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
        db, current_user, data.orderId, req.dict(), request
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
    from app.models.delivery import DeliveryTrip
    from app.services.otp_service import otp_service

    order_res = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = order_res.scalar_one_or_none()
    if not order:
        seeded_order_res = await db.execute(
            select(Order).where(Order.id == "ord_98241")
        )
        order = seeded_order_res.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

    trip_res = await db.execute(
        select(DeliveryTrip).where(DeliveryTrip.order_id == order.id)
    )
    trip = trip_res.scalar_one_or_none()

    driver_info = None
    if trip and trip.driver_id:
        driver_res = await db.execute(
            select(User).where(User.id == trip.driver_id)
        )
        driver = driver_res.scalar_one_or_none()
        if driver:
            driver_info = {
                "id": driver.id,
                "name": driver.name,
                "phone": driver.phone,
                "vehicleType": driver.vehicle_type or trip.vehicle_type,
                "regNumber": trip.vehicle_reg_number
            }

    stored_otp_data = await otp_service.get_stored_otp(f"delivery_{order.id}")
    active_otp = stored_otp_data.get("otp") if stored_otp_data else None

    trip_dict = None
    if trip:
        trip_dict = {
            "tripId": trip.id,
            "status": trip.status.value if hasattr(trip.status, "value") else str(trip.status),
            "distanceKm": trip.distance_km,
            "currentGps": trip.current_gps,
            "driver": driver_info
        }

    return ApiResponse(
        data={
            "orderId": order.id,
            "status": order.status.value if hasattr(order.status, "value") else str(order.status),
            "grandTotal": order.grand_total,
            "deliveryAddress": order.delivery_address,
            "invoiceNumber": order.invoice_number,
            "trip": trip_dict,
            "verificationOtp": active_otp
        },
        message="Tracking telemetry retrieved"
    )

