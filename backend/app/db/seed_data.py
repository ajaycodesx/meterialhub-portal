import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.merchant import HardwareMerchant
from app.models.category import MaterialCategory
from app.models.product import Product
from app.models.deal import Deal
from app.models.commodity_rate import CommodityRate
from app.models.order import Order, OrderItem, OrderStatus
from app.models.delivery import DeliveryTrip, TripStatus

CATEGORIES_SEED = [
    {
        "id": "cement",
        "title": "Cement & Aggregates",
        "subtitle": "53 Grade, PPC, M-Sand, Blue Metal",
        "icon_name": "FaBoxesStacked",
        "color_bg": "bg-[#FF6500]",
        "item_count": 140,
        "trending_badge": "Best Rates",
        "image": "/images/cement_aggregates.png",
        "subcategories": ["53 Grade OPC Cement", "PPC Water Shield Cement", "Plastering M-Sand", "P-Sand & Aggregates", "White Cement & Tile Adhesive"],
        "featured_brands": ["UltraTech", "ACC Cement", "Dalmia", "Ramco", "Chettinad"],
    },
    {
        "id": "steel",
        "title": "TMT Steel Rods",
        "subtitle": "Fe500D, Fe550D, Binding Wire",
        "icon_name": "FaLayerGroup",
        "color_bg": "bg-[#FF6500]",
        "item_count": 95,
        "trending_badge": "High Demand",
        "image": "/images/tmt_steel_rods.png",
        "subcategories": ["Fe550D TMT Rods (8mm-32mm)", "Fe500D Seismic Grade Rods", "Gi Binding Wire (18 Gauge)", "MS Structural Angle & Channels", "Stirrups & Prefab Ring Sets"],
        "featured_brands": ["Tata Tiscon", "JSW Neosteel", "Vizag Steel", "Kairali Steel", "Indus TMT"],
    },
    {
        "id": "pvc",
        "title": "PVC & Plumbing",
        "subtitle": "CPVC, UPVC, Fittings & Valves",
        "icon_name": "MdOutlineWaterDrop",
        "color_bg": "bg-[#FF6500]",
        "item_count": 320,
        "image": "/images/pvc_plumbing_pipes.png",
        "subcategories": ["CPVC Hot & Cold Water Pipes", "SWR Drainage Pipes (110mm)", "UPVC Pressure Pipes", "Brass Threaded Elbows & Tees", "Overhead Water Storage Tanks"],
        "featured_brands": ["Supreme", "Astral", "Finolex", "Ashirvad", "Prince Pipes"],
    },
    {
        "id": "paints",
        "title": "Paints & Wall Putty",
        "subtitle": "Emulsion, Primer, Enamel, Waterproof",
        "icon_name": "FaPaintRoller",
        "color_bg": "bg-[#FF6500]",
        "item_count": 210,
        "trending_badge": "Monsoon Deal",
        "image": "/images/paints_wall_putty.png",
        "subcategories": ["Exterior Weatherproof Emulsion", "Interior Premium Silk Emulsion", "Acrylic Wall Putty (40kg)", "Waterproofing Chemical Coatings", "Enamel Wood & Metal Paints"],
        "featured_brands": ["Asian Paints", "Berger Paints", "Nippon", "Dulux", "Birla White"],
    },
    {
        "id": "electricals",
        "title": "Electricals & Cables",
        "subtitle": "FR Wires, Switchgear, Conduits",
        "icon_name": "FaBolt",
        "color_bg": "bg-[#FF6500]",
        "item_count": 180,
        "image": "/images/electrical_wires_switches.png",
        "subcategories": ["Flame Retardant Copper Wires", "Modular Switches & Plates", "MCB Distribution Boards", "PVC Electrical Conduits", "LED Site Flood Lights"],
        "featured_brands": ["Finolex", "Havells", "RR Kabel", "Legrand", "Schneider"],
    },
    {
        "id": "tools",
        "title": "Hardware & Tools",
        "subtitle": "Power Drills, Cutters, Fasteners",
        "icon_name": "FaScrewdriverWrench",
        "color_bg": "bg-[#FF6500]",
        "item_count": 410,
        "image": "/images/hardware_power_tools.png",
        "subcategories": ["Heavy Duty Rotary Hammers", "Marble & Tile Cutters (4-inch)", "Diamond Cutting Blades", "SS Wood Screws & Fasteners", "Safety Helmets & Harnesses"],
        "featured_brands": ["Bosch", "Stanley", "DeWalt", "Hilti", "Taparia"],
    },
]

MERCHANTS_SEED = [
    {
        "id": "m1",
        "name": "Kakkanad Building Supplies",
        "owner_name": "Ramesh Kumar",
        "phone": "+91 98470 12345",
        "email": "kakkanad.supplies@materialhub.in",
        "verified": True,
        "rating": 4.9,
        "reviews_count": 240,
        "distance_km": 1.2,
        "delivery_eta_minutes": 25,
        "min_order_value": 3000,
        "brands": ["UltraTech", "Tata Tiscon", "Supreme", "Asian Paints"],
        "main_category": "Cement, TMT Steel & Hardware",
        "address": "Civil Station Junction, Kakkanad, Kochi",
        "pincode": "682030",
        "is_online": True,
        "avatar_url": "/images/logo.png",
        "wallet_balance": 284000.0,
    },
    {
        "id": "m2",
        "name": "Metropolitan Hardware & Steel Depot",
        "owner_name": "Varghese Thomas",
        "phone": "+91 94471 67890",
        "email": "metro.steel@materialhub.in",
        "verified": True,
        "rating": 4.8,
        "reviews_count": 185,
        "distance_km": 3.4,
        "delivery_eta_minutes": 40,
        "min_order_value": 5000,
        "brands": ["JSW Steel", "Vizag Steel", "ACC Cement", "Finolex"],
        "main_category": "Structural Steel & Electricals",
        "address": "Near Metro Pillar 420, Palarivattom, Kochi",
        "pincode": "682025",
        "is_online": True,
        "avatar_url": "/images/logo.png",
        "wallet_balance": 412000.0,
    },
    {
        "id": "m3",
        "name": "Apex Infra Materials Hub",
        "owner_name": "Nizar Ahmed",
        "phone": "+91 98950 54321",
        "email": "apex.infra@materialhub.in",
        "verified": True,
        "rating": 4.7,
        "reviews_count": 92,
        "distance_km": 5.1,
        "delivery_eta_minutes": 55,
        "min_order_value": 4000,
        "brands": ["Astral", "Berger Paints", "Havells", "Bosch"],
        "main_category": "PVC Plumbing, Paints & Power Tools",
        "address": "Seaport-Airport Road, Kalamassery, Kochi",
        "pincode": "682033",
        "is_online": True,
        "avatar_url": "/images/logo.png",
        "wallet_balance": 178500.0,
    },
    {
        "id": "m4",
        "name": "Aluva Wholesale Traders",
        "owner_name": "Suresh Menon",
        "phone": "+91 97455 88990",
        "email": "aluva.traders@materialhub.in",
        "verified": True,
        "rating": 4.9,
        "reviews_count": 310,
        "distance_km": 8.7,
        "delivery_eta_minutes": 65,
        "min_order_value": 6000,
        "brands": ["UltraTech", "Dalmia", "Finolex", "Tata Tiscon"],
        "main_category": "Full Project Direct Wholesale Supply",
        "address": "Bypass Junction, Aluva, Ernakulam",
        "pincode": "683101",
        "is_online": True,
        "avatar_url": "/images/logo.png",
        "wallet_balance": 593000.0,
    },
]

COMMODITY_RATES_SEED = [
    {"id": "1", "material_name": "UltraTech Cement 53G", "unit": "50kg Bag", "wholesale_rate": 385, "prev_rate": 395, "trend": "down", "change_percent": 2.5, "last_updated": "10m ago"},
    {"id": "2", "material_name": "TMT Steel Rods (Fe550D)", "unit": "Ton", "wholesale_rate": 58500, "prev_rate": 57200, "trend": "up", "change_percent": 2.2, "last_updated": "5m ago"},
    {"id": "3", "material_name": "Supreme PVC Pipe 110mm", "unit": "6m Length", "wholesale_rate": 1240, "prev_rate": 1240, "trend": "stable", "change_percent": 0.0, "last_updated": "15m ago"},
    {"id": "4", "material_name": "Asian Paints Apex Exterior", "unit": "20L Bucket", "wholesale_rate": 4650, "prev_rate": 4800, "trend": "down", "change_percent": 3.1, "last_updated": "30m ago"},
    {"id": "5", "material_name": "Finolex Copper Wire 2.5sqmm", "unit": "90m Coil", "wholesale_rate": 2150, "prev_rate": 2100, "trend": "up", "change_percent": 2.3, "last_updated": "1h ago"},
]

DEALS_SEED = [
    {"id": "d1", "material": "UltraTech Cement 53G", "brand": "UltraTech Cement", "image": "/images/cement_aggregates.png", "original_rate": 395, "deal_rate": 362, "unit": "50kg Bag", "discount_pct": 8, "min_order": "100 Bags Min.", "badge": "Flash Deal", "badge_color": "bg-[#FF6500]", "expires_in_seconds": 19458},
    {"id": "d2", "material": "JSW Neosteel Fe550D 12mm", "brand": "JSW Steel", "image": "/images/tmt_steel_rods.png", "original_rate": 59500, "deal_rate": 55200, "unit": "Ton", "discount_pct": 7, "min_order": "2 Tons Min.", "badge": "Bulk Rate", "badge_color": "bg-slate-900", "expires_in_seconds": 42300},
    {"id": "d3", "material": "Asian Paints Apex Exterior", "brand": "Asian Paints", "image": "/images/paints_wall_putty.png", "original_rate": 4800, "deal_rate": 4200, "unit": "20L Bucket", "discount_pct": 12, "min_order": "5 Buckets Min.", "badge": "Special Offer", "badge_color": "bg-[#FF6500]", "expires_in_seconds": 7960},
    {"id": "d4", "material": "Supreme SWR Pipe 110mm", "brand": "Supreme Pipes", "image": "/images/pvc_plumbing_pipes.png", "original_rate": 1380, "deal_rate": 1190, "unit": "6m Length", "discount_pct": 14, "min_order": "20 Lengths Min.", "badge": "Site Clearance", "badge_color": "bg-slate-900", "expires_in_seconds": 66600},
    {"id": "d5", "material": "Finolex FR Wire 2.5sqmm", "brand": "Finolex Cables", "image": "/images/electrical_wires_switches.png", "original_rate": 2200, "deal_rate": 1980, "unit": "90m Coil", "discount_pct": 10, "min_order": "10 Coils Min.", "badge": "Contractor Pack", "badge_color": "bg-emerald-600", "expires_in_seconds": 28500},
]

PRODUCTS_SEED = [
    {"id": "p1", "title": "UltraTech 53 Grade OPC Cement (50kg)", "category": "cement", "brand": "UltraTech", "price": 385, "unit": "50kg Bag", "moq": 50, "weight_spec": "50 KG Bag", "image": "/images/cement_aggregates.png", "grade": "53 Grade OPC", "weight_kg": 50.0, "merchant_id": "m1"},
    {"id": "p2", "title": "ACC Suraksha Power PPC Cement", "category": "cement", "brand": "ACC Cement", "price": 365, "unit": "50kg Bag", "moq": 50, "weight_spec": "50 KG Bag", "image": "/images/cement_aggregates.png", "grade": "PPC Water Shield", "weight_kg": 50.0, "merchant_id": "m2"},
    {"id": "p3", "title": "Dalmia Supreme High Strength Cement", "category": "cement", "brand": "Dalmia", "price": 358, "unit": "50kg Bag", "moq": 50, "weight_spec": "50 KG Bag", "image": "/images/cement_aggregates.png", "grade": "53 Grade OPC", "weight_kg": 50.0, "merchant_id": "m4"},
    
    {"id": "p4", "title": "Tata Tiscon 550D Super Ductile TMT Rods (12mm)", "category": "steel", "brand": "Tata Tiscon", "price": 58500, "unit": "Ton", "moq": 1, "weight_spec": "1 Metric Ton", "image": "/images/tmt_steel_rods.png", "gauge": "12mm", "grade": "Fe550D Super Ductile", "weight_kg": 1000.0, "merchant_id": "m1"},
    {"id": "p5", "title": "JSW Neosteel Fe500D Primary TMT (16mm)", "category": "steel", "brand": "JSW Steel", "price": 56800, "unit": "Ton", "moq": 1, "weight_spec": "1 Metric Ton", "image": "/images/tmt_steel_rods.png", "gauge": "16mm", "grade": "Fe500D Seismic Grade", "weight_kg": 1000.0, "merchant_id": "m2"},
    {"id": "p6", "title": "Vizag Steel Primary TMT Rods (10mm)", "category": "steel", "brand": "Vizag Steel", "price": 57200, "unit": "Ton", "moq": 1, "weight_spec": "1 Metric Ton", "image": "/images/tmt_steel_rods.png", "gauge": "10mm", "grade": "Fe550D", "weight_kg": 1000.0, "merchant_id": "m4"},
    
    {"id": "p7", "title": "Supreme CPVC Hot & Cold Water Pipe (25mm / 1-inch)", "category": "pvc", "brand": "Supreme", "price": 485, "unit": "3m Length", "moq": 10, "weight_spec": "3 Meter Length", "image": "/images/pvc_plumbing_pipes.png", "gauge": "25mm (1-inch)", "grade": "CPVC SDR-11 Class", "weight_kg": 1.2, "merchant_id": "m1"},
    {"id": "p8", "title": "Supreme SWR Drainage Ring-Fit Pipe (110mm / 4-inch)", "category": "pvc", "brand": "Supreme", "price": 1240, "unit": "6m Length", "moq": 5, "weight_spec": "6 Meter Length", "image": "/images/pvc_plumbing_pipes.png", "gauge": "110mm (4-inch)", "grade": "Type-B Heavy Drainage", "weight_kg": 6.8, "merchant_id": "m3"},
    {"id": "p9", "title": "Astral Silencio Low Noise SWR Pipe (110mm)", "category": "pvc", "brand": "Astral", "price": 1650, "unit": "3m Length", "moq": 5, "weight_spec": "3 Meter Length", "image": "/images/pvc_plumbing_pipes.png", "gauge": "110mm", "grade": "Acoustic Triple-Layer", "weight_kg": 5.4, "merchant_id": "m3"},
    
    {"id": "p10", "title": "Asian Paints Apex Weatherproof Exterior Emulsion (20L)", "category": "paints", "brand": "Asian Paints", "price": 4650, "unit": "20L Bucket", "moq": 2, "weight_spec": "20 Litre Bucket", "image": "/images/paints_wall_putty.png", "grade": "Exterior Weatherproof", "weight_kg": 25.0, "merchant_id": "m1"},
    {"id": "p11", "title": "Asian Paints Tractor Emulsion Smooth Interior (20L)", "category": "paints", "brand": "Asian Paints", "price": 2850, "unit": "20L Bucket", "moq": 2, "weight_spec": "20 Litre Bucket", "image": "/images/paints_wall_putty.png", "grade": "Interior Emulsion", "weight_kg": 25.0, "merchant_id": "m3"},
    {"id": "p12", "title": "Birla White Polymer Wall Putty (40kg Bag)", "category": "paints", "brand": "Birla White", "price": 890, "unit": "40kg Bag", "moq": 5, "weight_spec": "40 KG Bag", "image": "/images/paints_wall_putty.png", "grade": "White Cement Polymer Putty", "weight_kg": 40.0, "merchant_id": "m1"},

    {"id": "p13", "title": "Finolex Flame Guard FR Copper Wire (2.5 sq mm / 90m)", "category": "electricals", "brand": "Finolex", "price": 2150, "unit": "90m Coil", "moq": 5, "weight_spec": "90 Meter Coil", "image": "/images/electrical_wires_switches.png", "gauge": "2.5 sq mm", "grade": "Flame Retardant (FR) Grade", "weight_kg": 3.2, "merchant_id": "m2"},
    {"id": "p14", "title": "Havells Life Line Plus S3 HRFR Wire (4.0 sq mm)", "category": "electricals", "brand": "Havells", "price": 3480, "unit": "90m Coil", "moq": 3, "weight_spec": "90 Meter Coil", "image": "/images/electrical_wires_switches.png", "gauge": "4.0 sq mm", "grade": "100% Electrolytic Copper", "weight_kg": 4.8, "merchant_id": "m3"},

    {"id": "p15", "title": "Bosch GBH 2-26 DRE Professional Rotary Hammer Drill", "category": "tools", "brand": "Bosch", "price": 7650, "unit": "Piece", "moq": 1, "weight_spec": "Boxed Set (2.7 kg)", "image": "/images/hardware_power_tools.png", "grade": "800W Heavy Duty", "weight_kg": 3.5, "merchant_id": "m3"},
    {"id": "p16", "title": "Bosch GDC 120 Professional Marble & Tile Cutter (4-inch)", "category": "tools", "brand": "Bosch", "price": 2980, "unit": "Piece", "moq": 1, "weight_spec": "Boxed Set (2.5 kg)", "image": "/images/hardware_power_tools.png", "grade": "1200W High Torque", "weight_kg": 3.0, "merchant_id": "m3"},
]


import logging
import sys

logger = logging.getLogger(__name__)


async def seed_demo_data(force: bool = False) -> bool:
    """Safe database seeding function for development and testing.

    In production/staging environments, automatic demo seeding is strictly prohibited
    unless explicitly forced via CLI flag.
    All inserts are idempotent to prevent duplicate records or conflicts.
    """
    from app.core.config import settings

    is_prod_like = settings.ENVIRONMENT.lower() in ["production", "prod", "staging"]
    if is_prod_like and not force:
        logger.warning(
            "SAFETY SHIELD: Automatic demo data seeding is strictly prohibited in '%s' environment. "
            "To seed explicitly, run: python -m app.db.seed_data --force",
            settings.ENVIRONMENT,
        )
        return False

    async with AsyncSessionLocal() as db:
        demo_users = [
            User(
                id="u_buyer_1",
                email="buyer@materialhub.in",
                phone="+919876543210",
                name="Ajay Construction Corp",
                hashed_password=get_password_hash("buyer123"),
                role=UserRole.BUYER,
                saved_addresses=[
                    {"id": "addr1", "label": "Site A - Infopark Phase 2", "address": "Plot 14, Infopark Phase 2, Kakkanad", "pincode": "682030"},
                    {"id": "addr2", "label": "Site B - Marine Drive", "address": "Flat 8B, Bayview Residences, Marine Drive", "pincode": "682031"}
                ]
            ),
            User(
                id="u_vendor_1",
                email="vendor@materialhub.in",
                phone="+919847012345",
                name="Ramesh Kumar (Kakkanad Supplies)",
                hashed_password=get_password_hash("vendor123"),
                role=UserRole.VENDOR,
                merchant_id="m1"
            ),
            User(
                id="u_driver_1",
                email="driver@materialhub.in",
                phone="+919447098765",
                name="Manoj K (Tata Ace 3T)",
                hashed_password=get_password_hash("driver123"),
                role=UserRole.DRIVER,
                vehicle_type="Mini Commercial Truck (3 Ton)",
                driver_license="KL-07-2019-004521"
            ),
            User(
                id="u_admin_1",
                email="admin@materialhub.in",
                phone="+919000000001",
                name="MaterialHub Operations",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN
            ),
        ]

        for u in demo_users:
            existing = await db.execute(select(User).where(User.id == u.id))
            user_obj = existing.scalars().first()
            if not user_obj:
                db.add(u)
            else:
                user_obj.is_active = True

        for cat in CATEGORIES_SEED:
            existing = await db.execute(select(MaterialCategory).where(MaterialCategory.id == cat["id"]))
            if not existing.scalars().first():
                db.add(MaterialCategory(**cat))

        for m in MERCHANTS_SEED:
            existing = await db.execute(select(HardwareMerchant).where(HardwareMerchant.id == m["id"]))
            if not existing.scalars().first():
                db.add(HardwareMerchant(**m))

        for r in COMMODITY_RATES_SEED:
            existing = await db.execute(select(CommodityRate).where(CommodityRate.id == r["id"]))
            if not existing.scalars().first():
                db.add(CommodityRate(**r))

        for d in DEALS_SEED:
            existing = await db.execute(select(Deal).where(Deal.id == d["id"]))
            if not existing.scalars().first():
                db.add(Deal(**d))

        for p in PRODUCTS_SEED:
            existing = await db.execute(select(Product).where(Product.id == p["id"]))
            prod = existing.scalars().first()
            if not prod:
                db.add(Product(**p))
            elif force or prod.stock_qty <= 10:
                prod.stock_qty = 500

        existing_order = await db.execute(select(Order).where(Order.id == "ord_98241"))
        if not existing_order.scalars().first():
            sample_order = Order(
                id="ord_98241",
                user_id="u_buyer_1",
                merchant_id="m1",
                items_total=46200.0,
                delivery_fee=850.0,
                gst_amount=8316.0,
                grand_total=55366.0,
                total_weight_kg=2500.0,
                vehicle_recommended="Mini Commercial Truck (3 Ton)",
                delivery_address="Plot 14, Infopark Phase 2, Kakkanad",
                pincode="682030",
                site_constraints={"roadWidth": "12ft+", "craneNeeded": False, "unloadingTimeSlot": "Morning (8 AM - 12 PM)"},
                status=OrderStatus.OUT_FOR_DELIVERY,
                payment_mode="Cash on Unloading",
                invoice_number="MH-INV-2026-0891"
            )
            db.add(sample_order)

            sample_item = OrderItem(
                id="item_1",
                order_id="ord_98241",
                product_id="p1",
                product_title="UltraTech 53 Grade OPC Cement (50kg)",
                unit_price=385.0,
                quantity=120,
                unit="50kg Bag",
                weight_kg=50.0,
                subtotal=46200.0
            )
            db.add(sample_item)

            sample_trip = DeliveryTrip(
                id="trip_5501",
                order_id="ord_98241",
                driver_id="u_driver_1",
                vehicle_type="Mini Commercial Truck (3 Ton)",
                vehicle_reg_number="KL-07-CD-8921",
                pickup_address="Civil Station Junction, Kakkanad, Kochi",
                drop_address="Plot 14, Infopark Phase 2, Kakkanad",
                distance_km=3.2,
                trip_fare=850.0,
                status=TripStatus.IN_TRANSIT,
                current_gps={"lat": 10.0159, "lng": 76.3419}
            )
            db.add(sample_trip)

        await db.commit()
        logger.info("Demo data seeding completed successfully.")
        return True


seed_database = seed_demo_data


if __name__ == "__main__":
    force_flag = "--force" in sys.argv
    print(f"Running explicit seed operation (force={force_flag})...")
    success = asyncio.run(seed_demo_data(force=force_flag))
    if success:
        print("Database seeded successfully.")
    else:
        print("Database seeding skipped or blocked.")

