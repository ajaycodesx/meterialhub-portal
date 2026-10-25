import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Enum, JSON
from app.core.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PACKING = "packing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    merchant_id = Column(String(50), ForeignKey("merchants.id"), nullable=False, index=True)
    
    items_total = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=0.0)
    gst_amount = Column(Float, default=0.0)
    grand_total = Column(Float, nullable=False)
    
    total_weight_kg = Column(Float, default=0.0)
    vehicle_recommended = Column(String(50), default="Pickup Truck")
    
    delivery_address = Column(String(255), nullable=False)
    pincode = Column(String(10), nullable=False)
    site_constraints = Column(JSON, default=dict)
    
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    payment_mode = Column(String(50), default="Cash on Unloading")
    invoice_number = Column(String(50), unique=True, nullable=True)

    payment_order_id = Column(String(100), nullable=True, index=True)
    payment_id = Column(String(100), nullable=True, index=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False)
    product_title = Column(String(200), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(50), nullable=False)
    weight_kg = Column(Float, default=50.0)
    subtotal = Column(Float, nullable=False)
