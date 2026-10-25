from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.core.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(String(50), primary_key=True, index=True)
    material = Column(String(150), nullable=False)
    brand = Column(String(100), nullable=False)
    image = Column(String(255), nullable=False)
    original_rate = Column(Float, nullable=False)
    deal_rate = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    discount_pct = Column(Integer, default=10)
    min_order = Column(String(100), default="100 Bags Min.")
    badge = Column(String(50), default="Flash Deal")
    badge_color = Column(String(50), default="bg-[#FF6500]")
    expires_in_seconds = Column(Integer, default=18000)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
