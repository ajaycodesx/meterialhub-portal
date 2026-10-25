from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class BoqQuoteSubmitRequest(BaseModel):
    projectName: str
    deliveryPincode: str
    siteAddress: str
    rawMaterialsText: Optional[str] = None
    fileUrl: Optional[str] = None


class BoqQuoteResponse(BaseModel):
    quoteId: str
    projectName: str
    status: str
    estimatedTotal: float
    parsedItems: List[Dict[str, Any]]
    createdAt: str
