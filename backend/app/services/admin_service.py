from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.merchant import HardwareMerchant
from app.models.user import User
from app.models.order import Order
from app.models.commodity_rate import CommodityRate
from app.schemas.admin import AdminOverviewCompositeResponse


class AdminService:

    @staticmethod
    async def get_overview_composite(db: AsyncSession) -> AdminOverviewCompositeResponse:
        """
        Single aggregated API endpoint returning whole platform pulse in 1 call.
        """
        merch_res = await db.execute(select(HardwareMerchant))
        merchants = merch_res.scalars().all()
        
        users_res = await db.execute(select(User))
        users = users_res.scalars().all()
        
        order_res = await db.execute(select(Order))
        orders = order_res.scalars().all()
        
        rates_res = await db.execute(select(CommodityRate))
        rates = rates_res.scalars().all()
        
        total_gmv = sum(o.grand_total for o in orders)
        total_tonnage = sum(o.total_weight_kg for o in orders) / 1000.0
        
        driver_count = sum(1 for u in users if u.role.value == "driver")
        
        merchant_list = [
            {
                "id": m.id,
                "name": m.name,
                "ownerName": m.owner_name,
                "phone": m.phone,
                "verified": m.verified,
                "rating": m.rating,
                "walletBalance": m.wallet_balance,
                "isOnline": m.is_online,
                "pincode": m.pincode
            } for m in merchants
        ]
        
        rate_list = [
            {
                "id": r.id,
                "material": r.material_name,
                "rate": r.wholesale_rate,
                "prevRate": r.prev_rate,
                "trend": r.trend,
                "changePercent": r.change_percent
            } for r in rates
        ]
        
        return AdminOverviewCompositeResponse(
            totalGmv=round(total_gmv, 2),
            totalOrders=len(orders),
            activeMerchantsCount=len(merchants),
            activeDriversCount=driver_count,
            todaysTonnageDispatched=round(total_tonnage, 2),
            recentOrders=[
                {
                    "orderId": o.id,
                    "invoiceNumber": o.invoice_number,
                    "grandTotal": o.grand_total,
                    "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                    "deliveryAddress": o.delivery_address
                } for o in orders
            ],
            merchantRoster=merchant_list,
            liveCommodityRates=rate_list,
            systemHealth={
                "dbStatus": "Healthy (Async SQLite / SQLAlchemy 2.0)",
                "activeRadius": "20 KM Regional Cluster",
                "uptime": "99.98%"
            }
        )

    @staticmethod
    async def update_commodity_rate(
        db: AsyncSession,
        rate_id: str,
        new_rate: float,
        trend: str = "stable",
        change_percent: float = 0.0
    ) -> bool:
        res = await db.execute(select(CommodityRate).where(CommodityRate.id == rate_id))
        item = res.scalars().first()
        if not item:
            return False
        item.prev_rate = item.wholesale_rate
        item.wholesale_rate = new_rate
        item.trend = trend
        item.change_percent = change_percent
        await db.commit()
        return True

    @staticmethod
    async def toggle_merchant(
        db: AsyncSession,
        merchant_id: str,
        field: str = "verified"
    ) -> bool:
        res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        merchant = res.scalars().first()
        if not merchant:
            return False
        if field == "verified":
            merchant.verified = not merchant.verified
        elif field == "is_online":
            merchant.is_online = not merchant.is_online
        await db.commit()
        return True

    @staticmethod
    async def get_audit_logs(
        db: AsyncSession,
        limit: int = 25
    ):
        from app.models.audit_log import AuditLog
        res = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
        logs = res.scalars().all()
        return [
            {
                "id": l.id,
                "action": l.action,
                "actorId": l.actor_id,
                "actorRole": l.actor_role,
                "targetType": l.target_type,
                "targetId": l.target_id,
                "status": l.status,
                "createdAt": l.created_at.isoformat() if l.created_at else None
            } for l in logs
        ]
