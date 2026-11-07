import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, delete, text
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.merchant import HardwareMerchant
from app.models.category import MaterialCategory
from app.models.product import Product
from app.models.deal import Deal
from app.models.commodity_rate import CommodityRate
from app.models.order import Order, OrderItem
from app.models.delivery import DeliveryTrip
from app.models.boq_quote import BoqQuote
from app.models.audit_log import AuditLog
from app.models.dispatch import DispatchOffer


async def reset_database():
    async with AsyncSessionLocal() as session:
        await session.execute(delete(AuditLog))
        await session.execute(delete(OrderItem))
        await session.execute(delete(DeliveryTrip))
        await session.execute(delete(DispatchOffer))
        await session.execute(delete(Order))
        await session.execute(delete(BoqQuote))
        await session.execute(delete(Product))
        await session.execute(delete(Deal))
        await session.execute(delete(CommodityRate))
        await session.execute(delete(HardwareMerchant))
        await session.execute(delete(MaterialCategory))
        await session.execute(delete(User))

        raw_password = "Gatsbyajayrenjith@9633"
        admin_password_hash = get_password_hash(raw_password)

        primary_admin = User(
            id="u_admin_1",
            email="admin@materialhub.in",
            phone="+919000000001",
            name="Ajay Renjith (Admin)",
            hashed_password=admin_password_hash,
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
            saved_addresses=[],
        )

        personal_admin = User(
            id="u_admin_2",
            email="ajayrenjith.work@gmail.com",
            phone="+919876543210",
            name="Ajay Renjith",
            hashed_password=admin_password_hash,
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
            saved_addresses=[],
        )

        session.add(primary_admin)
        session.add(personal_admin)
        await session.commit()

        tables_to_check = [
            ("AuditLog", AuditLog),
            ("OrderItem", OrderItem),
            ("DeliveryTrip", DeliveryTrip),
            ("DispatchOffer", DispatchOffer),
            ("Order", Order),
            ("BoqQuote", BoqQuote),
            ("Product", Product),
            ("Deal", Deal),
            ("CommodityRate", CommodityRate),
            ("HardwareMerchant", HardwareMerchant),
            ("MaterialCategory", MaterialCategory),
            ("User", User),
        ]

        print("=== DATABASE RESET & VERIFICATION REPORT ===")
        print(f"Connected Database URL: {settings.DATABASE_URL}")
        for label, model in tables_to_check:
            result = await session.execute(select(model))
            items = result.scalars().all()
            print(f"Table '{label}': {len(items)} row(s)")

        user_result = await session.execute(select(User))
        active_users = user_result.scalars().all()
        print("\n=== ACTIVE USERS IN DATABASE ===")
        for u in active_users:
            password_matches = verify_password(raw_password, u.hashed_password)
            print(f"- ID: {u.id} | Email: {u.email} | Phone: {u.phone} | Role: {u.role.value} | Active: {u.is_active} | Verified: {u.is_verified} | Password Matches: {password_matches}")


if __name__ == "__main__":
    asyncio.run(reset_database())

