import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def setup_monitoring() -> bool:
    """Initialize error monitoring with Sentry if SENTRY_DSN is configured.

    Returns True if initialized, False otherwise.
    The application remains completely functional when Sentry is not configured.
    """
    if not settings.SENTRY_DSN:
        if settings.ENVIRONMENT in ["production", "staging"]:
            logger.info(
                "Sentry DSN not configured. Error monitoring disabled for %s environment.",
                settings.ENVIRONMENT,
            )
        return False

    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENVIRONMENT,
            release=f"materialhub-backend@{settings.VERSION}",
            traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            send_default_pii=False,
        )
        logger.info("Sentry error monitoring initialized successfully.")
        return True
    except Exception as exc:
        logger.error("Failed to initialize Sentry error monitoring: %s", exc)
        return False
