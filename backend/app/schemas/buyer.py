from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from app.models.order import OrderStatus

# Upper bound on a single line item. Keeps a client from requesting absurd
# quantities that would distort tonnage-based truck selection and stock checks.
MAX_LINE_QUANTITY = 10000

PaymentMode = Literal["Cash on Unloading", "Wholesale B2B Credit", "Online Payment (Razorpay)"]


class CommodityRateSchema(BaseModel):
    id: str
    materialName: str
    unit: str
    wholesaleRate: float
    prevRate: float
    trend: str
    changePercent: float
    lastUpdated: str


class DealSchema(BaseModel):
    id: str
    material: str
    brand: str
    image: str
    originalRate: float
    dealRate: float
    unit: str
    discountPct: int
    minOrder: str
    badge: str
    badgeColor: str
    expiresInSeconds: int


class CategorySchema(BaseModel):
    id: str
    title: str
    subtitle: str
    iconName: str
    colorBg: str
    itemCount: int
    trendingBadge: Optional[str] = None
    image: str
    subcategories: List[str] = []
    featuredBrands: List[str] = []


class MerchantSchema(BaseModel):
    id: str
    name: str
    ownerName: str
    phone: str
    verified: bool
    rating: Optional[float] = None
    reviewsCount: int = 0
    distanceKm: Optional[float] = None
    deliveryEtaMinutes: Optional[int] = None
    minOrderValue: Optional[int] = None
    brands: List[str] = []
    mainCategory: Optional[str] = None
    address: str
    pincode: str
    isOnline: bool
    avatarUrl: Optional[str] = None


class ProductSchema(BaseModel):
    id: str
    title: str
    category: str
    brand: str
    price: float
    unit: str
    moq: int
    weightSpec: str
    image: str
    grade: Optional[str] = None
    gauge: Optional[str] = None
    weightKg: float
    stockQty: int = 500
    merchantId: Optional[str] = None


class BuyerHomeCompositeResponse(BaseModel):
    hero: Dict[str, Any]
    trendingDeals: List[DealSchema]
    categories: List[CategorySchema]
    nearbyMerchants: List[MerchantSchema]
    rateTicker: List[CommodityRateSchema]
    serviceRadiusKm: int = 20


class BuyerCatalogCompositeResponse(BaseModel):
    products: List[ProductSchema]
    merchants: List[MerchantSchema]
    categories: List[CategorySchema]
    totalCount: int
    activeCategory: Optional[str] = None
    activeMerchant: Optional[str] = None
    priceRange: Dict[str, float]


class CartItemInput(BaseModel):
    productId: str
    quantity: int = Field(..., gt=0, le=MAX_LINE_QUANTITY)


class OrderCalculationRequest(BaseModel):
    items: List[CartItemInput]
    pincode: str = "682030"
    distanceKm: float = 3.5
    craneNeeded: bool = False


class OrderCalculationResponse(BaseModel):
    itemsTotal: float
    totalWeightKg: float
    totalTonnage: float
    deliveryFee: float
    craneFee: float
    gstBreakdown: Dict[str, float]
    gstTotal: float
    grandTotal: float
    recommendedVehicle: str
    isDeliverable: bool = True


class SiteConstraintsInput(BaseModel):
    roadWidth: str = "12ft+"
    craneNeeded: bool = False
    unloadingTimeSlot: str = "Morning (8 AM - 12 PM)"


class OrderCreateRequest(BaseModel):
    merchantId: str
    items: List[CartItemInput]
    deliveryAddress: str
    pincode: str
    siteConstraints: SiteConstraintsInput
    paymentMode: PaymentMode = "Cash on Unloading"
    # Pin the site on the map so the driver can be routed to it. Optional.
    deliveryLatitude: Optional[float] = Field(None, ge=-90, le=90)
    deliveryLongitude: Optional[float] = Field(None, ge=-180, le=180)


class OrderDetailResponse(BaseModel):
    orderId: str
    invoiceNumber: str
    merchantName: str
    merchantPhone: str
    itemsTotal: float
    deliveryFee: float
    gstAmount: float
    grandTotal: float
    totalWeightKg: float
    status: OrderStatus
    deliveryAddress: str
    pincode: str
    createdAt: str
    items: List[Dict[str, Any]]
    driverTrip: Optional[Dict[str, Any]] = None


class BoqQuoteCreateRequest(BaseModel):
    projectName: str
    deliveryPincode: str
    siteAddress: str
    rawMaterialsText: Optional[str] = None
    fileUrl: Optional[str] = None


class BoqQuoteResponse(BaseModel):
    id: str
    projectName: str
    deliveryPincode: str
    siteAddress: str
    rawMaterialsText: Optional[str] = None
    fileUrl: Optional[str] = None
    estimatedTotal: float = 0.0
    status: str = "under_review"
    createdAt: str


class OrderCancelRequest(BaseModel):
    reason: Optional[str] = "Cancelled by buyer"


class OrderRatingRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    reviewText: Optional[str] = None
