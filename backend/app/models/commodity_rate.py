from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from app.core.database import Base


class CommodityRate(Base):
    __tablename__ = "commodity_rates"

    id = Column(String(50), primary_key=True, index=True)
    material_name = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=False)
    wholesale_rate = Column(Float, nullable=False)
    prev_rate = Column(Float, nullable=False)
    trend = Column(String(20), default="stable")
    change_percent = Column(Float, default=0.0)
    last_updated = Column(String(50), default="Just now")
    
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
