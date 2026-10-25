import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Enum, JSON
from app.core.database import Base


class TripStatus(str, enum.Enum):
    UNASSIGNED = "unassigned"
    ASSIGNED = "assigned"
    ACCEPTED = "accepted"
    ARRIVED_AT_STORE = "arrived_at_store"
    LOADED = "loaded"
    IN_TRANSIT = "in_transit"
    ARRIVED_AT_SITE = "arrived_at_site"
    UNLOADED_COMPLETED = "unloaded_completed"


class DeliveryTrip(Base):
    __tablename__ = "delivery_trips"

    id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False, unique=True)
    driver_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)
    
    vehicle_type = Column(String(50), default="Mini Commercial Truck (3 Ton)")
    vehicle_reg_number = Column(String(20), default="KL-07-CD-8921")
    
    pickup_address = Column(String(255), nullable=False)
    drop_address = Column(String(255), nullable=False)
    distance_km = Column(Float, default=4.5)
    
    trip_fare = Column(Float, default=750.0)
    tip_amount = Column(Float, default=0.0)
    
    status = Column(Enum(TripStatus), default=TripStatus.UNASSIGNED)
    current_gps = Column(JSON, default=lambda: {"lat": 10.0159, "lng": 76.3419})
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
