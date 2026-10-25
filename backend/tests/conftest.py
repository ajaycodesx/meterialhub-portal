import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token
from app.db.seed_data import seed_demo_data


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="session", autouse=True)
async def initialize_test_database():
    """Ensure database schema is created and seeded for the test session."""
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
