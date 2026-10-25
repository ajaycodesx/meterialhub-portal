from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AdminOverviewCompositeResponse(BaseModel):
    totalGmv: float
    totalOrders: int
    activeMerchantsCount: int
    activeDriversCount: int
    todaysTonnageDispatched: float
    recentOrders: List[Dict[str, Any]]
    merchantRoster: List[Dict[str, Any]]
    liveCommodityRates: List[Dict[str, Any]]
    systemHealth: Dict[str, Any]


class UpdateCommodityRateRequest(BaseModel):
    id: str
    wholesale_rate: float
    trend: Optional[str] = "stable"
    change_percent: Optional[float] = 0.0


class ToggleMerchantRequest(BaseModel):
    merchantId: str
    field: Optional[str] = "verified"
