"""Payment schemas for MaterialHub."""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class PaymentOrderRequest(BaseModel):
    """Request to create a payment order for an existing MaterialHub order."""
    order_id: str = Field(..., description="MaterialHub order ID")
    amount: float = Field(..., gt=0, description="Amount in smallest currency unit (paise for INR)")
    currency: str = Field(default="INR", description="Currency code")
    receipt: Optional[str] = Field(None, description="Optional receipt identifier")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional metadata context")


class PaymentOrderResponse(BaseModel):
    """Response from creating a Razorpay payment order."""
    id: str = Field(..., description="Razorpay order ID")
    entity: str = Field(..., description="Entity type (order)")
    amount: int = Field(..., description="Amount in smallest currency unit")
    amount_paid: int = Field(..., description="Amount already paid")
    amount_due: int = Field(..., description="Amount remaining to be paid")
    currency: str = Field(..., description="Currency code")
    receipt: Optional[str] = Field(None, description="Receipt identifier")
    status: str = Field(..., description="Order status")
    created_at: int = Field(..., description="Creation timestamp")
    key_id: str = Field(..., description="Razorpay key ID for frontend")


class PaymentVerificationRequest(BaseModel):
    """Request to verify a payment after completion."""
    razorpay_order_id: str = Field(..., description="Razorpay order ID")
    razorpay_payment_id: str = Field(..., description="Razorpay payment ID")
    razorpay_signature: str = Field(..., description="Razorpay signature from frontend")


class PaymentVerificationResponse(BaseModel):
    """Response from payment verification."""
    verified: bool = Field(..., description="Whether payment is valid")
    payment_id: Optional[str] = Field(None, description="Razorpay payment ID if verified")
    order_id: str = Field(..., description="MaterialHub order ID")


class RefundRequest(BaseModel):
    """Request to process a refund."""
    payment_id: str = Field(..., description="Razorpay payment ID to refund")
    amount: Optional[float] = Field(None, description="Amount to refund in smallest currency unit (None for full refund)")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional refund context")


class RefundResponse(BaseModel):
    """Response from refund processing."""
    refund_id: str = Field(..., description="Razorpay refund ID")
    payment_id: str = Field(..., description="Razorpay payment ID")
    amount: Optional[int] = Field(None, description="Refunded amount in smallest currency unit")
    status: str = Field(..., description="Refund status")
