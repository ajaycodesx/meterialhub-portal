from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Float, Integer, JSON, DateTime
from app.core.database import Base


class HardwareMerchant(Base):
    __tablename__ = "merchants"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    owner_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(String(255), nullable=False)
    pincode = Column(String(10), nullable=False)
    # Store location; the pickup point for dispatch distance checks.
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Stores start unverified; an admin approves them before buyers can see them.
    verified = Column(Boolean, default=False)
    # Null until real reviews or dispatch history exist; panels show "No data" for null.
    rating = Column(Float, nullable=True)
    reviews_count = Column(Integer, default=0)

    distance_km = Column(Float, nullable=True)
    delivery_eta_minutes = Column(Integer, nullable=True)
    min_order_value = Column(Integer, nullable=True)

    main_category = Column(String(100), nullable=True)
    brands = Column(JSON, default=list)
    is_online = Column(Boolean, default=False)
    avatar_url = Column(String(255), nullable=True)

    gstin = Column(String(50), nullable=True)
    bank_account = Column(String(50), nullable=True)
    wallet_balance = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
