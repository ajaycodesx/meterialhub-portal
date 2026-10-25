from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.models.order import OrderStatus


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
    rating: float
    reviewsCount: int
    distanceKm: float
    deliveryEtaMinutes: int
    minOrderValue: int
    brands: List[str] = []
    mainCategory: str
    address: str
    pincode: str
    isOnline: bool
    avatarUrl: str


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
    quantity: int


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
    paymentMode: str = "Cash on Unloading"


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
