from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AdminOverviewCompositeResponse(BaseModel):
    totalGmv: float
    platformRevenue: float
    netSettlements: float
    totalOrders: int
    ordersByStatus: Dict[str, int]
    merchantsStats: Dict[str, int]
    driversStats: Dict[str, int]
    productsCount: int
    lowStockCount: int
    pendingBoqQuotes: int
    todaysTonnageDispatched: float
    recentOrders: List[Dict[str, Any]]
    merchantRoster: List[Dict[str, Any]]
    liveCommodityRates: List[Dict[str, Any]]
    systemHealth: Dict[str, Any]
    failedPaymentsCount: int


class UpdateCommodityRateRequest(BaseModel):
    id: str
    wholesale_rate: float
    trend: Optional[str] = "stable"
    change_percent: Optional[float] = 0.0


class ToggleMerchantRequest(BaseModel):
    merchantId: str
    field: Optional[str] = "verified"


class AdminMerchantVerifyRequest(BaseModel):
    merchantId: str
    verified: bool
    is_online: Optional[bool] = True
    reason: Optional[str] = None


class AdminMerchantUpdateRequest(BaseModel):
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


class AdminOrderStatusUpdateRequest(BaseModel):
    status: str
    reason: Optional[str] = None


class AdminOrderReassignDriverRequest(BaseModel):
    driverId: str
    reason: Optional[str] = None


class AdminProductCreateRequest(BaseModel):
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
    merchant_id: Optional[str] = None


class AdminProductUpdateRequest(BaseModel):
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
    merchant_id: Optional[str] = None


class AdminCategorySaveRequest(BaseModel):
    id: str
    title: str
    subtitle: str
    icon_name: str
    color_bg: Optional[str] = "bg-[#FF6500]"
    item_count: Optional[int] = 100
    trending_badge: Optional[str] = None
    image: str
    subcategories: Optional[List[str]] = []
    featured_brands: Optional[List[str]] = []


class AdminUserToggleRequest(BaseModel):
    userId: str
    field: str = "is_active"


class AdminTripStatusUpdateRequest(BaseModel):
    tripId: str
    status: str


class AdminRefundProcessRequest(BaseModel):
    orderId: str
    amount: Optional[float] = None
    reason: str


class AdminBoqQuoteUpdateRequest(BaseModel):
    status: str
    estimated_total: Optional[float] = None


class AdminDealSaveRequest(BaseModel):
    id: Optional[str] = None
    material: str
    brand: str
    image: str
    original_rate: float
    deal_rate: float
    unit: str
    discount_pct: Optional[int] = 10
    min_order: Optional[str] = "100 Bags Min."
    badge: Optional[str] = "Flash Deal"
    badge_color: Optional[str] = "bg-[#FF6500]"
    expires_in_seconds: Optional[int] = 18000


class AdminDisputeUpdateRequest(BaseModel):
    status: str
    resolutionNotes: str


class AdminNotificationTemplateUpdateRequest(BaseModel):
    templateId: str
    subject: Optional[str] = None
    bodyText: str
    isActive: bool = True


class AdminSettingsUpdateRequest(BaseModel):
    platformCommissionPercent: Optional[float] = None
    defaultGstPercent: Optional[float] = None
    serviceRadiusKm: Optional[float] = None
    autoDispatchEnabled: Optional[bool] = None
    maintenanceMode: Optional[bool] = None
