from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class VendorDashboardCompositeResponse(BaseModel):
    merchantId: str
    storeName: str
    isOnline: bool
    walletBalance: float
    todayRevenue: float
    activeOrdersCount: int
    pendingDispatchCount: int
    lowStockCount: int
    recentOrders: List[Dict[str, Any]]
    inventoryOverview: List[Dict[str, Any]]
    quickStats: Dict[str, Any]


class StockUpdateRequest(BaseModel):
    productId: str
    newStockQty: int
    newPrice: Optional[float] = None


class VendorOrderUpdateRequest(BaseModel):
    orderId: str
    status: str
