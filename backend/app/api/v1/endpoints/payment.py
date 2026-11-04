"""Payment API endpoints for MaterialHub.

Handles payment order creation, verification, refunds, and payment status tracking.
Integrates with Razorpay for secure payment processing.
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.api.deps import get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.services.payment_service import payment_service
from app.services.audit_service import audit_service
from app.schemas.payment import (
    PaymentOrderRequest,
    PaymentOrderResponse,
    PaymentVerificationRequest,
    PaymentVerificationResponse,
    RefundRequest,
    RefundResponse
)
from app.schemas.common import ApiResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payment", tags=["Payment Endpoints"])

ONLINE_PAYMENT_MODE = "Online Payment (Razorpay)"


def _require_live_gateway_in_production() -> None:
    """Simulation mode accepts any payment, so it must never run in production."""
    if payment_service.simulation_mode and settings.ENVIRONMENT.lower() in ["production", "prod"]:
        raise HTTPException(status_code=503, detail="Payment gateway is not configured")


@router.post("/create-order", response_model=ApiResponse[PaymentOrderResponse])
@limiter.limit(settings.RATE_LIMIT_CREATE_ORDER)
async def create_payment_order(
    request: Request,
    req: PaymentOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Razorpay payment order for a MaterialHub order.

    The frontend should use the returned Razorpay order details to initiate
    payment via Razorpay's frontend SDK.
    """
    order_result = await db.execute(
        select(Order).where(Order.id == req.order_id)
    )
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied. Order does not belong to current user.")

    _require_live_gateway_in_production()

    if order.status != OrderStatus.PENDING or order.payment_mode != ONLINE_PAYMENT_MODE:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot create payment for order with status: {order.status.value}"
        )

    if order.payment_id:
        raise HTTPException(status_code=400, detail="Order has already been paid")

    # The charge amount is always the stored order total, never a client value.
    amount_paise = int(round(order.grand_total * 100))
    if amount_paise <= 0:
        raise HTTPException(status_code=400, detail="Order total is invalid")

    try:
        razorpay_order = await payment_service.create_payment_order(
            order_id=req.order_id,
            amount=amount_paise,
            currency=req.currency,
            receipt=req.receipt,
            context=req.context
        )

        await db.execute(
            update(Order)
            .where(Order.id == req.order_id)
            .values(payment_order_id=razorpay_order["id"])
        )
        await db.commit()

        logger.info(
            f"Payment order created: razorpay_order_id={razorpay_order['id']}, "
            f"materialhub_order_id={req.order_id}, user_id={current_user.id}"
        )

        # The checkout needs the public key id; Razorpay's order object does not include it.
        order_payload = {**razorpay_order, "key_id": settings.RAZORPAY_KEY_ID or ""}
        return ApiResponse(data=PaymentOrderResponse(**order_payload), message="Payment order created successfully")

    except Exception as e:
        logger.error(f"Failed to create payment order for order_id={req.order_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order") from e


@router.post("/verify", response_model=ApiResponse[PaymentVerificationResponse])
async def verify_payment(
    req: PaymentVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify a Razorpay payment after completion.

    This endpoint should be called by the frontend after successful payment
    via Razorpay's frontend SDK.
    """
    try:
        order_result = await db.execute(
            select(Order).where(Order.payment_order_id == req.razorpay_order_id)
        )
        order = order_result.scalar_one_or_none()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found for the given Razorpay order ID")

        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied. Order does not belong to current user.")

        _require_live_gateway_in_production()

        if order.status != OrderStatus.PENDING:
            raise HTTPException(status_code=400, detail="Order is not awaiting payment")

        is_valid = await payment_service.verify_payment(
            razorpay_order_id=req.razorpay_order_id,
            razorpay_payment_id=req.razorpay_payment_id,
            razorpay_signature=req.razorpay_signature
        )

        if not is_valid:
            logger.warning(f"Payment verification failed for order_id={order.id}, payment_id={req.razorpay_payment_id}")
            raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

        # A single Razorpay payment must never confirm two orders.
        reused_res = await db.execute(
            select(Order.id).where(Order.payment_id == req.razorpay_payment_id)
        )
        if reused_res.first():
            raise HTTPException(status_code=400, detail="Payment has already been used for an order")

        # The signature only proves Razorpay issued the IDs. Confirm the captured
        # amount and currency match what the order costs before trusting it.
        if not payment_service.simulation_mode:
            payment = await payment_service.get_payment_details(req.razorpay_payment_id)
            expected_paise = int(round(order.grand_total * 100))
            if (
                payment.get("order_id") != req.razorpay_order_id
                or int(payment.get("amount") or 0) != expected_paise
                or payment.get("currency") != "INR"
                or payment.get("status") != "captured"
            ):
                logger.warning(
                    f"Payment amount/status mismatch for order_id={order.id}, payment_id={req.razorpay_payment_id}"
                )
                raise HTTPException(status_code=400, detail="Payment does not match the order amount")

        await db.execute(
            update(Order)
            .where(Order.id == order.id, Order.status == OrderStatus.PENDING)
            .values(
                status=OrderStatus.CONFIRMED,
                payment_id=req.razorpay_payment_id,
                paid_at=datetime.now(timezone.utc)
            )
        )
        await db.commit()

        from app.services import dispatch_service
        from app.models.delivery import DeliveryTrip
        trip = (await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == order.id))).scalars().first()
        if trip:
            await dispatch_service.dispatch_trip(db, trip)

        logger.info(
            f"Payment verified and order confirmed: order_id={order.id}, "
            f"payment_id={req.razorpay_payment_id}, user_id={current_user.id}"
        )

        await audit_service.log_payment_verified(
            db, current_user, order.id, req.razorpay_payment_id, order.grand_total
        )

        from app.core.websocket import manager, EventType
        try:
            await manager.send_personal_message({
                "event": EventType.PAYMENT_STATUS,
                "data": {
                    "orderId": order.id,
                    "paymentId": req.razorpay_payment_id,
                    "status": "paid",
                    "amount": order.grand_total,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            }, order.user_id)
        except Exception:
            pass

        return ApiResponse(
            data=PaymentVerificationResponse(
                verified=True,
                payment_id=req.razorpay_payment_id,
                order_id=order.id
            ),
            message="Payment verified successfully. Order confirmed."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in verify_payment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"verify_payment failed: {str(e)}") from e


@router.post("/refund", response_model=ApiResponse[RefundResponse])
async def refund_payment(
    req: RefundRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Process a refund for a payment.

    Admin only. Buyers and vendors cannot trigger refunds on their own orders,
    and the refund can never exceed the amount that was actually paid.
    """
    from app.models.user import UserRole
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")

    _require_live_gateway_in_production()

    order_result = await db.execute(
        select(Order).where(Order.payment_id == req.payment_id)
    )
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found for the given payment ID")

    if order.status == OrderStatus.REFUNDED:
        raise HTTPException(status_code=400, detail="Order has already been refunded")

    paid_paise = int(round(order.grand_total * 100))
    refund_paise = paid_paise if req.amount is None else int(round(req.amount))
    if refund_paise <= 0 or refund_paise > paid_paise:
        raise HTTPException(
            status_code=400,
            detail=f"Refund amount must be between 1 and {paid_paise} paise"
        )
    is_full_refund = refund_paise == paid_paise

    try:
        refund = await payment_service.refund_payment(
            razorpay_payment_id=req.payment_id,
            amount=refund_paise,
            context=req.context
        )

        # Only a full refund closes the order; a partial refund leaves it open.
        if is_full_refund:
            await db.execute(
                update(Order)
                .where(Order.id == order.id)
                .values(status=OrderStatus.REFUNDED)
            )
        await db.commit()

        logger.info(
            f"Refund processed: refund_id={refund['id']}, payment_id={req.payment_id}, "
            f"order_id={order.id}, user_id={current_user.id}"
        )

        return ApiResponse(
            data=RefundResponse(
                refund_id=refund["id"],
                payment_id=req.payment_id,
                amount=refund.get("amount"),
                status=refund["status"]
            ),
            message="Refund processed successfully"
        )

    except Exception as e:
        logger.error(f"Failed to process refund for payment_id={req.payment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process refund") from e


@router.get("/status/{payment_id}", response_model=ApiResponse)
async def get_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch payment details from Razorpay.

    Returns the current status and details of a payment.
    """
    order_result = await db.execute(
        select(Order).where(Order.payment_id == payment_id)
    )
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found for the given payment ID")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied. Order does not belong to current user.")

    try:
        payment_details = await payment_service.get_payment_details(payment_id)
        return ApiResponse(data=payment_details, message="Payment details retrieved successfully")
    except Exception as e:
        logger.error(f"Failed to fetch payment details for payment_id={payment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment details") from e
