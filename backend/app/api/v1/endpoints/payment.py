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

    if order.status not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot create payment for order with status: {order.status.value}"
        )

    try:
        razorpay_order = await payment_service.create_payment_order(
            order_id=req.order_id,
            amount=req.amount,
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

        return ApiResponse(data=PaymentOrderResponse(**razorpay_order), message="Payment order created successfully")

    except Exception as e:
        logger.error(f"Failed to create payment order for order_id={req.order_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")


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

        is_valid = await payment_service.verify_payment(
            razorpay_order_id=req.razorpay_order_id,
            razorpay_payment_id=req.razorpay_payment_id,
            razorpay_signature=req.razorpay_signature
        )

        if not is_valid:
            logger.warning(f"Payment verification failed for order_id={order.id}, payment_id={req.razorpay_payment_id}")
            raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

        await db.execute(
            update(Order)
            .where(Order.id == order.id)
            .values(
                status=OrderStatus.CONFIRMED,
                payment_id=req.razorpay_payment_id,
                paid_at=datetime.now(timezone.utc)
            )
        )
        await db.commit()

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
        raise HTTPException(status_code=500, detail=f"verify_payment failed: {str(e)}")


@router.post("/refund", response_model=ApiResponse[RefundResponse])
async def refund_payment(
    req: RefundRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Process a refund for a payment.

    Only accessible to admin users or for orders belonging to the current user.
    """
    order_result = await db.execute(
        select(Order).where(Order.payment_id == req.payment_id)
    )
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found for the given payment ID")

    from app.models.user import UserRole
    if current_user.role != UserRole.ADMIN and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    try:
        refund = await payment_service.refund_payment(
            razorpay_payment_id=req.payment_id,
            amount=req.amount,
            context=req.context
        )

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
        raise HTTPException(status_code=500, detail="Failed to process refund")


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
        raise HTTPException(status_code=500, detail="Failed to fetch payment details")
