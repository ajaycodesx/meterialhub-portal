from datetime import datetime, timezone
import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.merchant import HardwareMerchant
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.category import MaterialCategory
from app.models.delivery import DeliveryTrip, TripStatus
from app.models.boq_quote import BoqQuote
from app.models.deal import Deal
from app.models.commodity_rate import CommodityRate
from app.models.audit_log import AuditLog
from app.schemas.admin import AdminOverviewCompositeResponse

PLATFORM_SETTINGS_STORE = {
    "platformCommissionPercent": 5.0,
    "defaultGstPercent": 18.0,
    "serviceRadiusKm": 25.0,
    "autoDispatchEnabled": True,
    "maintenanceMode": False,
}

COMMUNICATION_TEMPLATES_STORE = [
    {
        "templateId": "tmpl_order_confirmation",
        "name": "Order Confirmation SMS",
        "channel": "SMS",
        "subject": None,
        "bodyText": "MaterialHub: Your order #{orderId} of INR {grandTotal} has been confirmed. Direct merchant delivery assigned.",
        "isActive": True
    },
    {
        "templateId": "tmpl_driver_dispatch",
        "name": "Driver Dispatch Notification",
        "channel": "SMS / Push",
        "subject": None,
        "bodyText": "MaterialHub: Commercial vehicle {vehicleReg} dispatched for order #{orderId}. ETA {etaMinutes} mins.",
        "isActive": True
    },
    {
        "templateId": "tmpl_delivery_otp",
        "name": "Site Unloading OTP",
        "channel": "SMS",
        "subject": None,
        "bodyText": "Your MaterialHub unloading verification OTP is {otpCode}. Provide this to the driver upon physical cargo verification.",
        "isActive": True
    },
    {
        "templateId": "tmpl_merchant_alert",
        "name": "Merchant Order Alert",
        "channel": "Email / WhatsApp",
        "subject": "New MaterialHub Wholesale Order",
        "bodyText": "New contractor order #{orderId} received. Please pack materials and signal driver pickup readiness.",
        "isActive": True
    }
]

DISPUTES_STORE = [
    {
        "id": "disp_88201",
        "orderId": "ord_98241",
        "buyerName": "Ajay Construction Corp",
        "merchantName": "Kakkanad Building Supplies",
        "issueType": "Damaged Bags on Unloading",
        "reportedDate": "2026-10-24T14:30:00Z",
        "amount": 2500.0,
        "status": "under_investigation",
        "resolutionNotes": "Driver photos uploaded. 5 cement bags damaged during transit. Merchant agreed to replacement credit."
    }
]


class AdminService:

    @staticmethod
    async def get_overview_composite(db: AsyncSession) -> AdminOverviewCompositeResponse:
        merch_res = await db.execute(select(HardwareMerchant))
        merchants = merch_res.scalars().all()

        users_res = await db.execute(select(User))
        users = users_res.scalars().all()

        order_res = await db.execute(select(Order).order_by(desc(Order.created_at)))
        orders = order_res.scalars().all()

        rates_res = await db.execute(select(CommodityRate))
        rates = rates_res.scalars().all()

        prod_res = await db.execute(select(Product))
        products = prod_res.scalars().all()

        boq_res = await db.execute(select(BoqQuote))
        boqs = boq_res.scalars().all()

        total_gmv = sum(o.grand_total for o in orders)
        commission_rate = PLATFORM_SETTINGS_STORE["platformCommissionPercent"] / 100.0
        platform_revenue = total_gmv * commission_rate
        net_settlements = total_gmv - platform_revenue

        total_tonnage = sum(o.total_weight_kg for o in orders) / 1000.0

        orders_by_status = {
            "pending": 0,
            "confirmed": 0,
            "packing": 0,
            "out_for_delivery": 0,
            "delivered": 0,
            "cancelled": 0,
            "refunded": 0
        }
        failed_payments = 0
        for o in orders:
            status_val = o.status.value if hasattr(o.status, "value") else str(o.status)
            if status_val in orders_by_status:
                orders_by_status[status_val] += 1
            if status_val == "cancelled" or (o.payment_mode == "Razorpay UPI / Online" and not o.payment_id and status_val == "pending"):
                failed_payments += 1

        verified_merchants = sum(1 for m in merchants if m.verified)
        pending_merchants = sum(1 for m in merchants if not m.verified)
        online_merchants = sum(1 for m in merchants if m.is_online)

        drivers = [u for u in users if u.role == UserRole.DRIVER or getattr(u.role, "value", None) == "driver"]
        active_drivers = sum(1 for d in drivers if d.is_active)

        low_stock_count = sum(1 for p in products if p.stock_qty < 100)
        pending_boqs = sum(1 for b in boqs if b.status in ["under_review", "pending"])

        merchant_list = [
            {
                "id": m.id,
                "name": m.name,
                "ownerName": m.owner_name,
                "phone": m.phone,
                "email": m.email,
                "address": m.address,
                "verified": m.verified,
                "rating": m.rating,
                "walletBalance": m.wallet_balance,
                "isOnline": m.is_online,
                "pincode": m.pincode,
                "gstin": m.gstin,
                "bankAccount": m.bank_account
            } for m in merchants
        ]

        rate_list = [
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

        recent_orders_list = [
            {
                "orderId": o.id,
                "userId": o.user_id,
                "merchantId": o.merchant_id,
                "invoiceNumber": o.invoice_number,
                "grandTotal": o.grand_total,
                "itemsTotal": o.items_total,
                "deliveryFee": o.delivery_fee,
                "gstAmount": o.gst_amount,
                "paymentMode": o.payment_mode,
                "paymentId": o.payment_id,
                "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                "deliveryAddress": o.delivery_address,
                "pincode": o.pincode,
                "createdAt": o.created_at.isoformat() if o.created_at else None
            } for o in orders[:10]
        ]

        return AdminOverviewCompositeResponse(
            totalGmv=round(total_gmv, 2),
            platformRevenue=round(platform_revenue, 2),
            netSettlements=round(net_settlements, 2),
            totalOrders=len(orders),
            ordersByStatus=orders_by_status,
            merchantsStats={
                "total": len(merchants),
                "verified": verified_merchants,
                "pending": pending_merchants,
                "online": online_merchants
            },
            driversStats={
                "total": len(drivers),
                "active": active_drivers
            },
            productsCount=len(products),
            lowStockCount=low_stock_count,
            pendingBoqQuotes=pending_boqs,
            todaysTonnageDispatched=round(total_tonnage, 2),
            recentOrders=recent_orders_list,
            merchantRoster=merchant_list,
            liveCommodityRates=rate_list,
            systemHealth={
                "dbStatus": "Operational (SQLAlchemy 2.0 Async Pool)",
                "activeRadius": f"{PLATFORM_SETTINGS_STORE['serviceRadiusKm']} KM Regional Hub",
                "uptime": "99.98%",
                "autoDispatch": "Active" if PLATFORM_SETTINGS_STORE["autoDispatchEnabled"] else "Disabled",
                "mode": "Live Production"
            },
            failedPaymentsCount=failed_payments
        )

    @staticmethod
    async def get_orders(
        db: AsyncSession,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        query = select(Order).order_by(desc(Order.created_at))
        res = await db.execute(query)
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
        paged_orders = filtered[start_idx : start_idx + limit]

        out_items = []
        for o in paged_orders:
            items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == o.id))
            items = items_res.scalars().all()

            trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == o.id))
            trip = trip_res.scalars().first()

            merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == o.merchant_id))
            merchant = merch_res.scalars().first()

            user_res = await db.execute(select(User).where(User.id == o.user_id))
            user = user_res.scalars().first()

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
                "paymentMode": o.payment_mode,
                "paymentId": o.payment_id,
                "paymentOrderId": o.payment_order_id,
                "paidAt": o.paid_at.isoformat() if o.paid_at else None,
                "createdAt": o.created_at.isoformat() if o.created_at else None,
                "buyer": {
                    "id": user.id if user else o.user_id,
                    "name": user.name if user else "Buyer",
                    "phone": user.phone if user else "N/A",
                    "email": user.email if user else "N/A"
                },
                "merchant": {
                    "id": merchant.id if merchant else o.merchant_id,
                    "name": merchant.name if merchant else "Hardware Store",
                    "phone": merchant.phone if merchant else "N/A",
                    "address": merchant.address if merchant else "N/A"
                },
                "trip": {
                    "id": trip.id if trip else None,
                    "driverId": trip.driver_id if trip else None,
                    "status": trip.status.value if trip and hasattr(trip.status, "value") else (str(trip.status) if trip else None),
                    "vehicleType": trip.vehicle_type if trip else None,
                    "vehicleReg": trip.vehicle_reg_number if trip else None
                } if trip else None,
                "items": [
                    {
                        "id": i.id,
                        "title": i.product_title,
                        "quantity": i.quantity,
                        "unit": i.unit,
                        "unitPrice": i.unit_price,
                        "subtotal": i.subtotal,
                        "weightKg": i.weight_kg
                    } for i in items
                ]
            })

        return {
            "orders": out_items,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def get_order_detail(db: AsyncSession, order_id: str) -> Optional[Dict[str, Any]]:
        res = await db.execute(select(Order).where(Order.id == order_id))
        order = res.scalars().first()
        if not order:
            return None

        items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        items = items_res.scalars().all()

        trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == order.id))
        trip = trip_res.scalars().first()

        merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == order.merchant_id))
        merchant = merch_res.scalars().first()

        user_res = await db.execute(select(User).where(User.id == order.user_id))
        user = user_res.scalars().first()

        driver = None
        if trip and trip.driver_id:
            driver_res = await db.execute(select(User).where(User.id == trip.driver_id))
            driver = driver_res.scalars().first()

        return {
            "id": order.id,
            "invoiceNumber": order.invoice_number,
            "status": order.status.value if hasattr(order.status, "value") else str(order.status),
            "grandTotal": order.grand_total,
            "itemsTotal": order.items_total,
            "deliveryFee": order.delivery_fee,
            "gstAmount": order.gst_amount,
            "totalWeightKg": order.total_weight_kg,
            "vehicleRecommended": order.vehicle_recommended,
            "deliveryAddress": order.delivery_address,
            "pincode": order.pincode,
            "siteConstraints": order.site_constraints,
            "paymentMode": order.payment_mode,
            "paymentId": order.payment_id,
            "paymentOrderId": order.payment_order_id,
            "paidAt": order.paid_at.isoformat() if order.paid_at else None,
            "createdAt": order.created_at.isoformat() if order.created_at else None,
            "updatedAt": order.updated_at.isoformat() if order.updated_at else None,
            "buyer": {
                "id": user.id if user else order.user_id,
                "name": user.name if user else "Buyer",
                "phone": user.phone if user else "N/A",
                "email": user.email if user else "N/A"
            },
            "merchant": {
                "id": merchant.id if merchant else order.merchant_id,
                "name": merchant.name if merchant else "Hardware Store",
                "ownerName": merchant.owner_name if merchant else "N/A",
                "phone": merchant.phone if merchant else "N/A",
                "address": merchant.address if merchant else "N/A",
                "gstin": merchant.gstin if merchant else "N/A"
            },
            "trip": {
                "id": trip.id if trip else None,
                "driverId": trip.driver_id if trip else None,
                "driverName": driver.name if driver else "Unassigned",
                "driverPhone": driver.phone if driver else "N/A",
                "status": trip.status.value if trip and hasattr(trip.status, "value") else (str(trip.status) if trip else None),
                "vehicleType": trip.vehicle_type if trip else None,
                "vehicleReg": trip.vehicle_reg_number if trip else None,
                "tripFare": trip.trip_fare if trip else 0.0,
                "currentGps": trip.current_gps if trip else None
            } if trip else None,
            "items": [
                {
                    "id": i.id,
                    "productId": i.product_id,
                    "title": i.product_title,
                    "quantity": i.quantity,
                    "unit": i.unit,
                    "unitPrice": i.unit_price,
                    "subtotal": i.subtotal,
                    "weightKg": i.weight_kg
                } for i in items
            ]
        }

    @staticmethod
    async def update_order_status(
        db: AsyncSession,
        order_id: str,
        new_status_str: str,
        reason: Optional[str],
        admin_id: str
    ) -> bool:
        res = await db.execute(select(Order).where(Order.id == order_id))
        order = res.scalars().first()
        if not order:
            return False

        try:
            valid_status = OrderStatus(new_status_str.lower())
        except ValueError:
            return False

        old_status = order.status.value if hasattr(order.status, "value") else str(order.status)
        order.status = valid_status

        trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == order.id))
        trip = trip_res.scalars().first()
        if trip:
            if valid_status == OrderStatus.DELIVERED:
                trip.status = TripStatus.UNLOADED_COMPLETED
                trip.completed_at = datetime.now(timezone.utc)
            elif valid_status == OrderStatus.OUT_FOR_DELIVERY:
                trip.status = TripStatus.IN_TRANSIT
            elif valid_status == OrderStatus.PACKING:
                trip.status = TripStatus.ACCEPTED

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="order.admin_status_update",
            actor_id=admin_id,
            actor_role="admin",
            target_type="order",
            target_id=order.id,
            changes={"oldStatus": old_status, "newStatus": valid_status.value, "reason": reason},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def reassign_order_driver(
        db: AsyncSession,
        order_id: str,
        driver_id: str,
        reason: Optional[str],
        admin_id: str
    ) -> bool:
        driver_res = await db.execute(select(User).where(User.id == driver_id))
        driver = driver_res.scalars().first()
        if not driver or driver.role != UserRole.DRIVER:
            return False

        trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == order_id))
        trip = trip_res.scalars().first()
        if not trip:
            return False

        old_driver_id = trip.driver_id
        trip.driver_id = driver.id
        trip.vehicle_type = driver.vehicle_type or trip.vehicle_type
        if trip.status == TripStatus.UNASSIGNED:
            trip.status = TripStatus.ASSIGNED

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="dispatch.admin_reassign_driver",
            actor_id=admin_id,
            actor_role="admin",
            target_type="delivery_trip",
            target_id=trip.id,
            changes={"oldDriverId": old_driver_id, "newDriverId": driver.id, "reason": reason},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_merchants(
        db: AsyncSession,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        query = select(HardwareMerchant).order_by(HardwareMerchant.name)
        res = await db.execute(query)
        merchants = res.scalars().all()

        filtered = []
        for m in merchants:
            if status == "verified" and not m.verified:
                continue
            if status == "pending" and m.verified:
                continue
            if status == "online" and not m.is_online:
                continue
            if status == "offline" and m.is_online:
                continue
            if search:
                term = search.lower()
                matches_name = term in m.name.lower()
                matches_owner = term in m.owner_name.lower()
                matches_phone = term in m.phone.lower()
                matches_gst = m.gstin and term in m.gstin.lower()
                if not (matches_name or matches_owner or matches_phone or matches_gst):
                    continue
            filtered.append(m)

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_merchants = []
        for m in paged:
            prod_count_res = await db.execute(select(Product).where(Product.merchant_id == m.id))
            prod_count = len(prod_count_res.scalars().all())

            order_count_res = await db.execute(select(Order).where(Order.merchant_id == m.id))
            orders = order_count_res.scalars().all()
            revenue = sum(o.grand_total for o in orders if o.status == OrderStatus.DELIVERED)

            out_merchants.append({
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
                "brands": m.brands,
                "isOnline": m.is_online,
                "gstin": m.gstin,
                "bankAccount": m.bank_account,
                "walletBalance": m.wallet_balance,
                "productsCount": prod_count,
                "ordersCount": len(orders),
                "totalDeliveredRevenue": round(revenue, 2),
                "createdAt": m.created_at.isoformat() if m.created_at else None
            })

        return {
            "merchants": out_merchants,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def get_merchant_detail(db: AsyncSession, merchant_id: str) -> Optional[Dict[str, Any]]:
        res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        m = res.scalars().first()
        if not m:
            return None

        prod_res = await db.execute(select(Product).where(Product.merchant_id == m.id))
        products = prod_res.scalars().all()

        order_res = await db.execute(select(Order).where(Order.merchant_id == m.id).order_by(desc(Order.created_at)))
        orders = order_res.scalars().all()

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
            "brands": m.brands,
            "isOnline": m.is_online,
            "gstin": m.gstin,
            "bankAccount": m.bank_account,
            "walletBalance": m.wallet_balance,
            "createdAt": m.created_at.isoformat() if m.created_at else None,
            "products": [
                {
                    "id": p.id,
                    "title": p.title,
                    "category": p.category,
                    "brand": p.brand,
                    "price": p.price,
                    "unit": p.unit,
                    "stockQty": p.stock_qty
                } for p in products
            ],
            "recentOrders": [
                {
                    "id": o.id,
                    "invoiceNumber": o.invoice_number,
                    "grandTotal": o.grand_total,
                    "status": o.status.value if hasattr(o.status, "value") else str(o.status),
                    "createdAt": o.created_at.isoformat() if o.created_at else None
                } for o in orders[:5]
            ]
        }

    @staticmethod
    async def verify_merchant(
        db: AsyncSession,
        merchant_id: str,
        verified: bool,
        is_online: bool,
        reason: Optional[str],
        admin_id: str
    ) -> bool:
        res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == merchant_id))
        merchant = res.scalars().first()
        if not merchant:
            return False

        old_state = {"verified": merchant.verified, "is_online": merchant.is_online}
        merchant.verified = verified
        merchant.is_online = is_online

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="merchant.admin_verification_update",
            actor_id=admin_id,
            actor_role="admin",
            target_type="merchant",
            target_id=merchant.id,
            changes={"old": old_state, "new": {"verified": verified, "is_online": is_online}, "reason": reason},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def update_merchant(
        db: AsyncSession,
        merchant_id: str,
        data: Dict[str, Any],
        admin_id: str
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
            action="merchant.admin_profile_update",
            actor_id=admin_id,
            actor_role="admin",
            target_type="merchant",
            target_id=merchant.id,
            changes=data,
            status="success"
        )
        db.add(audit_entry)
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
    async def get_products(
        db: AsyncSession,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        query = select(Product).order_by(Product.title)
        res = await db.execute(query)
        all_prods = res.scalars().all()

        filtered = []
        for p in all_prods:
            if category and category != "all" and p.category.lower() != category.lower():
                continue
            if brand and brand != "all" and p.brand.lower() != brand.lower():
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
                "merchantId": p.merchant_id,
                "createdAt": p.created_at.isoformat() if p.created_at else None
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
        data: Dict[str, Any],
        admin_id: str
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
            merchant_id=data.get("merchant_id")
        )
        db.add(prod)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="catalog.admin_create_product",
            actor_id=admin_id,
            actor_role="admin",
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
        product_id: str,
        data: Dict[str, Any],
        admin_id: str
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
            action="catalog.admin_update_product",
            actor_id=admin_id,
            actor_role="admin",
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
        product_id: str,
        admin_id: str
    ) -> bool:
        res = await db.execute(select(Product).where(Product.id == product_id))
        prod = res.scalars().first()
        if not prod:
            return False

        await db.delete(prod)
        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="catalog.admin_delete_product",
            actor_id=admin_id,
            actor_role="admin",
            target_type="product",
            target_id=product_id,
            changes={"deleted": True},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_categories(db: AsyncSession) -> List[Dict[str, Any]]:
        res = await db.execute(select(MaterialCategory))
        categories = res.scalars().all()
        return [
            {
                "id": c.id,
                "title": c.title,
                "subtitle": c.subtitle,
                "iconName": c.icon_name,
                "colorBg": c.color_bg,
                "itemCount": c.item_count,
                "trendingBadge": c.trending_badge,
                "image": c.image,
                "subcategories": c.subcategories or [],
                "featuredBrands": c.featured_brands or []
            } for c in categories
        ]

    @staticmethod
    async def save_category(
        db: AsyncSession,
        data: Dict[str, Any],
        admin_id: str
    ) -> bool:
        cat_id = data["id"]
        res = await db.execute(select(MaterialCategory).where(MaterialCategory.id == cat_id))
        cat = res.scalars().first()
        if cat:
            for k, v in data.items():
                if v is not None and hasattr(cat, k):
                    setattr(cat, k, v)
        else:
            cat = MaterialCategory(
                id=cat_id,
                title=data["title"],
                subtitle=data["subtitle"],
                icon_name=data["icon_name"],
                color_bg=data.get("color_bg", "bg-[#FF6500]"),
                item_count=data.get("item_count", 100),
                trending_badge=data.get("trending_badge"),
                image=data["image"],
                subcategories=data.get("subcategories", []),
                featured_brands=data.get("featured_brands", [])
            )
            db.add(cat)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="catalog.admin_save_category",
            actor_id=admin_id,
            actor_role="admin",
            target_type="category",
            target_id=cat_id,
            changes=data,
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_buyers(
        db: AsyncSession,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        res = await db.execute(select(User).where(User.role == UserRole.BUYER))
        buyers = res.scalars().all()

        filtered = []
        for b in buyers:
            if search:
                term = search.lower()
                matches_name = term in b.name.lower()
                matches_phone = term in b.phone.lower()
                matches_email = term in b.email.lower()
                if not (matches_name or matches_phone or matches_email):
                    continue
            filtered.append(b)

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_list = []
        for b in paged:
            orders_res = await db.execute(select(Order).where(Order.user_id == b.id))
            orders = orders_res.scalars().all()
            total_spend = sum(o.grand_total for o in orders)

            out_list.append({
                "id": b.id,
                "name": b.name,
                "email": b.email,
                "phone": b.phone,
                "isActive": b.is_active,
                "isVerified": b.is_verified,
                "savedAddresses": b.saved_addresses or [],
                "ordersCount": len(orders),
                "totalSpend": round(total_spend, 2),
                "createdAt": b.created_at.isoformat() if b.created_at else None
            })

        return {
            "buyers": out_list,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def toggle_user_status(
        db: AsyncSession,
        user_id: str,
        field: str,
        admin_id: str
    ) -> bool:
        res = await db.execute(select(User).where(User.id == user_id))
        user = res.scalars().first()
        if not user:
            return False

        old_val = getattr(user, field, None)
        if field == "is_active":
            user.is_active = not user.is_active
        elif field == "is_verified":
            user.is_verified = not user.is_verified

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action=f"user.admin_toggle_{field}",
            actor_id=admin_id,
            actor_role="admin",
            target_type="user",
            target_id=user.id,
            changes={"field": field, "old": old_val, "new": getattr(user, field, None)},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_drivers(
        db: AsyncSession,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        res = await db.execute(select(User).where(User.role == UserRole.DRIVER))
        drivers = res.scalars().all()

        filtered = []
        for d in drivers:
            if search:
                term = search.lower()
                matches_name = term in d.name.lower()
                matches_phone = term in d.phone.lower()
                matches_veh = d.vehicle_type and term in d.vehicle_type.lower()
                matches_lic = d.driver_license and term in d.driver_license.lower()
                if not (matches_name or matches_phone or matches_veh or matches_lic):
                    continue
            filtered.append(d)

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_list = []
        for d in paged:
            trips_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.driver_id == d.id))
            trips = trips_res.scalars().all()
            completed_trips = sum(1 for t in trips if t.status == TripStatus.UNLOADED_COMPLETED)
            total_earnings = sum(t.trip_fare + t.tip_amount for t in trips if t.status == TripStatus.UNLOADED_COMPLETED)

            active_trip = next((t for t in trips if t.status not in [TripStatus.UNASSIGNED, TripStatus.UNLOADED_COMPLETED]), None)

            out_list.append({
                "id": d.id,
                "name": d.name,
                "email": d.email,
                "phone": d.phone,
                "isActive": d.is_active,
                "isVerified": d.is_verified,
                "vehicleType": d.vehicle_type,
                "driverLicense": d.driver_license,
                "tripsCount": len(trips),
                "completedTripsCount": completed_trips,
                "totalEarnings": round(total_earnings, 2),
                "isBusy": active_trip is not None,
                "currentTripId": active_trip.id if active_trip else None,
                "createdAt": d.created_at.isoformat() if d.created_at else None
            })

        return {
            "drivers": out_list,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def get_trips(
        db: AsyncSession,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        res = await db.execute(select(DeliveryTrip).order_by(desc(DeliveryTrip.created_at)))
        all_trips = res.scalars().all()

        filtered = []
        for t in all_trips:
            s_val = t.status.value if hasattr(t.status, "value") else str(t.status)
            if status and status != "all" and s_val != status:
                continue
            if search:
                term = search.lower()
                matches_id = term in t.id.lower()
                matches_ord = term in t.order_id.lower()
                matches_reg = term in t.vehicle_reg_number.lower()
                if not (matches_id or matches_ord or matches_reg):
                    continue
            filtered.append(t)

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_list = []
        for t in paged:
            driver_name = "Unassigned"
            driver_phone = "N/A"
            if t.driver_id:
                d_res = await db.execute(select(User).where(User.id == t.driver_id))
                driver = d_res.scalars().first()
                if driver:
                    driver_name = driver.name
                    driver_phone = driver.phone

            out_list.append({
                "id": t.id,
                "orderId": t.order_id,
                "driverId": t.driver_id,
                "driverName": driver_name,
                "driverPhone": driver_phone,
                "vehicleType": t.vehicle_type,
                "vehicleReg": t.vehicle_reg_number,
                "pickupAddress": t.pickup_address,
                "dropAddress": t.drop_address,
                "distanceKm": t.distance_km,
                "tripFare": t.trip_fare,
                "tipAmount": t.tip_amount,
                "status": t.status.value if hasattr(t.status, "value") else str(t.status),
                "currentGps": t.current_gps,
                "createdAt": t.created_at.isoformat() if t.created_at else None,
                "completedAt": t.completed_at.isoformat() if t.completed_at else None
            })

        return {
            "trips": out_list,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def update_trip_status(
        db: AsyncSession,
        trip_id: str,
        new_status_str: str,
        admin_id: str
    ) -> bool:
        res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.id == trip_id))
        trip = res.scalars().first()
        if not trip:
            return False

        try:
            valid_status = TripStatus(new_status_str.lower())
        except ValueError:
            return False

        old_status = trip.status.value if hasattr(trip.status, "value") else str(trip.status)
        trip.status = valid_status
        if valid_status == TripStatus.UNLOADED_COMPLETED:
            trip.completed_at = datetime.now(timezone.utc)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="dispatch.admin_trip_status_update",
            actor_id=admin_id,
            actor_role="admin",
            target_type="delivery_trip",
            target_id=trip.id,
            changes={"oldStatus": old_status, "newStatus": valid_status.value},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_payments(
        db: AsyncSession,
        status: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        res = await db.execute(select(Order).order_by(desc(Order.created_at)))
        orders = res.scalars().all()

        filtered = []
        for o in orders:
            order_status = o.status.value if hasattr(o.status, "value") else str(o.status)
            is_refunded = order_status == "refunded"
            is_paid = o.paid_at is not None or o.payment_id is not None
            payment_status = "Refunded" if is_refunded else ("Captured" if is_paid else "Pending")

            if status and status != "all":
                if status.lower() != payment_status.lower():
                    continue

            if search:
                term = search.lower()
                matches_id = term in o.id.lower()
                matches_pid = o.payment_id and term in o.payment_id.lower()
                matches_poid = o.payment_order_id and term in o.payment_order_id.lower()
                if not (matches_id or matches_pid or matches_poid):
                    continue

            filtered.append((o, payment_status))

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_list = []
        for o, p_status in paged:
            user_res = await db.execute(select(User).where(User.id == o.user_id))
            user = user_res.scalars().first()

            merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == o.merchant_id))
            merchant = merch_res.scalars().first()

            commission = o.grand_total * (PLATFORM_SETTINGS_STORE["platformCommissionPercent"] / 100.0)
            net_settlement = o.grand_total - commission

            out_list.append({
                "orderId": o.id,
                "invoiceNumber": o.invoice_number,
                "paymentId": o.payment_id or f"pay_sim_{o.id}",
                "paymentOrderId": o.payment_order_id or f"order_sim_{o.id}",
                "paymentMode": o.payment_mode,
                "paymentStatus": p_status,
                "orderStatus": o.status.value if hasattr(o.status, "value") else str(o.status),
                "grandTotal": o.grand_total,
                "itemsTotal": o.items_total,
                "deliveryFee": o.delivery_fee,
                "gstAmount": o.gst_amount,
                "platformFee": round(commission, 2),
                "netSettlement": round(net_settlement, 2),
                "buyerName": user.name if user else "Contractor",
                "merchantName": merchant.name if merchant else "Merchant Store",
                "paidAt": o.paid_at.isoformat() if o.paid_at else None,
                "createdAt": o.created_at.isoformat() if o.created_at else None
            })

        return {
            "payments": out_list,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def process_refund(
        db: AsyncSession,
        order_id: str,
        amount: Optional[float],
        reason: str,
        admin_id: str
    ) -> bool:
        res = await db.execute(select(Order).where(Order.id == order_id))
        order = res.scalars().first()
        if not order:
            return False

        refund_amount = amount if amount is not None else order.grand_total
        order.status = OrderStatus.REFUNDED

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="finance.admin_refund_processed",
            actor_id=admin_id,
            actor_role="admin",
            target_type="order",
            target_id=order.id,
            changes={"refundAmount": refund_amount, "reason": reason, "orderStatus": "refunded"},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_boq_quotes(
        db: AsyncSession,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        res = await db.execute(select(BoqQuote).order_by(desc(BoqQuote.created_at)))
        quotes = res.scalars().all()

        filtered = []
        for q in quotes:
            if status and status != "all" and q.status != status:
                continue
            filtered.append(q)

        total_count = len(filtered)
        start_idx = (page - 1) * limit
        paged = filtered[start_idx : start_idx + limit]

        out_list = []
        for q in paged:
            user_res = await db.execute(select(User).where(User.id == q.user_id))
            user = user_res.scalars().first()

            out_list.append({
                "id": q.id,
                "projectName": q.project_name,
                "deliveryPincode": q.delivery_pincode,
                "siteAddress": q.site_address,
                "fileUrl": q.file_url,
                "rawMaterialsText": q.raw_materials_text,
                "parsedItems": q.parsed_items or [],
                "estimatedTotal": q.estimated_total,
                "status": q.status,
                "buyer": {
                    "id": user.id if user else q.user_id,
                    "name": user.name if user else "Contractor",
                    "phone": user.phone if user else "N/A",
                    "email": user.email if user else "N/A"
                },
                "createdAt": q.created_at.isoformat() if q.created_at else None
            })

        return {
            "quotes": out_list,
            "totalCount": total_count,
            "page": page,
            "limit": limit
        }

    @staticmethod
    async def update_boq_quote(
        db: AsyncSession,
        quote_id: str,
        new_status: str,
        estimated_total: Optional[float],
        admin_id: str
    ) -> bool:
        res = await db.execute(select(BoqQuote).where(BoqQuote.id == quote_id))
        quote = res.scalars().first()
        if not quote:
            return False

        old_status = quote.status
        quote.status = new_status
        if estimated_total is not None:
            quote.estimated_total = estimated_total

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="boq.admin_quote_update",
            actor_id=admin_id,
            actor_role="admin",
            target_type="boq_quote",
            target_id=quote.id,
            changes={"oldStatus": old_status, "newStatus": new_status, "estimatedTotal": estimated_total},
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
                "wholesaleRate": r.wholesale_rate,
                "prevRate": r.prev_rate,
                "trend": r.trend,
                "changePercent": r.change_percent,
                "lastUpdated": r.last_updated
            } for r in rates
        ]

    @staticmethod
    async def update_commodity_rate(
        db: AsyncSession,
        rate_id: str,
        new_rate: float,
        trend: str = "stable",
        change_percent: float = 0.0,
        admin_id: Optional[str] = "u_admin_1"
    ) -> bool:
        res = await db.execute(select(CommodityRate).where(CommodityRate.id == rate_id))
        item = res.scalars().first()
        if not item:
            return False
        old_rate = item.wholesale_rate
        item.prev_rate = old_rate
        item.wholesale_rate = new_rate
        item.trend = trend
        item.change_percent = change_percent
        item.last_updated = "Updated today by operations"

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="pricing.commodity_rate_update",
            actor_id=admin_id or "admin",
            actor_role="admin",
            target_type="commodity_rate",
            target_id=rate_id,
            changes={"oldRate": old_rate, "newRate": new_rate, "trend": trend},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_deals(db: AsyncSession) -> List[Dict[str, Any]]:
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
                "badge": d.badge,
                "badgeColor": d.badge_color,
                "expiresInSeconds": d.expires_in_seconds,
                "createdAt": d.created_at.isoformat() if d.created_at else None
            } for d in deals
        ]

    @staticmethod
    async def save_deal(
        db: AsyncSession,
        data: Dict[str, Any],
        admin_id: str
    ) -> bool:
        deal_id = data.get("id")
        deal = None
        if deal_id:
            res = await db.execute(select(Deal).where(Deal.id == deal_id))
            deal = res.scalars().first()

        if deal:
            for k, v in data.items():
                if v is not None and hasattr(deal, k):
                    setattr(deal, k, v)
        else:
            deal_id = deal_id or f"deal_{uuid.uuid4().hex[:8]}"
            deal = Deal(
                id=deal_id,
                material=data["material"],
                brand=data["brand"],
                image=data["image"],
                original_rate=float(data["original_rate"]),
                deal_rate=float(data["deal_rate"]),
                unit=data["unit"],
                discount_pct=int(data.get("discount_pct", 10)),
                min_order=data.get("min_order", "100 Bags Min."),
                badge=data.get("badge", "Flash Deal"),
                badge_color=data.get("badge_color", "bg-[#FF6500]"),
                expires_in_seconds=int(data.get("expires_in_seconds", 18000))
            )
            db.add(deal)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="promotions.admin_deal_save",
            actor_id=admin_id,
            actor_role="admin",
            target_type="deal",
            target_id=deal_id,
            changes=data,
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def delete_deal(
        db: AsyncSession,
        deal_id: str,
        admin_id: str
    ) -> bool:
        res = await db.execute(select(Deal).where(Deal.id == deal_id))
        deal = res.scalars().first()
        if not deal:
            return False

        await db.delete(deal)
        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="promotions.admin_deal_delete",
            actor_id=admin_id,
            actor_role="admin",
            target_type="deal",
            target_id=deal_id,
            changes={"deleted": True},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_disputes() -> List[Dict[str, Any]]:
        return DISPUTES_STORE

    @staticmethod
    async def update_dispute(
        db: AsyncSession,
        dispute_id: str,
        status: str,
        resolution_notes: str,
        admin_id: str
    ) -> bool:
        target = next((d for d in DISPUTES_STORE if d["id"] == dispute_id), None)
        if not target:
            return False
        target["status"] = status
        target["resolutionNotes"] = resolution_notes

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="dispute.admin_resolution",
            actor_id=admin_id,
            actor_role="admin",
            target_type="dispute",
            target_id=dispute_id,
            changes={"status": status, "resolutionNotes": resolution_notes},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_notification_templates() -> List[Dict[str, Any]]:
        return COMMUNICATION_TEMPLATES_STORE

    @staticmethod
    async def update_notification_template(
        db: AsyncSession,
        template_id: str,
        subject: Optional[str],
        body_text: str,
        is_active: bool,
        admin_id: str
    ) -> bool:
        tmpl = next((t for t in COMMUNICATION_TEMPLATES_STORE if t["templateId"] == template_id), None)
        if not tmpl:
            return False
        if subject is not None:
            tmpl["subject"] = subject
        tmpl["bodyText"] = body_text
        tmpl["isActive"] = is_active

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="notifications.admin_template_update",
            actor_id=admin_id,
            actor_role="admin",
            target_type="notification_template",
            target_id=template_id,
            changes={"subject": subject, "bodyText": body_text, "isActive": is_active},
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return True

    @staticmethod
    async def get_settings() -> Dict[str, Any]:
        return PLATFORM_SETTINGS_STORE

    @staticmethod
    async def update_settings(
        db: AsyncSession,
        data: Dict[str, Any],
        admin_id: str
    ) -> Dict[str, Any]:
        for k, v in data.items():
            if v is not None and k in PLATFORM_SETTINGS_STORE:
                PLATFORM_SETTINGS_STORE[k] = v

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            action="settings.admin_platform_update",
            actor_id=admin_id,
            actor_role="admin",
            target_type="platform_settings",
            target_id="global_settings",
            changes=data,
            status="success"
        )
        db.add(audit_entry)
        await db.commit()
        return PLATFORM_SETTINGS_STORE

    @staticmethod
    async def get_audit_logs(
        db: AsyncSession,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        res = await db.execute(select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit))
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
                "changes": l.changes,
                "ipAddress": l.ip_address,
                "createdAt": l.created_at.isoformat() if l.created_at else None
            } for l in logs
        ]
