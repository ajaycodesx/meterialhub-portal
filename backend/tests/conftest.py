# ruff: noqa: E402 - the environment must be set before the app is imported
import os

# Each test session gets its own empty database so leftover trips or orders from
# earlier runs cannot change dispatch results. Must be set before the app is imported.
TEST_DB_FILE = "test_materialhub.db"
if os.path.exists(TEST_DB_FILE):
    os.remove(TEST_DB_FILE)
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///./{TEST_DB_FILE}"

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import Base, engine
from app.core.security import create_access_token
from app.core.rate_limit import limiter
from app.db.seed_data import seed_demo_data


@pytest.fixture(autouse=True)
def reset_rate_limits():
    """Each test starts with a fresh rate-limit window so suites do not starve each other."""
    limiter.reset()
    yield


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="session", autouse=True)
async def initialize_test_database():
    """Create the schema for the test database and load the development seed."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_demo_data(force=True)
    yield


@pytest_asyncio.fixture
async def async_client():
    """Async HTTP client for testing API endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def buyer_token() -> str:
    return create_access_token(subject="u_buyer_1")


@pytest.fixture
def vendor_token() -> str:
    return create_access_token(subject="u_vendor_1")


@pytest.fixture
def driver_token() -> str:
    return create_access_token(subject="u_driver_1")


@pytest.fixture
def admin_token() -> str:
    return create_access_token(subject="u_admin_1")
