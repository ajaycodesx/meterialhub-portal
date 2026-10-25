"""WebSocket Manager for MaterialHub.

Handles real-time bidirectional communication for live updates
(order status, driver location, notifications, etc.).
"""

import logging
from typing import Dict, Set, Any
from fastapi import WebSocket
from datetime import datetime, timezone


logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        """Accept a new WebSocket connection.

        Args:
            websocket: WebSocket connection
            user_id: User ID for the connection
        """
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()

        self.active_connections[user_id].add(websocket)
        self.connection_metadata[websocket] = {
            "user_id": user_id,
            "connected_at": datetime.now(timezone.utc).isoformat()
        }

        logger.info(f"WebSocket connected: user_id={user_id}, total_connections={len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket connection.

        Args:
            websocket: WebSocket connection to remove
        """
        if websocket in self.connection_metadata:
            user_id = self.connection_metadata[websocket]["user_id"]

            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]

            del self.connection_metadata[websocket]

            logger.info(f"WebSocket disconnected: user_id={user_id}, remaining_connections={len(self.active_connections)}")

    async def send_personal_message(self, message: dict, user_id: str) -> bool:
        """Send a message to a specific user.

        Args:
            message: Message dict to send
            user_id: Target user ID

        Returns:
            True if sent successfully to at least one connection
        """
        if user_id not in self.active_connections:
            logger.warning(f"No active connections for user_id={user_id}")
            return False

        sent = False
        for connection in self.active_connections[user_id].copy():
            try:
                await connection.send_json(message)
                sent = True
            except Exception as e:
                logger.error(f"Failed to send message to user_id={user_id}: {e}")
                self.disconnect(connection)

        return sent

    async def broadcast(self, message: dict) -> int:
        """Broadcast a message to all connected users.

        Args:
            message: Message dict to broadcast

        Returns:
            Number of users the message was sent to
        """
        sent_count = 0
        for user_id, connections in self.active_connections.items():
            sent = await self.send_personal_message(message, user_id)
            if sent:
                sent_count += 1

        logger.info(f"Broadcast message sent to {sent_count} users")
        return sent_count

    async def broadcast_to_role(self, message: dict, role: str, user_roles: Dict[str, str]) -> int:
        """Broadcast a message to all users with a specific role.

        Args:
            message: Message dict to broadcast
            role: Role to filter by (BUYER, VENDOR, DRIVER, ADMIN)
            user_roles: Dict mapping user_id to role

        Returns:
            Number of users the message was sent to
        """
        sent_count = 0
        for user_id, user_role in user_roles.items():
            if user_role == role:
                sent = await self.send_personal_message(message, user_id)
                if sent:
                    sent_count += 1

        logger.info(f"Broadcast to role={role} sent to {sent_count} users")
        return sent_count

    def get_connection_count(self) -> int:
        """Get total number of active connections.

        Returns:
            Total connection count
        """
        return sum(len(conns) for conns in self.active_connections.values())

    def get_user_connection_count(self, user_id: str) -> int:
        """Get number of active connections for a specific user.

        Args:
            user_id: User ID

        Returns:
            Connection count for the user
        """
        return len(self.active_connections.get(user_id, set()))


manager = ConnectionManager()


class EventType:
    """WebSocket event type constants."""
    ORDER_STATUS_UPDATE = "order_status_update"
    DRIVER_LOCATION_UPDATE = "driver_location_update"
    TRIP_STATUS_UPDATE = "trip_status_update"
    NEW_ORDER = "new_order"
    NOTIFICATION = "notification"
    DELIVERY_VERIFICATION = "delivery_verification"
    PAYMENT_STATUS = "payment_status"
    SYSTEM_ALERT = "system_alert"


async def send_order_update(user_id: str, order_id: str, status: str) -> bool:
    """Send order status update to user.

    Args:
        user_id: User ID to notify
        order_id: Order ID
        status: New order status

    Returns:
        True if sent successfully
    """
    message = {
        "event": EventType.ORDER_STATUS_UPDATE,
        "data": {
            "order_id": order_id,
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    return await manager.send_personal_message(message, user_id)


async def send_driver_location_update(order_id: str, driver_id: str, location: dict) -> bool:
    """Send driver location update to order user.

    Args:
        order_id: Order ID
        driver_id: Driver ID
        location: Location dict with lat, lng

    Returns:
        True if sent successfully
    """
    message = {
        "event": EventType.DRIVER_LOCATION_UPDATE,
        "data": {
            "order_id": order_id,
            "driver_id": driver_id,
            "location": location,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    logger.info(f"Driver location update: order_id={order_id}, driver_id={driver_id}, location={location}")
    return True


async def send_trip_status_update(driver_id: str, trip_id: str, status: str) -> bool:
    """Send trip status update to driver.

    Args:
        driver_id: Driver ID
        trip_id: Trip ID
        status: New trip status

    Returns:
        True if sent successfully
    """
    message = {
        "event": EventType.TRIP_STATUS_UPDATE,
        "data": {
            "trip_id": trip_id,
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    return await manager.send_personal_message(message, driver_id)


async def send_new_order_notification(vendor_id: str, order_id: str, total: float) -> bool:
    """Send new order notification to vendor.

    Args:
        vendor_id: Vendor user ID
        order_id: Order ID
        total: Order total

    Returns:
        True if sent successfully
    """
    message = {
        "event": EventType.NEW_ORDER,
        "data": {
            "order_id": order_id,
            "total": total,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    return await manager.send_personal_message(message, vendor_id)


async def send_notification(user_id: str, title: str, body: str, notification_type: str = "info") -> bool:
    """Send a general notification to user.

    Args:
        user_id: User ID
        title: Notification title
        body: Notification body
        notification_type: Type (info, success, warning, error)

    Returns:
        True if sent successfully
    """
    message = {
        "event": EventType.NOTIFICATION,
        "data": {
            "title": title,
            "body": body,
            "type": notification_type,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    return await manager.send_personal_message(message, user_id)
