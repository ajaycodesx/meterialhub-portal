from typing import List, Dict, Any, Optional
from pydantic import BaseModel


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
    newStockQty: int
    newPrice: Optional[float] = None
    reason: Optional[str] = "Manual stock reconciliation"


class VendorOrderUpdateRequest(BaseModel):
    orderId: str
    status: str
    reason: Optional[str] = None


class VendorProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    owner_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    min_order_value: Optional[int] = None
    delivery_eta_minutes: Optional[int] = None
    gstin: Optional[str] = None
    bank_account: Optional[str] = None


class VendorProductCreateRequest(BaseModel):
    title: str
    category: str
    brand: str
    price: float
    unit: str
    moq: Optional[int] = 1
    weight_spec: Optional[str] = "Standard"
    image: str
    grade: Optional[str] = None
    gauge: Optional[str] = None
    weight_kg: Optional[float] = 50.0
    stock_qty: Optional[int] = 500


class VendorProductUpdateRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    moq: Optional[int] = None
    weight_spec: Optional[str] = None
    image: Optional[str] = None
    grade: Optional[str] = None
    gauge: Optional[str] = None
    weight_kg: Optional[float] = None
    stock_qty: Optional[int] = None


class VendorStockAdjustRequest(BaseModel):
    productId: str
    adjustmentQty: int
    reason: str


class VendorBoqQuoteSubmitRequest(BaseModel):
    quoteId: str
    estimatedTotal: float
    notes: Optional[str] = None


class VendorDealProposeRequest(BaseModel):
    material: str
    brand: str
    image: str
    originalRate: float
    dealRate: float
    unit: str
    discountPct: Optional[int] = 10
    minOrder: Optional[str] = "100 Bags Min."
    badge: Optional[str] = "Merchant Deal"
