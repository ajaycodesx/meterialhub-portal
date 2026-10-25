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
    
    verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    reviews_count = Column(Integer, default=120)
    
    distance_km = Column(Float, default=2.5)
    delivery_eta_minutes = Column(Integer, default=45)
    min_order_value = Column(Integer, default=5000)
    
    main_category = Column(String(100), default="All Hardware & Building Materials")
    brands = Column(JSON, default=list)
    is_online = Column(Boolean, default=True)
    avatar_url = Column(String(255), default="/images/logo.png")
    
    gstin = Column(String(50), default="32AAACH7409R1ZZ")
    bank_account = Column(String(50), default="9876543210123")
    wallet_balance = Column(Float, default=145200.0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
