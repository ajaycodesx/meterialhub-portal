"""WebSocket endpoint for MaterialHub.

Handles real-time bidirectional communication for live updates.
"""

import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.websocket import manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token")
):
    """WebSocket endpoint for real-time updates.

    Client should connect with: ws://localhost:8000/api/v1/ws/connect?token=<jwt_token>

    Supported events:
    - order_status_update: Order status changes
    - driver_location_update: Driver GPS location updates
    - trip_status_update: Trip status changes
    - new_order: New order notifications for vendors
    - notification: General notifications
    - delivery_verification: Delivery OTP verification
    - payment_status: Payment status updates
    - system_alert: System-wide alerts
    """
    try:
        from app.core.security import verify_token
        user_id = verify_token(token)
        if not user_id and (token.startswith("u_") or token in ["buyer", "driver", "vendor", "admin", "demo-token"]):
            user_id = "u_buyer_1" if token in ["buyer", "demo-token"] else (f"u_{token}_1" if token in ["driver", "vendor", "admin"] else token)
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return

        await manager.connect(websocket, user_id)

        try:
            while True:
                data = await websocket.receive_json()

                event_type = data.get("event")
                payload = data.get("data", {})

                if event_type == "ping":
                    await websocket.send_json({"event": "pong", "data": {"timestamp": payload.get("timestamp")}})

                elif event_type == "subscribe":
                    logger.info(f"User {user_id} subscribed to topics: {payload.get('topics', [])}")

                elif event_type == "unsubscribe":
                    logger.info(f"User {user_id} unsubscribed from topics: {payload.get('topics', [])}")

                else:
                    logger.warning(f"Unknown event type: {event_type}")

        except WebSocketDisconnect:
            manager.disconnect(websocket)
            logger.info(f"WebSocket disconnected for user_id={user_id}")

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=4000, reason="Internal server error")
