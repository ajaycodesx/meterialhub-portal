import pytest
import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, text
from alembic import command
from alembic.config import Config

from app.models.user import User, UserRole
from app.models.merchant import HardwareMerchant
from app.models.category import MaterialCategory
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.models.delivery import DeliveryTrip, TripStatus
from app.db.seed_data import seed_demo_data

PG_TEST_URL = "postgresql+asyncpg://postgres@127.0.0.1:5433/materialhub_staging"
PG_RAW_URL = "postgresql://postgres@127.0.0.1:5433/materialhub_staging"

pytestmark = pytest.mark.asyncio


async def test_postgresql_connection_and_version():
    """Verify live connectivity and PostgreSQL version."""
    conn = await asyncpg.connect(PG_RAW_URL)
    version = await conn.fetchval("SELECT version()")
    await conn.close()
    assert "PostgreSQL" in version
    print(f"\n[PG LIVE] Connected to: {version}")


async def test_postgresql_schema_tables_and_types():
    """Verify that Alembic created all tables, native enums, and foreign keys in PostgreSQL."""
    conn = await asyncpg.connect(PG_RAW_URL)

    tables = [
        r["table_name"]
        for r in await conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
        )
    ]
    expected_tables = {
        "alembic_version",
        "users",
        "merchants",
        "categories",
        "commodity_rates",
        "deals",
        "products",
        "orders",
        "order_items",
        "delivery_trips",
        "boq_quotes",
    }
    for t in expected_tables:
        assert t in tables, f"Expected table '{t}' not found in PostgreSQL tables: {tables}"

    enum_types = [
        r["typname"]
        for r in await conn.fetch("SELECT DISTINCT typname FROM pg_type WHERE typtype='e'")
    ]
    assert "userrole" in enum_types
    assert "orderstatus" in enum_types
    assert "tripstatus" in enum_types

    fks = await conn.fetch(
        """
        SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY';
        """
    )
    fk_pairs = {(r["table_name"], r["column_name"]): r["foreign_table"] for r in fks}
    assert fk_pairs[("orders", "user_id")] == "users"
    assert fk_pairs[("orders", "merchant_id")] == "merchants"
    assert fk_pairs[("order_items", "order_id")] == "orders"
    assert fk_pairs[("order_items", "product_id")] == "products"
    assert fk_pairs[("delivery_trips", "order_id")] == "orders"
    assert fk_pairs[("delivery_trips", "driver_id")] == "users"
    assert fk_pairs[("products", "category")] == "categories"

    await conn.close()


async def test_postgresql_crud_and_transaction_rollback():
    """Verify transactional CRUD and rollback behavior on PostgreSQL."""
    engine = create_async_engine(PG_TEST_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        test_user = User(
            id="u_pg_test_1",
            email="pg_test@materialhub.in",
            phone="+919876000001",
            name="Postgres Test Contractor",
            hashed_password="hashed_pw_test",
            role=UserRole.BUYER,
        )
        session.add(test_user)
        await session.commit()

    async with async_session() as session:
        user = await session.get(User, "u_pg_test_1")
        assert user is not None
        assert user.email == "pg_test@materialhub.in"
        assert user.role == UserRole.BUYER

    async with async_session() as session:
        user = await session.get(User, "u_pg_test_1")
        user.name = "Rolled Back Name"
        await session.rollback()

    async with async_session() as session:
        user = await session.get(User, "u_pg_test_1")
        assert user.name == "Postgres Test Contractor"

    async with async_session() as session:
        invalid_order = Order(
            id="ord_invalid_fk",
            user_id="u_nonexistent_user",
            merchant_id="m_nonexistent",
            items_total=1000.0,
            grand_total=1000.0,
            delivery_address="Invalid Address",
            pincode="682030",
        )
        session.add(invalid_order)
        with pytest.raises(Exception) as exc_info:
            await session.commit()
        assert "foreign key" in str(exc_info.value).lower() or "violates foreign key constraint" in str(exc_info.value).lower()

    async with async_session() as session:
        user = await session.get(User, "u_pg_test_1")
        if user:
            await session.delete(user)
            await session.commit()

    await engine.dispose()


async def test_postgresql_migration_lifecycle_downgrade_and_reupgrade():
    """Verify that Alembic downgrade base and upgrade head execute cleanly on PostgreSQL."""
    import subprocess
    import sys
    from pathlib import Path

    backend_root = Path(__file__).resolve().parent.parent

    res_down = subprocess.run(
        [sys.executable, "-m", "alembic", "-x", f"url={PG_TEST_URL}", "downgrade", "base"],
        cwd=str(backend_root),
        capture_output=True,
        text=True,
    )
    assert res_down.returncode == 0, f"PostgreSQL downgrade failed: {res_down.stderr}"

    conn = await asyncpg.connect(PG_RAW_URL)
    tables = [
        r["table_name"]
        for r in await conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name != 'alembic_version'"
        )
    ]
    assert len(tables) == 0, f"Tables still present after downgrade: {tables}"

    res_up = subprocess.run(
        [sys.executable, "-m", "alembic", "-x", f"url={PG_TEST_URL}", "upgrade", "head"],
        cwd=str(backend_root),
        capture_output=True,
        text=True,
    )
    assert res_up.returncode == 0, f"PostgreSQL re-upgrade failed: {res_up.stderr}"

    tables_after = [
        r["table_name"]
        for r in await conn.fetch(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name != 'alembic_version'"
        )
    ]
    assert len(tables_after) >= 10
    await conn.close()

