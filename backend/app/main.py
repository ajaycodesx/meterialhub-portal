import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.monitoring import setup_monitoring
from app.core.middleware import RequestIdMiddleware, SecurityHeadersMiddleware
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from app.core.database import get_db
from app.api.v1.api import api_router
from app.db.seed_data import seed_demo_data

setup_logging(log_level=settings.LOG_LEVEL, log_format=settings.LOG_FORMAT)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_monitoring()
    logger.info("Starting MaterialHub API [env=%s, version=%s]", settings.ENVIRONMENT, settings.VERSION)

    if settings.ENVIRONMENT == "development" and settings.AUTO_SEED_DEV_DATA:
        logger.info("Development environment: checking/running development seed data...")
        await seed_demo_data()
    else:
        logger.info(
            "Environment '%s': automatic demo data seeding is inactive. Migrations managed via Alembic.",
            settings.ENVIRONMENT,
        )

    yield

    logger.info("Shutting down MaterialHub API cleanly.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MaterialHub B2B Construction Materials Aggregator & Logistics Backend API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs" if settings.DEBUG else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(RequestIdMiddleware)

app.add_middleware(SecurityHeadersMiddleware)

if settings.ALLOWED_HOSTS and settings.ALLOWED_HOSTS != ["*"]:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root_health():
    """Liveness probe: basic service status."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def detailed_health(db: AsyncSession = Depends(get_db)):
    """Readiness probe: verifies database connectivity."""
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error("Database health check failed: %s", exc)
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
        "rate_limiting": "enabled" if settings.RATE_LIMIT_ENABLED else "disabled",
    }
