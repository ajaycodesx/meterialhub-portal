import json
import logging
from typing import List, Optional, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

DEFAULT_DEV_SECRET = "materialhub-super-secret-jwt-key-change-in-production-2026"


class Settings(BaseSettings):
    PROJECT_NAME: str = "MaterialHub API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    SECRET_KEY: str = DEFAULT_DEV_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    DATABASE_URL: str = "sqlite+aiosqlite:///./materialhub.db"

    AUTO_SEED_DEV_DATA: bool = True
    DEV_ALLOW_MOCK_AUTH: bool = True

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ]

    ALLOWED_HOSTS: List[str] = ["*"]
    ENFORCE_HTTPS: bool = False
    TRUSTED_PROXY_IPS: List[str] = ["127.0.0.1", "::1"]

    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_STORAGE_URL: Optional[str] = None
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_CREATE_ORDER: str = "10/minute"
    RATE_LIMIT_CALCULATE_ORDER: str = "30/minute"
    RATE_LIMIT_DEFAULT: str = "60/minute"

    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    SENTRY_DSN: Optional[str] = None
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1

    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM_EMAIL: Optional[str] = None
    SENDGRID_FROM_NAME: str = "MaterialHub"

    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: Optional[str] = None
    AWS_S3_ENDPOINT_URL: Optional[str] = None

    GOOGLE_MAPS_API_KEY: Optional[str] = None

    WEBSOCKET_ENABLED: bool = True
    WEBSOCKET_CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                return json.loads(v)
            return [host.strip() for host in v.split(",") if host.strip()]
        return v

    @field_validator("TRUSTED_PROXY_IPS", mode="before")
    @classmethod
    def parse_trusted_proxies(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                return json.loads(v)
            return [ip.strip() for ip in v.split(",") if ip.strip()]
        return v

    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        is_production = self.ENVIRONMENT.lower() in ["production", "prod"]

        if is_production:
            if self.SECRET_KEY == DEFAULT_DEV_SECRET or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "CRITICAL SECURITY ERROR: A strong SECRET_KEY (minimum 32 characters) "
                    "must be set in the production environment. Do not use default or short keys."
                )

            if self.DEBUG:
                raise ValueError("CRITICAL CONFIG ERROR: DEBUG must be set to False in production.")

            if "*" in self.ALLOWED_HOSTS:
                raise ValueError(
                    "CRITICAL CONFIG ERROR: ALLOWED_HOSTS cannot contain wildcard '*' in production. "
                    "Explicit domain names must be configured."
                )

            if self.DATABASE_URL.startswith("sqlite"):
                logger.warning(
                    "PRODUCTION WARNING: DATABASE_URL is set to SQLite. "
                    "A production-grade PostgreSQL database is strongly recommended."
                )

            for origin in self.BACKEND_CORS_ORIGINS:
                if "localhost" in origin or "127.0.0.1" in origin:
                    logger.warning(
                        f"PRODUCTION WARNING: Localhost origin '{origin}' detected in BACKEND_CORS_ORIGINS."
                    )

        return self


settings = Settings()
