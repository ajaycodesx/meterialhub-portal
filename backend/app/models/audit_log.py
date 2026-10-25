"""Audit Log Model for MaterialHub.

Tracks sensitive operations for security and compliance.
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, Text
from app.core.database import Base


class AuditAction(str, enum.Enum):
    """Types of auditable actions."""
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_REGISTER = "user_register"
    ORDER_CREATED = "order_created"
    ORDER_UPDATED = "order_updated"
    ORDER_CANCELLED = "order_cancelled"
    PAYMENT_INITIATED = "payment_initiated"
    PAYMENT_VERIFIED = "payment_verified"
    PAYMENT_REFUNDED = "payment_refunded"
    TRIP_ASSIGNED = "trip_assigned"
    TRIP_STATUS_UPDATED = "trip_status_updated"
    DELIVERY_VERIFIED = "delivery_verified"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    MERCHANT_CREATED = "merchant_created"
    MERCHANT_UPDATED = "merchant_updated"
    PRODUCT_CREATED = "product_created"
    PRODUCT_UPDATED = "product_updated"
    STOCK_UPDATED = "stock_updated"
    PRICE_UPDATED = "price_updated"
    ADMIN_ACTION = "admin_action"
    SECURITY_ALERT = "security_alert"


class AuditLog(Base):
    """Audit log entry for tracking sensitive operations."""

    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, index=True)
    action = Column(String(50), nullable=False, index=True)
    actor_id = Column(String(50), nullable=False, index=True)
    actor_role = Column(String(50), nullable=True)
    target_type = Column(String(50), nullable=True, index=True)
    target_id = Column(String(50), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    request_id = Column(String(50), nullable=True, index=True)
    changes = Column(JSON, nullable=True)
    context = Column(JSON, nullable=True)
    status = Column(String(20), default="success")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
