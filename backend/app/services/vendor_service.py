from datetime import datetime, timezone
import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.merchant import HardwareMerchant
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.models.delivery import DeliveryTrip, TripStatus
from app.models.user import User
from app.models.boq_quote import BoqQuote
from app.models.commodity_rate import CommodityRate
from app.models.deal import Deal
from app.models.audit_log import AuditLog
from app.schemas.vendor import VendorDashboardCompositeResponse, StockUpdateRequest
from app.core.websocket import manager, EventType


class VendorService:

    @staticmethod
    async def get_dashboard_composite(
        db: AsyncSession,
        merchant_id: str = "m1"
    ) -> VendorDashboardCompositeResponse:
        merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        merchant = merch_res.scalars().first()

        order_res = await db.execute(
            select(Order).where(Order.merchant_id == merchant_id).order_by(desc(Order.created_at))
        )
        orders = order_res.scalars().all()

        prod_res = await db.execute(
            select(Product).where(Product.merchant_id == merchant_id)
        )
        products = prod_res.scalars().all()
        if len(products) == 0:
            all_prods_res = await db.execute(select(Product))
            products = all_prods_res.scalars().all()

        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_rev = 0.0
        gross_sales = 0.0
        for o in orders:
            gross_sales += o.grand_total
            if o.created_at:
                order_date = o.created_at if o.created_at.tzinfo else o.created_at.replace(tzinfo=timezone.utc)
                if order_date >= today_start:
                    today_rev += o.grand_total

        platform_fees = gross_sales * 0.05
        net_settlements = gross_sales - platform_fees

        awaiting_action = sum(1 for o in orders if (o.status.value if hasattr(o.status, "value") else str(o.status)) == "confirmed")
        preparing = sum(1 for o in orders if (o.status.value if hasattr(o.status, "value") else str(o.status)) == "packing")
        ready_pickup = sum(1 for o in orders if (o.status.value if hasattr(o.status, "value") else str(o.status)) == "out_for_delivery")
        fulfilled = sum(1 for o in orders if (o.status.value if hasattr(o.status, "value") else str(o.status)) == "delivered")
        low_stock = sum(1 for p in products if p.stock_qty < 50)

        recent_orders_list = []
        for o in orders[:8]:
            items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == o.id))
            items = items_res.scalars().all()
            recent_orders_list.append({
                "orderId": o.id,
                "invoiceNumber": o.invoice_number,
                "grandTotal": o.grand_total,
                "itemsTotal": o.items_total,
                "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                "deliveryAddress": o.delivery_address,
                "createdAt": o.created_at.isoformat() if o.created_at else datetime.now(timezone.utc).isoformat(),
                "weightKg": o.total_weight_kg,
                "itemsCount": len(items)
            })

        inventory_list = [
            {
                "productId": p.id,
                "title": p.title,
                "category": p.category,
                "brand": p.brand,
                "price": p.price,
                "unit": p.unit,
                "stockQty": p.stock_qty,
                "weightKg": p.weight_kg,
                "isLowStock": p.stock_qty < 50
            } for p in products[:15]
        ]

        return VendorDashboardCompositeResponse(
            merchantId=merchant_id,
            storeName=merchant.name if merchant else "Hardware Depot",
            isOnline=merchant.is_online if merchant else True,
            verified=merchant.verified if merchant else True,
            walletBalance=merchant.wallet_balance if merchant else 145000.0,
            todayRevenue=round(today_rev, 2),
            grossSales=round(gross_sales, 2),
            platformFees=round(platform_fees, 2),
            netSettlementBalance=round(net_settlements, 2),
            ordersAwaitingActionCount=awaiting_action,
            ordersPreparingCount=preparing,
            ordersReadyPickupCount=ready_pickup,
            ordersFulfilledCount=fulfilled,
            lowStockCount=low_stock,
            recentOrders=recent_orders_list,
            inventoryOverview=inventory_list,
            quickStats={
                "fulfillmentRate": "99.4%",
                "avgPackingMinutes": 18,
                "rating": merchant.rating if merchant else 4.9,
                "reviewsCount": merchant.reviews_count if merchant else 240
            }
        )

    @staticmethod
    async def get_profile(db: AsyncSession, merchant_id: str) -> Optional[Dict[str, Any]]:
        res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        m = res.scalars().first()
        if not m:
            return None
        return {
            "id": m.id,
            "name": m.name,
            "ownerName": m.owner_name,
            "phone": m.phone,
            "email": m.email,
            "address": m.address,
            "pincode": m.pincode,
            "verified": m.verified,
            "rating": m.rating,
            "reviewsCount": m.reviews_count,
            "distanceKm": m.distance_km,
            "deliveryEtaMinutes": m.delivery_eta_minutes,
            "minOrderValue": m.min_order_value,
            "mainCategory": m.main_category,
            "brands": m.brands or [],
            "isOnline": m.is_online,
            "gstin": m.gstin,
            "bankAccount": m.bank_account,
            "walletBalance": m.wallet_balance
        }

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        merchant_id: str,
        data: Dict[str, Any],
        actor_id: str
    ) -> bool:
        res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        merchant = res.scalars().first()
        if not merchant:
            return False

        for k, v in data.items():
            if v is not None and hasattr(merchant, k):
                setattr(merchant, k, v)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="merchant.vendor_profile_update",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="merchant",
            target_id=merchant.id,
            changes=data,
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def toggle_online(db: AsyncSession, merchant_id: str, actor_id: str) -> bool:
        res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        merchant = res.scalars().first()
        if not merchant:
            return False
        merchant.is_online = not merchant.is_online

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="merchant.vendor_toggle_online",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="merchant",
            target_id=merchant.id,
            changes={"isOnline": merchant.is_online},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return merchant.is_online

    @staticmethod
    async def get_orders(
        db: AsyncSession,
        merchant_id: str,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        res = await db.execute(
            select(Order).where(Order.merchant_id == merchant_id).order_by(desc(Order.created_at))
        )
        all_orders = res.scalars().all()

        filtered = []
        for o in all_orders:
            s_val = o.status.value if hasattr(o.status, "value") else str(o.status)
            if status and status != "all" and s_val != status:
                continue
            if search:
                term = search.lower()
                matches_id = term in o.id.lower()
                matches_inv = o.invoice_number and term in o.invoice_number.lower()
                matches_addr = term in o.delivery_address.lower()
                if not (matches_id or matches_inv or matches_addr):
                    continue
            filtered.append(o)

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_items = []
        for o in paged:
            items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == o.id))
            items = items_res.scalars().all()

            user_res = await db.execute(select(User).where(User.id == o.user_id))
            user = user_res.scalars().first()

            trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == o.id))
            trip = trip_res.scalars().first()

            out_items.append({
                "id": o.id,
                "invoiceNumber": o.invoice_number,
                "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                "grandTotal": o.grand_total,
                "itemsTotal": o.items_total,
                "deliveryFee": o.delivery_fee,
                "gstAmount": o.gst_amount,
                "totalWeightKg": o.total_weight_kg,
                "vehicleRecommended": o.vehicle_recommended,
                "deliveryAddress": o.delivery_address,
                "pincode": o.pincode,
                "siteConstraints": o.site_constraints or {},
                "paymentMode": o.payment_mode,
                "paidAt": o.paid_at.isoformat() if o.paid_at else None,
                "createdAt": o.created_at.isoformat() if o.created_at else None,
                "buyer": {
                    "name": user.name if user else "Contractor",
                    "phone": user.phone if user else "N/A"
                },
                "trip": {
                    "status": trip.status.value if trip and hasattr(trip.status, "value") else (str(trip.status) if trip else "unassigned"),
                    "vehicleType": trip.vehicle_type if trip else None,
                    "vehicleReg": trip.vehicle_reg_number if trip else None
                } if trip else None,
                "items": [
                    {
                        "id": it.id,
                        "title": it.product_title,
                        "quantity": it.quantity,
                        "unit": it.unit,
                        "unitPrice": it.unit_price,
                        "subtotal": it.subtotal,
                        "weightKg": it.weight_kg
                    } for it in items
                ]
            })

        return {
            "orders": out_items,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def get_order_detail(
        db: AsyncSession,
        merchant_id: str,
        order_id: str
    ) -> Optional[Dict[str, Any]]:
        res = await db.execute(
            select(Order).where(Order.id == order_id, Order.merchant_id == merchant_id)
        )
        o = res.scalars().first()
        if not o:
            return None

        items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == o.id))
        items = items_res.scalars().all()

        user_res = await db.execute(select(User).where(User.id == o.user_id))
        user = user_res.scalars().first()

        trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == o.id))
        trip = trip_res.scalars().first()

        driver = None
        if trip and trip.driver_id:
            driver_res = await db.execute(select(User).where(User.id == trip.driver_id))
            driver = driver_res.scalars().first()

        return {
            "id": o.id,
            "invoiceNumber": o.invoice_number,
            "status": o.status.value if hasattr(o.status, "value") else str(o.status),
            "grandTotal": o.grand_total,
            "itemsTotal": o.items_total,
            "deliveryFee": o.delivery_fee,
            "gstAmount": o.gst_amount,
            "totalWeightKg": o.total_weight_kg,
            "vehicleRecommended": o.vehicle_recommended,
            "deliveryAddress": o.delivery_address,
            "pincode": o.pincode,
            "siteConstraints": o.site_constraints or {},
            "paymentMode": o.payment_mode,
            "paymentId": o.payment_id,
            "paidAt": o.paid_at.isoformat() if o.paid_at else None,
            "createdAt": o.created_at.isoformat() if o.created_at else None,
            "buyer": {
                "name": user.name if user else "Contractor",
                "phone": user.phone if user else "N/A",
                "email": user.email if user else "N/A"
            },
            "trip": {
                "driverName": driver.name if driver else "Awaiting driver assignment",
                "driverPhone": driver.phone if driver else "N/A",
                "vehicleType": trip.vehicle_type if trip else o.vehicle_recommended,
                "vehicleReg": trip.vehicle_reg_number if trip else "Scheduled",
                "status": trip.status.value if trip and hasattr(trip.status, "value") else (str(trip.status) if trip else "unassigned")
            } if trip else None,
            "items": [
                {
                    "id": it.id,
                    "title": it.product_title,
                    "quantity": it.quantity,
                    "unit": it.unit,
                    "unitPrice": it.unit_price,
                    "subtotal": it.subtotal,
                    "weightKg": it.weight_kg
                } for it in items
            ]
        }

    @staticmethod
    async def pack_order(
        db: AsyncSession,
        merchant_id: str,
        order_id: str,
        actor_id: str
    ) -> bool:
        res = await db.execute(
            select(Order).where(Order.id == order_id, Order.merchant_id == merchant_id)
        )
        order = res.scalars().first()
        if not order:
            return False

        order.status = OrderStatus.PACKING

        trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == order.id))
        trip = trip_res.scalars().first()
        if trip and trip.status == TripStatus.UNASSIGNED:
            trip.status = TripStatus.ACCEPTED

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="order.vendor_pack_and_ready",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="order",
            target_id=order.id,
            changes={"newStatus": "packing", "packedAt": datetime.now(timezone.utc).isoformat()},
            status="success"
        )
        db.add(audit_entry)

        try:
            await manager.send_personal_message({
                "event": EventType.ORDER_STATUS_UPDATE,
                "data": {
                    "orderId": order.id,
                    "orderStatus": "packing",
                    "message": "Materials packed by merchant. Ready for commercial truck pickup."
                }
            }, order.user_id)
        except Exception:
            pass

        await db.commit()
        return True

    @staticmethod
    async def reject_order(
        db: AsyncSession,
        merchant_id: str,
        order_id: str,
        reason: str,
        actor_id: str
    ) -> bool:
        res = await db.execute(
            select(Order).where(Order.id == order_id, Order.merchant_id == merchant_id)
        )
        order = res.scalars().first()
        if not order:
            return False

        order.status = OrderStatus.CANCELLED

        items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        items = items_res.scalars().all()
        for it in items:
            p_res = await db.execute(select(Product).where(Product.id == it.product_id))
            p = p_res.scalars().first()
            if p:
                p.stock_qty += it.quantity

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="order.vendor_reject_cancellation",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="order",
            target_id=order.id,
            changes={"status": "cancelled", "reason": reason},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_products(
        db: AsyncSession,
        merchant_id: str,
        category: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        res = await db.execute(
            select(Product).where(Product.merchant_id == merchant_id).order_by(Product.title)
        )
        merchant_prods = res.scalars().all()
        if len(merchant_prods) == 0:
            all_res = await db.execute(select(Product).order_by(Product.title))
            merchant_prods = all_res.scalars().all()

        filtered = []
        for p in merchant_prods:
            if category and category != "all" and p.category.lower() != category.lower():
                continue
            if search:
                term = search.lower()
                matches_title = term in p.title.lower()
                matches_brand = term in p.brand.lower()
                matches_cat = term in p.category.lower()
                if not (matches_title or matches_brand or matches_cat):
                    continue
            filtered.append(p)

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_items = [
            {
                "id": p.id,
                "title": p.title,
                "category": p.category,
                "brand": p.brand,
                "price": p.price,
                "unit": p.unit,
                "moq": p.moq,
                "weightSpec": p.weight_spec,
                "image": p.image,
                "grade": p.grade,
                "gauge": p.gauge,
                "weightKg": p.weight_kg,
                "stockQty": p.stock_qty,
                "isLowStock": p.stock_qty < 50
            } for p in paged
        ]

        return {
            "products": out_items,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def create_product(
        db: AsyncSession,
        merchant_id: str,
        data: Dict[str, Any],
        actor_id: str
    ) -> Dict[str, Any]:
        new_id = f"prod_{uuid.uuid4().hex[:8]}"
        prod = Product(
            id=new_id,
            title=data["title"],
            category=data["category"],
            brand=data["brand"],
            price=float(data["price"]),
            unit=data["unit"],
            moq=data.get("moq", 1),
            weight_spec=data.get("weight_spec", "Standard"),
            image=data["image"],
            grade=data.get("grade"),
            gauge=data.get("gauge"),
            weight_kg=float(data.get("weight_kg", 50.0)),
            stock_qty=int(data.get("stock_qty", 500)),
            merchant_id=merchant_id
        )
        db.add(prod)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="catalog.vendor_create_product",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="product",
            target_id=new_id,
            changes=data,
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return {"id": new_id, "title": prod.title}

    @staticmethod
    async def update_product(
        db: AsyncSession,
        merchant_id: str,
        product_id: str,
        data: Dict[str, Any],
        actor_id: str
    ) -> bool:
        res = await db.execute(select(Product).where(Product.id == product_id))
        prod = res.scalars().first()
        if not prod:
            return False

        for k, v in data.items():
            if v is not None and hasattr(prod, k):
                setattr(prod, k, v)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="catalog.vendor_update_product",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="product",
            target_id=prod.id,
            changes=data,
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def delete_product(
        db: AsyncSession,
        merchant_id: str,
        product_id: str,
        actor_id: str
    ) -> bool:
        res = await db.execute(select(Product).where(Product.id == product_id))
        prod = res.scalars().first()
        if not prod:
            return False

        await db.delete(prod)
        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="catalog.vendor_delete_product",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="product",
            target_id=product_id,
            changes={"deleted": True},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        merchant_id: str,
        product_id: str,
        adjustment_qty: int,
        reason: str,
        actor_id: str
    ) -> Dict[str, Any]:
        res = await db.execute(select(Product).where(Product.id == product_id))
        prod = res.scalars().first()
        if not prod:
            raise ValueError("Product not found")

        old_qty = prod.stock_qty
        new_qty = max(0, old_qty + adjustment_qty)
        prod.stock_qty = new_qty

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="inventory.vendor_stock_adjustment",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="product",
            target_id=prod.id,
            changes={"oldQty": old_qty, "adjustment": adjustment_qty, "newQty": new_qty, "reason": reason},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return {"productId": prod.id, "oldQty": old_qty, "newQty": new_qty}

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

    @staticmethod
    async def get_boq_quotes(db: AsyncSession, merchant_id: str) -> List[Dict[str, Any]]:
        res = await db.execute(select(BoqQuote).order_by(desc(BoqQuote.created_at)))
        quotes = res.scalars().all()
        return [
            {
                "id": q.id,
                "projectName": q.project_name,
                "deliveryPincode": q.delivery_pincode,
                "siteAddress": q.site_address,
                "rawMaterialsText": q.raw_materials_text,
                "estimatedTotal": q.estimated_total,
                "status": q.status,
                "createdAt": q.created_at.isoformat() if q.created_at else None
            } for q in quotes
        ]

    @staticmethod
    async def submit_boq_quote(
        db: AsyncSession,
        merchant_id: str,
        quote_id: str,
        estimated_total: float,
        notes: Optional[str],
        actor_id: str
    ) -> bool:
        res = await db.execute(select(BoqQuote).where(BoqQuote.id == quote_id))
        quote = res.scalars().first()
        if not quote:
            return False

        quote.estimated_total = estimated_total
        quote.status = "quoted"

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="boq.vendor_quote_submission",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="boq_quote",
            target_id=quote.id,
            changes={"estimatedTotal": estimated_total, "notes": notes},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_commodity_rates(db: AsyncSession) -> List[Dict[str, Any]]:
        res = await db.execute(select(CommodityRate))
        rates = res.scalars().all()
        return [
            {
                "id": r.id,
                "material": r.material_name,
                "unit": r.unit,
                "rate": r.wholesale_rate,
                "prevRate": r.prev_rate,
                "trend": r.trend,
                "changePercent": r.change_percent,
                "lastUpdated": r.last_updated
            } for r in rates
        ]

    @staticmethod
    async def get_deals(db: AsyncSession, merchant_id: str) -> List[Dict[str, Any]]:
        res = await db.execute(select(Deal))
        deals = res.scalars().all()
        return [
            {
                "id": d.id,
                "material": d.material,
                "brand": d.brand,
                "image": d.image,
                "originalRate": d.original_rate,
                "dealRate": d.deal_rate,
                "unit": d.unit,
                "discountPct": d.discount_pct,
                "minOrder": d.min_order,
                "badge": d.badge
            } for d in deals
        ]

    @staticmethod
    async def propose_deal(
        db: AsyncSession,
        merchant_id: str,
        data: Dict[str, Any],
        actor_id: str
    ) -> bool:
        new_deal = Deal(
            id=f"deal_{uuid.uuid4().hex[:8]}",
            material=data["material"],
            brand=data["brand"],
            image=data["image"],
            original_rate=float(data["originalRate"]),
            deal_rate=float(data["dealRate"]),
            unit=data["unit"],
            discount_pct=int(data.get("discountPct", 10)),
            min_order=data.get("minOrder", "100 Bags Min."),
            badge=data.get("badge", "Merchant Special")
        )
        db.add(new_deal)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="promotions.vendor_deal_propose",
            actor_id=actor_id,
            actor_role="vendor",
            target_type="deal",
            target_id=new_deal.id,
            changes=data,
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_settlements(db: AsyncSession, merchant_id: str) -> Dict[str, Any]:
        merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        merchant = merch_res.scalars().first()

        order_res = await db.execute(
            select(Order).where(Order.merchant_id == merchant_id).order_by(desc(Order.created_at))
        )
        orders = order_res.scalars().all()

        gross_sales = sum(o.grand_total for o in orders)
        commission = gross_sales * 0.05
        net_payable = gross_sales - commission

        records = []
        for o in orders:
            order_comm = o.grand_total * 0.05
            records.append({
                "orderId": o.id,
                "invoiceNumber": o.invoice_number,
                "grandTotal": o.grand_total,
                "platformFee": round(order_comm, 2),
                "netSettlement": round(o.grand_total - order_comm, 2),
                "paymentMode": o.payment_mode,
                "paymentId": o.payment_id or f"pay_{o.id}",
                "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                "paidAt": o.paid_at.isoformat() if o.paid_at else None,
                "createdAt": o.created_at.isoformat() if o.created_at else None
            })

        return {
            "merchantId": merchant_id,
            "bankAccount": merchant.bank_account if merchant else "9876543210123",
            "gstin": merchant.gstin if merchant else "32AAACH7409R1ZZ",
            "walletBalance": merchant.wallet_balance if merchant else 145000.0,
            "grossSales": round(gross_sales, 2),
            "platformFees": round(commission, 2),
            "netSettlement": round(net_payable, 2),
            "transactions": records
        }
