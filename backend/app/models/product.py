from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    category = Column(String(50), ForeignKey("categories.id"), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    moq = Column(Integer, default=1)
    weight_spec = Column(String(50), default="Standard")
    image = Column(String(255), nullable=False)
    
    grade = Column(String(50), nullable=True)
    gauge = Column(String(50), nullable=True)
    weight_kg = Column(Float, default=50.0)
    stock_qty = Column(Integer, default=500)
    merchant_id = Column(String(50), ForeignKey("merchants.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
