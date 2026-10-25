from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON
from app.core.database import Base


class BoqQuote(Base):
    __tablename__ = "boq_quotes"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    project_name = Column(String(150), nullable=False)
    delivery_pincode = Column(String(10), nullable=False)
    site_address = Column(String(255), nullable=False)
    
    file_url = Column(String(255), nullable=True)
    raw_materials_text = Column(String(1000), nullable=True)
    parsed_items = Column(JSON, default=list)
    
    estimated_total = Column(Float, default=0.0)
    status = Column(String(50), default="under_review")
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
