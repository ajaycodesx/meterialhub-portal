import uuid
from datetime import datetime, timezone
from typing import Dict, Optional, List, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.category import MaterialCategory
from app.models.merchant import HardwareMerchant
from app.models.commodity_rate import CommodityRate
from app.models.deal import Deal
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.models.delivery import DeliveryTrip, TripStatus
from app.models.boq_quote import BoqQuote
from app.services import dispatch_service
from app.schemas.buyer import (
    BuyerHomeCompositeResponse,
    BuyerCatalogCompositeResponse,
    OrderCalculationRequest,
    OrderCalculationResponse,
    OrderCreateRequest,
    OrderDetailResponse,
    DealSchema,
    CategorySchema,
    MerchantSchema,
    CommodityRateSchema,
    ProductSchema,
    BoqQuoteCreateRequest,
    BoqQuoteResponse
)


class BuyerService:

    @staticmethod
    async def get_home_composite(db: AsyncSession) -> BuyerHomeCompositeResponse:
        """
        Single aggregated API endpoint returning everything needed for the Buyer Homepage:
        - Hero meta & radius
        - Trending Deals
        - All Categories with subcategories & brands
        - Nearby Verified Merchants
        - Live Wholesale Commodity Rates
        """
        cat_res = await db.execute(select(MaterialCategory))
        categories = cat_res.scalars().all()
        
        deal_res = await db.execute(select(Deal).where(Deal.status == "approved"))
        deals = deal_res.scalars().all()
        
        merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.verified == True).limit(6))  # noqa: E712 - SQLAlchemy column comparison
        merchants = merch_res.scalars().all()
        
        rate_res = await db.execute(select(CommodityRate))
        rates = rate_res.scalars().all()
        
        return BuyerHomeCompositeResponse(
            hero={
                "title": "Direct Factory & Wholesale Construction Materials",
                "tagline": "Order Cement, TMT Steel, PVC, Paints & Electricals with real-time stock & same-day site delivery.",
                "maxRadiusKm": 20,
                "bannerImage": "/images/hero_banner.png",
                "defaultPincode": "682030",
                "hubCity": "Kochi Wholesale Cluster"
            },
            trendingDeals=[
                DealSchema(
                    id=d.id,
                    material=d.material,
                    brand=d.brand,
                    image=d.image,
                    originalRate=d.original_rate,
                    dealRate=d.deal_rate,
                    unit=d.unit,
                    discountPct=d.discount_pct,
                    minOrder=d.min_order,
                    badge=d.badge,
                    badgeColor=d.badge_color,
                    expiresInSeconds=d.expires_in_seconds
                ) for d in deals
            ],
            categories=[
                CategorySchema(
                    id=c.id,
                    title=c.title,
                    subtitle=c.subtitle,
                    iconName=c.icon_name,
                    colorBg=c.color_bg,
                    itemCount=c.item_count,
                    trendingBadge=c.trending_badge,
                    image=c.image,
                    subcategories=c.subcategories or [],
                    featuredBrands=c.featured_brands or []
                ) for c in categories
            ],
            nearbyMerchants=[
                MerchantSchema(
                    id=m.id,
                    name=m.name,
                    ownerName=m.owner_name,
                    phone=m.phone,
                    verified=m.verified,
                    rating=m.rating,
                    reviewsCount=m.reviews_count,
                    distanceKm=m.distance_km,
                    deliveryEtaMinutes=m.delivery_eta_minutes,
                    minOrderValue=m.min_order_value,
                    brands=m.brands or [],
                    mainCategory=m.main_category,
                    address=m.address,
                    pincode=m.pincode,
                    isOnline=m.is_online,
                    avatarUrl=m.avatar_url
                ) for m in merchants
            ],
            rateTicker=[
                CommodityRateSchema(
                    id=r.id,
                    materialName=r.material_name,
                    unit=r.unit,
                    wholesaleRate=r.wholesale_rate,
                    prevRate=r.prev_rate,
                    trend=r.trend,
                    changePercent=r.change_percent,
                    lastUpdated=r.last_updated
                ) for r in rates
            ],
            serviceRadiusKm=20
        )

    @staticmethod
    async def get_catalog_composite(
        db: AsyncSession,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        merchant_id: Optional[str] = None,
        query: Optional[str] = None
    ) -> BuyerCatalogCompositeResponse:
        stmt = select(Product).where(or_(Product.status == "approved", Product.status.is_(None)))
        if category and category != "all":
            stmt = stmt.where(Product.category == category)
        if brand and brand != "all":
            stmt = stmt.where(Product.brand == brand)
        if merchant_id:
            stmt = stmt.where(Product.merchant_id == merchant_id)
        if query:
            stmt = stmt.where(or_(Product.title.ilike(f"%{query}%"), Product.brand.ilike(f"%{query}%")))
            
        prod_res = await db.execute(stmt)
        products = prod_res.scalars().all()
        
        merch_res = await db.execute(select(HardwareMerchant))
        merchants = merch_res.scalars().all()
        
        cat_res = await db.execute(select(MaterialCategory))
        categories = cat_res.scalars().all()
        
        return BuyerCatalogCompositeResponse(
            products=[
                ProductSchema(
                    id=p.id,
                    title=p.title,
                    category=p.category,
                    brand=p.brand,
                    price=p.price,
                    unit=p.unit,
                    moq=p.moq,
                    weightSpec=p.weight_spec,
                    image=p.image,
                    grade=p.grade,
                    gauge=p.gauge,
                    weightKg=p.weight_kg,
                    stockQty=p.stock_qty,
                    merchantId=p.merchant_id
                ) for p in products
            ],
            merchants=[
                MerchantSchema(
                    id=m.id,
                    name=m.name,
                    ownerName=m.owner_name,
                    phone=m.phone,
                    verified=m.verified,
                    rating=m.rating,
                    reviewsCount=m.reviews_count,
                    distanceKm=m.distance_km,
                    deliveryEtaMinutes=m.delivery_eta_minutes,
                    minOrderValue=m.min_order_value,
                    brands=m.brands or [],
                    mainCategory=m.main_category,
                    address=m.address,
                    pincode=m.pincode,
                    isOnline=m.is_online,
                    avatarUrl=m.avatar_url
                ) for m in merchants
            ],
            categories=[
                CategorySchema(
                    id=c.id,
                    title=c.title,
                    subtitle=c.subtitle,
                    iconName=c.icon_name,
                    colorBg=c.color_bg,
                    itemCount=c.item_count,
                    trendingBadge=c.trending_badge,
                    image=c.image,
                    subcategories=c.subcategories or [],
                    featuredBrands=c.featured_brands or []
                ) for c in categories
            ],
            totalCount=len(products),
            activeCategory=category,
            activeMerchant=merchant_id,
            priceRange={"min": 350.0, "max": 65000.0}
        )

    @staticmethod
    async def calculate_order_payload(
        db: AsyncSession,
        req: OrderCalculationRequest
    ) -> OrderCalculationResponse:
        """
        Calculates tonnage barometer, vehicle logistics requirement, GST breakdown, and delivery fee.
        """
        items_total = 0.0
        total_weight_kg = 0.0
        
        for item in req.items:
            res = await db.execute(select(Product).where(Product.id == item.productId))
            prod = res.scalars().first()
            if prod:
                items_total += prod.price * item.quantity
                total_weight_kg += prod.weight_kg * item.quantity
                
        tonnage = total_weight_kg / 1000.0
        
        if tonnage <= 1.0:
            recommended_vehicle = "Pickup Truck (1 Ton)"
            base_fee = 450.0
        elif tonnage <= 3.5:
            recommended_vehicle = "Mini Commercial Truck (3.5 Ton)"
            base_fee = 850.0
        elif tonnage <= 10.0:
            recommended_vehicle = "Commercial Tipper / 6-Wheeler (10 Ton)"
            base_fee = 1800.0
        else:
            recommended_vehicle = "Heavy Multi-Axle Trailer (25 Ton)"
            base_fee = 3500.0
            
        delivery_fee = base_fee + (req.distanceKm * 25.0)
        crane_fee = 1500.0 if req.craneNeeded else 0.0
        
        gst_rate = 0.18
        gst_cgst = (items_total * gst_rate) / 2
        gst_sgst = (items_total * gst_rate) / 2
        gst_total = gst_cgst + gst_sgst
        
        grand_total = items_total + delivery_fee + crane_fee + gst_total
        
        return OrderCalculationResponse(
            itemsTotal=round(items_total, 2),
            totalWeightKg=round(total_weight_kg, 2),
            totalTonnage=round(tonnage, 2),
            deliveryFee=round(delivery_fee, 2),
            craneFee=round(crane_fee, 2),
            gstBreakdown={"CGST (9%)": round(gst_cgst, 2), "SGST (9%)": round(gst_sgst, 2)},
            gstTotal=round(gst_total, 2),
            grandTotal=round(grand_total, 2),
            recommendedVehicle=recommended_vehicle,
            isDeliverable=req.distanceKm <= 25.0
        )

    @staticmethod
    async def create_order(
        db: AsyncSession,
        user_id: str,
        req: OrderCreateRequest
    ) -> OrderDetailResponse:
        """
        Creates order, items, GST invoice, and automatically dispatches delivery trip in one transaction.
        """
        # Merge duplicate cart lines so the same SKU cannot pass the stock check
        # once per line and then oversell when the stock is decremented.
        merged_quantities: Dict[str, int] = {}
        for item in req.items:
            merged_quantities[item.productId] = merged_quantities.get(item.productId, 0) + item.quantity

        validated_products = []
        for product_id, quantity in merged_quantities.items():
            # Row lock so concurrent orders cannot both see the same stock level.
            res = await db.execute(select(Product).where(Product.id == product_id).with_for_update())
            prod = res.scalars().first()
            if not prod:
                raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
            if prod.merchant_id != req.merchantId:
                raise HTTPException(status_code=400, detail=f"Product {prod.id} does not belong to merchant {req.merchantId}")
            if prod.status != "approved":
                raise HTTPException(status_code=400, detail=f"Product {prod.id} is not available for sale")
            if prod.stock_qty is not None and prod.stock_qty < quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {prod.title}. Available: {prod.stock_qty}, requested: {quantity}"
                )
            validated_products.append((quantity, prod))

        calc = await BuyerService.calculate_order_payload(
            db,
            OrderCalculationRequest(
                items=req.items,
                pincode=req.pincode,
                distanceKm=3.5,
                craneNeeded=req.siteConstraints.craneNeeded
            )
        )
        
        order_id = f"ord_{uuid.uuid4().hex[:8]}"
        invoice_num = f"MH-INV-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"
        
        # Online payments stay PENDING until the Razorpay signature and amount are
        # verified, so unpaid orders are never confirmed or dispatched.
        is_online_payment = req.paymentMode == "Online Payment (Razorpay)"

        new_order = Order(
            id=order_id,
            user_id=user_id,
            merchant_id=req.merchantId,
            items_total=calc.itemsTotal,
            delivery_fee=calc.deliveryFee + calc.craneFee,
            gst_amount=calc.gstTotal,
            grand_total=calc.grandTotal,
            total_weight_kg=calc.totalWeightKg,
            vehicle_recommended=calc.recommendedVehicle,
            delivery_address=req.deliveryAddress,
            pincode=req.pincode,
            site_constraints=req.siteConstraints.model_dump(),
            status=OrderStatus.PENDING if is_online_payment else OrderStatus.CONFIRMED,
            payment_mode=req.paymentMode,
            invoice_number=invoice_num
        )
        db.add(new_order)

        order_items_list = []
        for quantity, prod in validated_products:
            item_id = f"item_{uuid.uuid4().hex[:6]}"
            subtotal = prod.price * quantity
            if prod.stock_qty is not None:
                prod.stock_qty = prod.stock_qty - quantity
            db_item = OrderItem(
                id=item_id,
                order_id=order_id,
                product_id=prod.id,
                product_title=prod.title,
                unit_price=prod.price,
                quantity=quantity,
                unit=prod.unit,
                weight_kg=prod.weight_kg,
                subtotal=subtotal
            )
            db.add(db_item)
            order_items_list.append({
                "id": item_id,
                "title": prod.title,
                "quantity": quantity,
                "unit": prod.unit,
                "price": prod.price,
                "subtotal": subtotal
            })
                
        merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == req.merchantId))
        merchant = merch_res.scalars().first()
        merchant_name = merchant.name if merchant else "Verified Hardware Depot"
        merchant_phone = merchant.phone if merchant else "+91 98470 12345"
        merchant_address = merchant.address if merchant else "Civil Station Junction, Kakkanad"
        
        store_has_location = merchant is not None and merchant.latitude is not None and merchant.longitude is not None
        trip = DeliveryTrip(
            id=f"trip_{uuid.uuid4().hex[:6]}",
            order_id=order_id,
            driver_id=None,
            vehicle_type=calc.recommendedVehicle,
            pickup_address=merchant_address,
            drop_address=req.deliveryAddress,
            distance_km=3.5,
            trip_fare=calc.deliveryFee,
            status=TripStatus.UNASSIGNED,
            pickup_lat=merchant.latitude if store_has_location else None,
            pickup_lng=merchant.longitude if store_has_location else None,
            drop_lat=req.deliveryLatitude,
            drop_lng=req.deliveryLongitude,
            # Without a store location no driver can be matched; admin must set it.
            dispatch_status="searching" if store_has_location else "no_store_location",
        )
        db.add(trip)
        
        await db.commit()
        await db.refresh(new_order)
        await db.refresh(trip)

        # Cash and credit orders are confirmed now; online orders dispatch after payment.
        if new_order.status == OrderStatus.CONFIRMED:
            await dispatch_service.dispatch_trip(db, trip)
        
        return OrderDetailResponse(
            orderId=order_id,
            invoiceNumber=invoice_num,
            merchantName=merchant_name,
            merchantPhone=merchant_phone,
            itemsTotal=calc.itemsTotal,
            deliveryFee=calc.deliveryFee + calc.craneFee,
            gstAmount=calc.gstTotal,
            grandTotal=calc.grandTotal,
            totalWeightKg=calc.totalWeightKg,
            status=new_order.status,
            deliveryAddress=req.deliveryAddress,
            pincode=req.pincode,
            createdAt=datetime.now(timezone.utc).isoformat(),
            items=order_items_list,
            driverTrip={
                "tripId": trip.id,
                "status": trip.status,
                "vehicleType": trip.vehicle_type,
                "driverPhone": None
            }
        )

    @staticmethod
    async def create_boq_quote(
        db: AsyncSession,
        user_id: str,
        req: BoqQuoteCreateRequest
    ) -> BoqQuoteResponse:
        quote_id = f"BOQ-{uuid.uuid4().hex[:8].upper()}"
        boq = BoqQuote(
            id=quote_id,
            user_id=user_id,
            project_name=req.projectName,
            delivery_pincode=req.deliveryPincode,
            site_address=req.siteAddress,
            file_url=req.fileUrl,
            raw_materials_text=req.rawMaterialsText,
            parsed_items=[],
            estimated_total=0.0,
            status="under_review",
            created_at=datetime.now(timezone.utc)
        )
        db.add(boq)
        await db.commit()
        await db.refresh(boq)

        return BoqQuoteResponse(
            id=boq.id,
            projectName=boq.project_name,
            deliveryPincode=boq.delivery_pincode,
            siteAddress=boq.site_address,
            rawMaterialsText=boq.raw_materials_text,
            fileUrl=boq.file_url,
            estimatedTotal=boq.estimated_total or 0.0,
            status=boq.status,
            createdAt=boq.created_at.isoformat() if boq.created_at else datetime.now(timezone.utc).isoformat()
        )

    @staticmethod
    async def list_boq_quotes(
        db: AsyncSession,
        user_id: str
    ) -> List[BoqQuoteResponse]:
        res = await db.execute(
            select(BoqQuote).where(BoqQuote.user_id == user_id).order_by(BoqQuote.created_at.desc())
        )
        quotes = res.scalars().all()
        return [
            BoqQuoteResponse(
                id=q.id,
                projectName=q.project_name,
                deliveryPincode=q.delivery_pincode,
                siteAddress=q.site_address,
                rawMaterialsText=q.raw_materials_text,
                fileUrl=q.file_url,
                estimatedTotal=q.estimated_total or 0.0,
                status=q.status,
                createdAt=q.created_at.isoformat() if q.created_at else ""
            ) for q in quotes
        ]

    @staticmethod
    async def cancel_order(
        db: AsyncSession,
        user_id: str,
        order_id: str,
        reason: Optional[str] = "Cancelled by buyer"
    ) -> Dict[str, Any]:
        res = await db.execute(select(Order).where(Order.id == order_id))
        order = res.scalars().first()
        if not order or order.user_id != user_id:
            raise HTTPException(status_code=404, detail="Order not found")

        if order.status not in (OrderStatus.PENDING, OrderStatus.CONFIRMED):
            raise HTTPException(
                status_code=400,
                detail=f"Order cannot be cancelled as it is already {order.status.value}"
            )

        items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        items = items_res.scalars().all()
        for it in items:
            p_res = await db.execute(select(Product).where(Product.id == it.product_id))
            prod = p_res.scalars().first()
            if prod:
                prod.stock_qty += it.quantity

        order.status = OrderStatus.CANCELLED

        trip_res = await db.execute(select(DeliveryTrip).where(DeliveryTrip.order_id == order.id))
        trip = trip_res.scalars().first()
        if trip:
            trip.status = TripStatus.CANCELLED
            trip.dispatch_status = "cancelled_by_buyer"

        await db.commit()
        return {"cancelled": True, "orderId": order.id, "status": order.status.value, "reason": reason}

    @staticmethod
    async def rate_order(
        db: AsyncSession,
        user_id: str,
        order_id: str,
        rating: int,
        review_text: Optional[str] = None
    ) -> Dict[str, Any]:
        res = await db.execute(select(Order).where(Order.id == order_id))
        order = res.scalars().first()
        if not order or order.user_id != user_id:
            raise HTTPException(status_code=404, detail="Order not found")

        if order.status != OrderStatus.DELIVERED:
            raise HTTPException(status_code=400, detail="Ratings can only be submitted for delivered orders")

        merch_res = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == order.merchant_id))
        merchant = merch_res.scalars().first()
        new_rating = rating
        if merchant:
            curr_rating = merchant.rating or 4.5
            curr_count = merchant.reviews_count or 1
            new_count = curr_count + 1
            new_rating = round(((curr_rating * curr_count) + rating) / new_count, 1)
            merchant.rating = new_rating
            merchant.reviews_count = new_count

        await db.commit()
        return {"rated": True, "orderId": order.id, "rating": rating, "newMerchantRating": new_rating}
