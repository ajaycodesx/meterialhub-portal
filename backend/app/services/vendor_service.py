from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.merchant import HardwareMerchant
from app.models.product import Product
from app.models.order import Order
from app.schemas.vendor import VendorDashboardCompositeResponse, StockUpdateRequest


class VendorService:

    @staticmethod
    async def get_dashboard_composite(
        db: AsyncSession,
        merchant_id: str = "m1"
    ) -> VendorDashboardCompositeResponse:
        """
        Single aggregated API endpoint returning full vendor store hub in 1 call.
        """
        merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        merchant = merch_res.scalars().first()
        
        order_res = await db.execute(select(Order).where(Order.merchant_id == merchant_id))
        orders = order_res.scalars().all()
        
        prod_res = await db.execute(select(Product).where(Product.merchant_id == merchant_id))
        products = prod_res.scalars().all()
        
        from datetime import datetime, timezone
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_rev = 0.0
        for o in orders:
            if o.created_at:
                if o.created_at.tzinfo:
                    order_date = o.created_at
                else:
                    order_date = o.created_at.replace(tzinfo=timezone.utc)
                if order_date >= today_start:
                    today_rev += o.grand_total
        active_count = sum(1 for o in orders if o.status in ["confirmed", "packing", "out_for_delivery"])
        pending_count = sum(1 for o in orders if o.status == "confirmed")
        low_stock = sum(1 for p in products if p.stock_qty < 50)
        
        recent_orders_list = [
            {
                "orderId": o.id,
                "invoiceNumber": o.invoice_number,
                "grandTotal": o.grand_total,
                "itemsTotal": o.items_total,
                "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                "deliveryAddress": o.delivery_address,
                "createdAt": o.created_at.isoformat() if o.created_at else datetime.now(timezone.utc).isoformat(),
                "weightKg": o.total_weight_kg
            } for o in orders[:10]
        ]
        
        inventory_list = [
            {
                "productId": p.id,
                "title": p.title,
                "category": p.category,
                "brand": p.brand,
                "price": p.price,
                "unit": p.unit,
                "stockQty": p.stock_qty,
                "isLowStock": p.stock_qty < 50
            } for p in products
        ]
        
        return VendorDashboardCompositeResponse(
            merchantId=merchant_id,
            storeName=merchant.name if merchant else "Hardware Depot",
            isOnline=merchant.is_online if merchant else True,
            walletBalance=merchant.wallet_balance if merchant else 145000.0,
            todayRevenue=round(today_rev, 2),
            activeOrdersCount=active_count,
            pendingDispatchCount=pending_count,
            lowStockCount=low_stock,
            recentOrders=recent_orders_list,
            inventoryOverview=inventory_list,
            quickStats={
                "fulfillmentRate": "99.4%",
                "avgPackingMinutes": 18,
                "rating": merchant.rating if merchant else 4.9
            }
        )

    @staticmethod
    async def update_stock(
        db: AsyncSession,
        req: StockUpdateRequest
    ) -> bool:
        res = await db.execute(select(Product).where(Product.id == req.productId))
        prod = res.scalars().first()
        if not prod:
            return False
        prod.stock_qty = req.newStockQty
        if req.newPrice:
            prod.price = req.newPrice
        await db.commit()
        return True

    @staticmethod
    async def update_order_status(
        db: AsyncSession,
        order_id: str,
        status_name: str,
        merchant_id: str
    ) -> bool:
        from app.models.order import OrderStatus
        res = await db.execute(select(Order).where(Order.id == order_id, Order.merchant_id == merchant_id))
        order = res.scalars().first()
        if not order:
            return False

        status_lookup = {
            "packing": OrderStatus.PACKING,
            "confirmed": OrderStatus.CONFIRMED,
            "ready_for_pickup": OrderStatus.PACKING,
            "cancelled": OrderStatus.CANCELLED
        }
        target_status = status_lookup.get(status_name.lower(), order.status)
        order.status = target_status

        from app.core.websocket import manager, EventType
        try:
            await manager.send_personal_message({
                "event": EventType.ORDER_STATUS_UPDATE,
                "data": {
                    "orderId": order.id,
                    "orderStatus": target_status.value if hasattr(target_status, "value") else str(target_status),
                    "message": f"Merchant updated order status to {status_name}"
                }
            }, order.user_id)
        except Exception:
            pass

        await db.commit()
        return True
