from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, model_validator


class VendorDashboardCompositeResponse(BaseModel):
    merchantId: str
    storeName: str
    isOnline: bool
    verified: bool
    walletBalance: float
    todayRevenue: float
    grossSales: float
    platformFees: float
    netSettlementBalance: float
    ordersAwaitingActionCount: int
    ordersPreparingCount: int
    ordersReadyPickupCount: int
    ordersFulfilledCount: int
    lowStockCount: int
    recentOrders: List[Dict[str, Any]]
    inventoryOverview: List[Dict[str, Any]]
    quickStats: Dict[str, Any]


class StockUpdateRequest(BaseModel):
    productId: str
    newStockQty: int = Field(..., ge=0)
    newPrice: Optional[float] = Field(None, gt=0)
    reason: Optional[str] = "Manual stock reconciliation"


class VendorOrderUpdateRequest(BaseModel):
    orderId: str
    status: str
    reason: Optional[str] = None


class VendorProfileUpdateRequest(BaseModel):
    # GSTIN and bank account are deliberately not editable by vendors. Changing
    # them redirects settlements, so they go through admin verification instead.
    name: Optional[str] = None
    owner_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    min_order_value: Optional[int] = Field(None, ge=0)
    delivery_eta_minutes: Optional[int] = Field(None, ge=0)
    # Store location for driver dispatch: drivers are matched within 15 km of this point.
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class VendorProductCreateRequest(BaseModel):
    title: str
    category: str
    brand: str
    price: float = Field(..., gt=0)
    unit: str
    moq: Optional[int] = Field(1, ge=1)
    weight_spec: Optional[str] = "Standard"
    image: str
    grade: Optional[str] = None
    gauge: Optional[str] = None
    weight_kg: Optional[float] = Field(50.0, gt=0)
    stock_qty: Optional[int] = Field(500, ge=0)


class VendorProductUpdateRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    moq: Optional[int] = Field(None, ge=1)
    weight_spec: Optional[str] = None
    image: Optional[str] = None
    grade: Optional[str] = None
    gauge: Optional[str] = None
    weight_kg: Optional[float] = Field(None, gt=0)
    stock_qty: Optional[int] = Field(None, ge=0)


class VendorStockAdjustRequest(BaseModel):
    productId: str
    adjustmentQty: int
    reason: str


class VendorBoqQuoteSubmitRequest(BaseModel):
    quoteId: str
    estimatedTotal: float = Field(..., gt=0)
    notes: Optional[str] = None


class VendorDealProposeRequest(BaseModel):
    material: str
    brand: str
    image: str
    originalRate: float = Field(..., gt=0)
    dealRate: float = Field(..., gt=0)
    unit: str
    discountPct: Optional[int] = Field(10, ge=1, le=50)
    minOrder: Optional[str] = "100 Bags Min."
    badge: Optional[str] = "Merchant Deal"

    @model_validator(mode="after")
    def deal_must_be_discount(self) -> "VendorDealProposeRequest":
        # A deal that is not actually cheaper than the list rate is misleading to buyers.
        if self.dealRate >= self.originalRate:
            raise ValueError("dealRate must be lower than originalRate")
        return self
