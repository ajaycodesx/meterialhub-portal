from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.services.vendor_service import VendorService
from app.schemas.vendor import VendorDashboardCompositeResponse, StockUpdateRequest, VendorOrderUpdateRequest
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/vendor", tags=["Vendor BFF Endpoints"])


@router.get("/dashboard", response_model=ApiResponse[VendorDashboardCompositeResponse])
async def get_vendor_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    SINGLE COMPOSITE API FOR VENDOR DASHBOARD:
    Returns store revenue, wallet balance, active orders, inventory alerts, and quick stats in one call.
    """
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied. Vendor role required.")
    
    merchant_id = current_user.merchant_id
    if not merchant_id:
        raise HTTPException(status_code=400, detail="Vendor has no merchant assigned.")
    
    data = await VendorService.get_dashboard_composite(db, merchant_id)
    return ApiResponse(data=data, message="Vendor dashboard data retrieved successfully")


@router.post("/update-stock", response_model=ApiResponse[dict])
async def update_product_stock(
    req: StockUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied. Vendor role required.")
    
    success = await VendorService.update_stock(db, req)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(data={"updated": True, "productId": req.productId}, message="Stock updated successfully")


@router.post("/update-order-status", response_model=ApiResponse[dict])
async def update_vendor_order_status(
    req: VendorOrderUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied. Vendor role required.")
    
    merchant_id = current_user.merchant_id
    if not merchant_id:
        raise HTTPException(status_code=400, detail="Vendor has no merchant assigned.")

    from app.schemas.vendor import VendorOrderUpdateRequest
    success = await VendorService.update_order_status(db, req.orderId, req.status, merchant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found or does not belong to this vendor")
    return ApiResponse(data={"updated": True, "orderId": req.orderId, "newStatus": req.status}, message="Order status updated successfully")
