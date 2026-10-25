import pytest
from pydantic_core import ValidationError
from app.core.config import Settings
from app.db.seed_data import seed_demo_data


@pytest.mark.asyncio
async def test_production_blocks_automatic_seeding(monkeypatch):
    """Verify that demo data seeding is strictly blocked when environment is production."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    result = await seed_demo_data(force=False)
    assert result is False, "Automatic demo seeding must return False in production"


def test_production_rejects_insecure_default_secret():
    """Verify that Settings raises a validation error in production with default secret."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="materialhub-super-secret-jwt-key-change-in-production-2026",
            DEBUG=False,
            ALLOWED_HOSTS=["api.materialhub.in"]
        )
    assert "strong SECRET_KEY" in str(exc_info.value)


def test_production_rejects_short_secret():
    """Verify that Settings raises a validation error in production with secret < 32 chars."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="short-secret-key-12345",
            DEBUG=False,
            ALLOWED_HOSTS=["api.materialhub.in"]
        )
    assert "minimum 32 characters" in str(exc_info.value)


def test_production_rejects_debug_true():
    """Verify that Settings rejects DEBUG=True in production."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="a" * 32,
            DEBUG=True,
            ALLOWED_HOSTS=["api.materialhub.in"]
        )
    assert "DEBUG must be set to False" in str(exc_info.value)


def test_production_rejects_wildcard_hosts():
    """Verify that Settings rejects wildcard '*' in ALLOWED_HOSTS in production."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="a" * 32,
            DEBUG=False,
            ALLOWED_HOSTS=["*"]
        )
    assert "ALLOWED_HOSTS cannot contain wildcard" in str(exc_info.value)
