"""Audit Service for MaterialHub.

Handles logging of sensitive operations for security and compliance.
"""

import logging
import uuid
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import Request

from app.models.audit_log import AuditLog, AuditAction
from app.models.user import User

logger = logging.getLogger(__name__)


class AuditService:
    """Service for audit logging."""

    async def log_action(
        self,
        db: AsyncSession,
        action: AuditAction,
        actor_id: str,
        actor_role: Optional[str] = None,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        changes: Optional[Dict[str, Any]] = None,
        context: Optional[Dict[str, Any]] = None,
        status: str = "success",
        error_message: Optional[str] = None,
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log an auditable action.

        Args:
            db: Database session
            action: Type of action performed
            actor_id: ID of the user who performed the action
            actor_role: Role of the actor
            target_type: Type of target entity
            target_id: ID of target entity
            changes: Dictionary of changes made
context: Additional context
            status: Status of the action (success, failure)
            error_message: Error message if failed
            request: FastAPI request object for IP and user agent

        Returns:
            Created AuditLog entry
        """
        ip_address = None
        user_agent = None
        request_id = None

        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            request_id = request.headers.get("X-Request-ID")

        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            action=action.value,
            actor_id=actor_id,
            actor_role=actor_role,
            target_type=target_type,
            target_id=target_id,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
            changes=changes,
            context=context,
            status=status,
            error_message=error_message,
            created_at=datetime.now(timezone.utc)
        )

        db.add(audit_log)
        await db.commit()

        logger.info(
            f"Audit log: action={action.value}, actor_id={actor_id}, "
            f"target_type={target_type}, target_id={target_id}, status={status}"
        )

        return audit_log

    async def log_user_login(
        self,
        db: AsyncSession,
        user: User,
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log user login action.

        Args:
            db: Database session
            user: User who logged in
            request: FastAPI request object

        Returns:
            Created AuditLog entry
        """
        return await self.log_action(
            db=db,
            action=AuditAction.USER_LOGIN,
            actor_id=user.id,
            actor_role=user.role.value if hasattr(user.role, 'value') else str(user.role),
            target_type="user",
            target_id=user.id,
            context={"email": user.email, "phone": user.phone},
            request=request
        )

    async def log_order_created(
        self,
        db: AsyncSession,
        user: User,
        order_id: str,
        order_data: Dict[str, Any],
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log order creation action.

        Args:
            db: Database session
            user: User who created the order
            order_id: Order ID
            order_data: Order data
            request: FastAPI request object

        Returns:
            Created AuditLog entry
        """
        return await self.log_action(
            db=db,
            action=AuditAction.ORDER_CREATED,
            actor_id=user.id,
            actor_role=user.role.value if hasattr(user.role, 'value') else str(user.role),
            target_type="order",
            target_id=order_id,
            changes={"order_data": order_data},
context={"merchant_id": order_data.get("merchantId")},
            request=request
        )

    async def log_payment_verified(
        self,
        db: AsyncSession,
        user: User,
        order_id: str,
        payment_id: str,
        amount: float,
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log payment verification action.

        Args:
            db: Database session
            user: User who verified the payment
            order_id: Order ID
            payment_id: Payment ID
            amount: Payment amount
            request: FastAPI request object

        Returns:
            Created AuditLog entry
        """
        return await self.log_action(
            db=db,
            action=AuditAction.PAYMENT_VERIFIED,
            actor_id=user.id,
            actor_role=user.role.value if hasattr(user.role, 'value') else str(user.role),
            target_type="order",
            target_id=order_id,
            changes={"payment_id": payment_id, "amount": amount},
            request=request
        )

    async def log_delivery_verified(
        self,
        db: AsyncSession,
        driver_id: str,
        driver_role: str,
        order_id: str,
        trip_id: str,
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log delivery verification action.

        Args:
            db: Database session
            driver_id: Driver ID
            driver_role: Driver role
            order_id: Order ID
            trip_id: Trip ID
            request: FastAPI request object

        Returns:
            Created AuditLog entry
        """
        return await self.log_action(
            db=db,
            action=AuditAction.DELIVERY_VERIFIED,
            actor_id=driver_id,
            actor_role=driver_role,
            target_type="order",
            target_id=order_id,
context={"trip_id": trip_id},
            request=request
        )

    async def log_admin_action(
        self,
        db: AsyncSession,
        admin_id: str,
        action: str,
        target_type: str,
        target_id: str,
        changes: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log admin action.

        Args:
            db: Database session
            admin_id: Admin user ID
            action: Description of action
            target_type: Type of target
            target_id: ID of target
            changes: Changes made
            request: FastAPI request object

        Returns:
            Created AuditLog entry
        """
        return await self.log_action(
            db=db,
            action=AuditAction.ADMIN_ACTION,
            actor_id=admin_id,
            actor_role="ADMIN",
            target_type=target_type,
            target_id=target_id,
            changes=changes,
context={"action_description": action},
            request=request
        )

    async def log_security_alert(
        self,
        db: AsyncSession,
        alert_type: str,
        actor_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log security alert.

        Args:
            db: Database session
            alert_type: Type of security alert
            actor_id: User ID if applicable
            details: Alert details
            request: FastAPI request object

        Returns:
            Created AuditLog entry
        """
        return await self.log_action(
            db=db,
            action=AuditAction.SECURITY_ALERT,
            actor_id=actor_id or "system",
            target_type="security",
            target_id=alert_type,
context=details,
            request=request
        )

    async def get_audit_logs(
        self,
        db: AsyncSession,
        actor_id: Optional[str] = None,
        action: Optional[str] = None,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        limit: int = 100
    ) -> list:
        """Retrieve audit logs with optional filters.

        Args:
            db: Database session
            actor_id: Filter by actor ID
            action: Filter by action type
            target_type: Filter by target type
            target_id: Filter by target ID
            limit: Maximum number of results

        Returns:
            List of AuditLog entries
        """
        query = select(AuditLog)

        if actor_id:
            query = query.where(AuditLog.actor_id == actor_id)
        if action:
            query = query.where(AuditLog.action == action)
        if target_type:
            query = query.where(AuditLog.target_type == target_type)
        if target_id:
            query = query.where(AuditLog.target_id == target_id)

        query = query.order_by(AuditLog.created_at.desc()).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()


audit_service = AuditService()
