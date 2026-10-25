import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Enum, JSON
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
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
