"""Payment Service for MaterialHub using Razorpay.

Handles order payment processing, refund operations, and payment status tracking.
Integrates with Razorpay for secure payment processing.
"""

import logging
import razorpay
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from app.core.config import settings

logger = logging.getLogger(__name__)


class PaymentService:
    """Service for handling payment operations via Razorpay."""

    def __init__(self):
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            logger.warning("Razorpay credentials not configured. Payment operations will be in simulation mode.")
            self.client = None
            self.simulation_mode = True
        else:
            try:
                self.client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
                self.simulation_mode = False
                logger.info("Razorpay client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Razorpay client: {e}")
                self.client = None
                self.simulation_mode = True

    async def create_payment_order(
        self,
        order_id: str,
        amount: float,
        currency: str = "INR",
        receipt: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a Razorpay payment order for the given MaterialHub order.

        Args:
            order_id: MaterialHub order ID
            amount: Amount in smallest currency unit (paise for INR)
            currency: Currency code (default: INR)
            receipt: Optional receipt identifier
            context: Optional metadata context

        Returns:
            Razorpay order details including order_id, amount, currency, and key_id
        """
        if self.simulation_mode:
            logger.info(f"[SIMULATION] Creating payment order for order_id={order_id}, amount={amount}")
            int_amount = int(amount)
            return {
                "id": f"sim_order_{order_id}",
                "entity": "order",
                "amount": int_amount,
                "amount_paid": 0,
                "amount_due": int_amount,
                "currency": currency,
                "receipt": receipt or order_id,
                "offer_id": None,
                "status": "created",
                "attempts": 0,
                "notes": context or {},
                "created_at": int(datetime.now(timezone.utc).timestamp()),
                "key_id": settings.RAZORPAY_KEY_ID or "sim_key_id"
            }

        try:
            order_data = {
                "amount": int(amount),
                "currency": currency,
                "receipt": receipt or order_id,
                "notes": context or {},
                "payment_capture": 1,
            }

            razorpay_order = self.client.order.create(data=order_data)
            logger.info(f"Razorpay order created: {razorpay_order['id']} for MaterialHub order {order_id}")
            return razorpay_order

        except Exception as e:
            logger.error(f"Failed to create Razorpay order for order_id={order_id}: {e}")
            raise

    async def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """Verify the authenticity of a Razorpay payment.

        Args:
            razorpay_order_id: Razorpay order ID
            razorpay_payment_id: Razorpay payment ID
            razorpay_signature: Razorpay signature from frontend

        Returns:
            True if payment is valid, False otherwise
        """
        if self.simulation_mode:
            logger.info(f"[SIMULATION] Verifying payment: order={razorpay_order_id}, payment={razorpay_payment_id}")
            return True

        try:
            params = {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature
            }
            self.client.utility.verify_payment_signature(params)
            logger.info(f"Payment verified successfully: {razorpay_payment_id}")
            return True
        except Exception as e:
            logger.error(f"Payment verification failed: {e}")
            return False

    async def capture_payment(
        self,
        razorpay_payment_id: str,
        amount: float
    ) -> Dict[str, Any]:
        """Capture a payment after authorization.

        Args:
            razorpay_payment_id: Razorpay payment ID
            amount: Amount to capture in smallest currency unit

        Returns:
            Captured payment details
        """
        if self.simulation_mode:
            logger.info(f"[SIMULATION] Capturing payment: {razorpay_payment_id}, amount={amount}")
            return {
                "id": razorpay_payment_id,
                "entity": "payment",
                "amount": amount,
                "currency": "INR",
                "status": "captured",
                "captured": True
            }

        try:
            payment = self.client.payment.capture(
                razorpay_payment_id,
                int(amount),
                {"currency": "INR"}
            )
            logger.info(f"Payment captured successfully: {razorpay_payment_id}")
            return payment
        except Exception as e:
            logger.error(f"Failed to capture payment {razorpay_payment_id}: {e}")
            raise

    async def refund_payment(
        self,
        razorpay_payment_id: str,
        amount: Optional[float] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process a refund for a payment.

        Args:
            razorpay_payment_id: Razorpay payment ID to refund
            amount: Amount to refund in smallest currency unit (None for full refund)
            context: Optional refund context

        Returns:
            Refund details
        """
        if self.simulation_mode:
            logger.info(f"[SIMULATION] Refunding payment: {razorpay_payment_id}, amount={amount}")
            return {
                "id": f"sim_refund_{razorpay_payment_id}",
                "entity": "refund",
                "amount": amount,
                "currency": "INR",
                "status": "processed"
            }

        try:
            refund_data = {"notes": context or {}}
            if amount:
                refund_data["amount"] = int(amount)

            refund = self.client.payment.refund(razorpay_payment_id, refund_data)
            logger.info(f"Refund processed successfully: {refund['id']} for payment {razorpay_payment_id}")
            return refund
        except Exception as e:
            logger.error(f"Failed to refund payment {razorpay_payment_id}: {e}")
            raise

    async def get_payment_details(self, razorpay_payment_id: str) -> Dict[str, Any]:
        """Fetch payment details from Razorpay.

        Args:
            razorpay_payment_id: Razorpay payment ID

        Returns:
            Payment details
        """
        if self.simulation_mode:
            logger.info(f"[SIMULATION] Fetching payment details: {razorpay_payment_id}")
            return {
                "id": razorpay_payment_id,
                "entity": "payment",
                "amount": 10000,
                "currency": "INR",
                "status": "captured",
                "captured": True
            }

        try:
            payment = self.client.payment.fetch(razorpay_payment_id)
            return payment
        except Exception as e:
            logger.error(f"Failed to fetch payment details for {razorpay_payment_id}: {e}")
            raise


payment_service = PaymentService()
