from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.core.database import Base


class DispatchOffer(Base):
    """A request sent to one driver to take one trip. Expires if not answered in time."""
    __tablename__ = "dispatch_offers"

    id = Column(String(50), primary_key=True, index=True)
    trip_id = Column(String(50), ForeignKey("delivery_trips.id"), nullable=False, index=True)
    driver_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)

    # offered -> accepted | declined | expired | cancelled
    status = Column(String(20), default="offered", nullable=False, index=True)
    distance_km = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)
