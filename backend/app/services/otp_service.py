"""OTP Service for MaterialHub.

Handles OTP generation, validation, and expiry for delivery verification
and other authentication purposes.
"""

import logging
import pyotp
import secrets
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)


class OTPService:
    """Service for OTP generation and validation."""

    def __init__(self):
        self.otp_store: Dict[str, Dict[str, Any]] = {}
        self.otp_expiry_seconds = 300
        self.otp_length = 6

    def generate_otp(self) -> str:
        """Generate a 6-digit OTP.

        Returns:
            6-digit OTP as string
        """
        return f"{secrets.randbelow(1000000):06d}"

    async def store_otp(
        self,
        identifier: str,
        otp: str,
        purpose: str = "verification",
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Store OTP with expiry timestamp.

        Args:
            identifier: Unique identifier (phone number, user_id, etc.)
            otp: OTP code
            purpose: Purpose of OTP (delivery, verification, etc.)
            metadata: Optional metadata associated with OTP
        """
        expiry_time = datetime.now(timezone.utc) + timedelta(seconds=self.otp_expiry_seconds)

        self.otp_store[identifier] = {
            "otp": otp,
            "purpose": purpose,
            "expires_at": expiry_time.isoformat(),
            "attempts": 0,
            "metadata": metadata or {}
        }

        logger.info(f"OTP stored for identifier={identifier}, purpose={purpose}, expires_at={expiry_time}")

    async def get_stored_otp(self, identifier: str) -> Optional[Dict[str, Any]]:
        """Retrieve stored OTP data if not expired.

        Args:
            identifier: Unique identifier

        Returns:
            OTP data dict if valid and not expired, None otherwise
        """
        otp_data = self.otp_store.get(identifier)

        if not otp_data:
            return None

        expires_at = datetime.fromisoformat(otp_data["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            logger.info(f"OTP expired for identifier={identifier}")
            del self.otp_store[identifier]
            return None

        return otp_data

    async def validate_otp(
        self,
        identifier: str,
        otp: str,
        purpose: str = "verification"
    ) -> bool:
        """Validate OTP against stored value.

        Args:
            identifier: Unique identifier
            otp: OTP code to validate
            purpose: Purpose of OTP

        Returns:
            True if OTP is valid, False otherwise
        """
        otp_data = await self.get_stored_otp(identifier)

        if not otp_data:
            logger.warning(f"OTP validation failed: no valid OTP found for identifier={identifier}")
            return False

        if otp_data["purpose"] != purpose:
            logger.warning(f"OTP validation failed: purpose mismatch for identifier={identifier}")
            return False

        if otp_data["attempts"] >= 3:
            logger.warning(f"OTP validation failed: max attempts exceeded for identifier={identifier}")
            del self.otp_store[identifier]
            return False

        otp_data["attempts"] += 1

        if otp_data["otp"] == otp:
            logger.info(f"OTP validated successfully for identifier={identifier}")
            del self.otp_store[identifier]
            return True
        else:
            logger.warning(f"OTP validation failed: incorrect OTP for identifier={identifier}, attempt={otp_data['attempts']}")
            return False

    async def generate_and_send_otp(
        self,
        identifier: str,
        phone: str,
        purpose: str = "verification",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate, store, and send OTP via SMS.

        Args:
            identifier: Unique identifier
            phone: Phone number to send OTP to
            purpose: Purpose of OTP
            metadata: Optional metadata

        Returns:
            Generated OTP (for testing purposes only, do not return in production)
        """
        otp = self.generate_otp()
        await self.store_otp(identifier, otp, purpose, metadata)

        sent = await notification_service.send_otp(phone, otp, purpose)

        if not sent:
            logger.error(f"Failed to send OTP to phone={phone}")

        return otp

    async def generate_delivery_otp(
        self,
        order_id: str,
        phone: str
    ) -> str:
        """Generate and send OTP for delivery verification.

        Args:
            order_id: Order ID
            phone: Customer phone number

        Returns:
            Generated OTP
        """
        return await self.generate_and_send_otp(
            identifier=f"delivery_{order_id}",
            phone=phone,
            purpose="delivery_verification",
            metadata={"order_id": order_id}
        )

    async def validate_delivery_otp(
        self,
        order_id: str,
        otp: str
    ) -> bool:
        """Validate OTP for delivery verification.

        Args:
            order_id: Order ID
            otp: OTP code

        Returns:
            True if OTP is valid, False otherwise
        """
        return await self.validate_otp(
            identifier=f"delivery_{order_id}",
            otp=otp,
            purpose="delivery_verification"
        )

    async def cleanup_expired_otps(self) -> int:
        """Remove expired OTPs from storage.

        Returns:
            Number of OTPs cleaned up
        """
        cleaned = 0
        now = datetime.now(timezone.utc)

        expired_identifiers = []
        for identifier, otp_data in self.otp_store.items():
            expires_at = datetime.fromisoformat(otp_data["expires_at"])
            if now > expires_at:
                expired_identifiers.append(identifier)

        for identifier in expired_identifiers:
            del self.otp_store[identifier]
            cleaned += 1

        if cleaned > 0:
            logger.info(f"Cleaned up {cleaned} expired OTPs")

        return cleaned


otp_service = OTPService()
