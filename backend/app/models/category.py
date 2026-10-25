from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, JSON, DateTime
from app.core.database import Base


class MaterialCategory(Base):
    __tablename__ = "categories"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    subtitle = Column(String(200), nullable=False)
    icon_name = Column(String(50), nullable=False)
    color_bg = Column(String(50), default="bg-[#FF6500]")
    item_count = Column(Integer, default=100)
    trending_badge = Column(String(50), nullable=True)
    image = Column(String(255), nullable=False)
    subcategories = Column(JSON, default=list)
    featured_brands = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
