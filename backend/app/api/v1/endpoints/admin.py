from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.services.admin_service import AdminService
from app.schemas.admin import AdminOverviewCompositeResponse, UpdateCommodityRateRequest, ToggleMerchantRequest
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/admin", tags=["Admin BFF Endpoints"])


@router.get("/overview", response_model=ApiResponse[AdminOverviewCompositeResponse])
async def get_admin_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    SINGLE COMPOSITE API FOR ADMIN OPERATIONS CONSOLE:
    Returns platform GMV, verified merchant roster, active driver dispatch, and commodity price index.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_overview_composite(db)
    return ApiResponse(data=data, message="Admin overview data retrieved successfully")


@router.post("/commodity-rates", response_model=ApiResponse[dict])
async def update_admin_commodity_rate(
    req: UpdateCommodityRateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_commodity_rate(
        db, req.id, req.wholesale_rate, req.trend or "stable", req.change_percent or 0.0
    )
    if not success:
        raise HTTPException(status_code=404, detail="Commodity rate record not found")
    return ApiResponse(data={"updated": True, "id": req.id, "newRate": req.wholesale_rate}, message="Commodity rate updated successfully")


@router.post("/merchants/toggle", response_model=ApiResponse[dict])
async def toggle_merchant_status(
    req: ToggleMerchantRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.toggle_merchant(db, req.merchantId, req.field or "verified")
    if not success:
        raise HTTPException(status_code=404, detail="Merchant record not found")
    return ApiResponse(data={"toggled": True, "merchantId": req.merchantId, "field": req.field}, message="Merchant status toggled successfully")


@router.get("/audit-logs", response_model=ApiResponse[list])
async def get_admin_audit_logs(
    limit: int = 25,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    logs = await AdminService.get_audit_logs(db, limit)
    return ApiResponse(data=logs, message="Audit logs retrieved successfully")
