import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Enum, JSON, Float
from app.core.database import Base


class UserRole(str, enum.Enum):
    BUYER = "buyer"
    VENDOR = "vendor"
    DRIVER = "driver"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.BUYER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)

    saved_addresses = Column(JSON, default=list)

    merchant_id = Column(String(50), nullable=True)
    driver_license = Column(String(50), nullable=True)
    vehicle_type = Column(String(50), nullable=True)
    vehicle_reg_number = Column(String(20), nullable=True)
    payload_capacity_tons = Column(Float, nullable=True)

    verification_reason = Column(String(500), nullable=True)
    proof_documents = Column(JSON, default=dict)

    is_online = Column(Boolean, default=False, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_updated_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
