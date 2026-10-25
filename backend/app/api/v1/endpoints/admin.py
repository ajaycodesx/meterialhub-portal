from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.services.admin_service import AdminService
from app.schemas.admin import (
    AdminOverviewCompositeResponse,
    UpdateCommodityRateRequest,
    ToggleMerchantRequest,
    AdminMerchantVerifyRequest,
    AdminMerchantUpdateRequest,
    AdminOrderStatusUpdateRequest,
    AdminOrderReassignDriverRequest,
    AdminProductCreateRequest,
    AdminProductUpdateRequest,
    AdminCategorySaveRequest,
    AdminUserToggleRequest,
    AdminTripStatusUpdateRequest,
    AdminRefundProcessRequest,
    AdminBoqQuoteUpdateRequest,
    AdminDealSaveRequest,
    AdminDisputeUpdateRequest,
    AdminNotificationTemplateUpdateRequest,
    AdminSettingsUpdateRequest
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/admin", tags=["Admin BFF Endpoints"])


@router.get("/overview", response_model=ApiResponse[AdminOverviewCompositeResponse])
async def get_admin_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_overview_composite(db)
    return ApiResponse(data=data, message="Admin overview data retrieved successfully")


@router.get("/orders", response_model=ApiResponse[dict])
async def get_admin_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_orders(db, status, search, page, limit)
    return ApiResponse(data=data, message="Admin orders retrieved successfully")


@router.get("/orders/{order_id}", response_model=ApiResponse[dict])
async def get_admin_order_detail(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_order_detail(db, order_id)
    if not data:
        raise HTTPException(status_code=404, detail="Order not found")
    return ApiResponse(data=data, message="Order details retrieved successfully")


@router.post("/orders/{order_id}/status", response_model=ApiResponse[dict])
async def update_admin_order_status(
    order_id: str,
    req: AdminOrderStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_order_status(db, order_id, req.status, req.reason, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update order status or invalid status transition")
    return ApiResponse(data={"updated": True, "orderId": order_id, "status": req.status}, message="Order status updated successfully")


@router.post("/orders/{order_id}/reassign-driver", response_model=ApiResponse[dict])
async def reassign_admin_order_driver(
    order_id: str,
    req: AdminOrderReassignDriverRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.reassign_order_driver(db, order_id, req.driverId, req.reason, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to assign driver. Verify order trip and driver existence.")
    return ApiResponse(data={"reassigned": True, "orderId": order_id, "driverId": req.driverId}, message="Driver reassigned successfully")


@router.get("/merchants", response_model=ApiResponse[dict])
async def get_admin_merchants(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_merchants(db, status, search, page, limit)
    return ApiResponse(data=data, message="Merchants retrieved successfully")


@router.get("/merchants/{merchant_id}", response_model=ApiResponse[dict])
async def get_admin_merchant_detail(
    merchant_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_merchant_detail(db, merchant_id)
    if not data:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return ApiResponse(data=data, message="Merchant details retrieved successfully")


@router.post("/merchants/verify", response_model=ApiResponse[dict])
async def verify_admin_merchant(
    req: AdminMerchantVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.verify_merchant(db, req.merchantId, req.verified, req.is_online if req.is_online is not None else True, req.reason, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return ApiResponse(data={"updated": True, "merchantId": req.merchantId, "verified": req.verified}, message="Merchant verification status updated")


@router.post("/merchants/{merchant_id}/update", response_model=ApiResponse[dict])
async def update_admin_merchant_profile(
    merchant_id: str,
    req: AdminMerchantUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_merchant(db, merchant_id, req.model_dump(exclude_unset=True), current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return ApiResponse(data={"updated": True, "merchantId": merchant_id}, message="Merchant profile updated successfully")


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


@router.get("/products", response_model=ApiResponse[dict])
async def get_admin_products(
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_products(db, category, brand, search, page, limit)
    return ApiResponse(data=data, message="Products retrieved successfully")


@router.post("/products", response_model=ApiResponse[dict])
async def create_admin_product(
    req: AdminProductCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    res = await AdminService.create_product(db, req.model_dump(), current_user.id)
    return ApiResponse(data=res, message="Product created successfully")


@router.put("/products/{product_id}", response_model=ApiResponse[dict])
async def update_admin_product(
    product_id: str,
    req: AdminProductUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_product(db, product_id, req.model_dump(exclude_unset=True), current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(data={"updated": True, "productId": product_id}, message="Product updated successfully")


@router.delete("/products/{product_id}", response_model=ApiResponse[dict])
async def delete_admin_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.delete_product(db, product_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(data={"deleted": True, "productId": product_id}, message="Product deleted successfully")


@router.get("/categories", response_model=ApiResponse[list])
async def get_admin_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_categories(db)
    return ApiResponse(data=data, message="Categories retrieved successfully")


@router.post("/categories", response_model=ApiResponse[dict])
async def save_admin_category(
    req: AdminCategorySaveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.save_category(db, req.model_dump(), current_user.id)
    return ApiResponse(data={"saved": True, "categoryId": req.id}, message="Category saved successfully")


@router.get("/buyers", response_model=ApiResponse[dict])
async def get_admin_buyers(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_buyers(db, search, page, limit)
    return ApiResponse(data=data, message="Buyers retrieved successfully")


@router.post("/users/toggle", response_model=ApiResponse[dict])
async def toggle_admin_user_status(
    req: AdminUserToggleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.toggle_user_status(db, req.userId, req.field, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return ApiResponse(data={"toggled": True, "userId": req.userId, "field": req.field}, message="User status toggled successfully")


@router.get("/drivers", response_model=ApiResponse[dict])
async def get_admin_drivers(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_drivers(db, search, page, limit)
    return ApiResponse(data=data, message="Drivers retrieved successfully")


@router.get("/trips", response_model=ApiResponse[dict])
async def get_admin_trips(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_trips(db, status, search, page, limit)
    return ApiResponse(data=data, message="Dispatch trips retrieved successfully")


@router.post("/trips/status", response_model=ApiResponse[dict])
async def update_admin_trip_status(
    req: AdminTripStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_trip_status(db, req.tripId, req.status, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update trip status")
    return ApiResponse(data={"updated": True, "tripId": req.tripId, "status": req.status}, message="Trip status updated successfully")


@router.get("/payments", response_model=ApiResponse[dict])
async def get_admin_payments(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_payments(db, status, search, page, limit)
    return ApiResponse(data=data, message="Payment records retrieved successfully")


@router.post("/payments/refund", response_model=ApiResponse[dict])
async def process_admin_refund(
    req: AdminRefundProcessRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.process_refund(db, req.orderId, req.amount, req.reason, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found for refund")
    return ApiResponse(data={"refunded": True, "orderId": req.orderId}, message="Refund processed successfully")


@router.get("/boq-quotes", response_model=ApiResponse[dict])
async def get_admin_boq_quotes(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_boq_quotes(db, status, page, limit)
    return ApiResponse(data=data, message="BOQ quotes retrieved successfully")


@router.post("/boq-quotes/{quote_id}/status", response_model=ApiResponse[dict])
async def update_admin_boq_quote_status(
    quote_id: str,
    req: AdminBoqQuoteUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_boq_quote(db, quote_id, req.status, req.estimated_total, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="BOQ quote not found")
    return ApiResponse(data={"updated": True, "quoteId": quote_id, "status": req.status}, message="BOQ quote updated successfully")


@router.get("/commodity-rates", response_model=ApiResponse[list])
async def get_admin_commodity_rates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_commodity_rates(db)
    return ApiResponse(data=data, message="Commodity rates retrieved successfully")


@router.post("/commodity-rates", response_model=ApiResponse[dict])
async def update_admin_commodity_rate(
    req: UpdateCommodityRateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_commodity_rate(
        db, req.id, req.wholesale_rate, req.trend or "stable", req.change_percent or 0.0, current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Commodity rate record not found")
    return ApiResponse(data={"updated": True, "id": req.id, "newRate": req.wholesale_rate}, message="Commodity rate updated successfully")


@router.get("/deals", response_model=ApiResponse[list])
async def get_admin_deals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_deals(db)
    return ApiResponse(data=data, message="Deals retrieved successfully")


@router.post("/deals", response_model=ApiResponse[dict])
async def save_admin_deal(
    req: AdminDealSaveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.save_deal(db, req.model_dump(), current_user.id)
    return ApiResponse(data={"saved": True}, message="Deal saved successfully")


@router.delete("/deals/{deal_id}", response_model=ApiResponse[dict])
async def delete_admin_deal(
    deal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.delete_deal(db, deal_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Deal not found")
    return ApiResponse(data={"deleted": True, "dealId": deal_id}, message="Deal deleted successfully")


@router.get("/disputes", response_model=ApiResponse[list])
async def get_admin_disputes(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_disputes()
    return ApiResponse(data=data, message="Disputes retrieved successfully")


@router.post("/disputes/{dispute_id}", response_model=ApiResponse[dict])
async def update_admin_dispute(
    dispute_id: str,
    req: AdminDisputeUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_dispute(db, dispute_id, req.status, req.resolutionNotes, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return ApiResponse(data={"updated": True, "disputeId": dispute_id}, message="Dispute updated successfully")


@router.get("/templates", response_model=ApiResponse[list])
async def get_admin_notification_templates(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_notification_templates()
    return ApiResponse(data=data, message="Communication templates retrieved successfully")


@router.post("/templates/{template_id}", response_model=ApiResponse[dict])
async def update_admin_notification_template(
    template_id: str,
    req: AdminNotificationTemplateUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    success = await AdminService.update_notification_template(db, template_id, req.subject, req.bodyText, req.isActive, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return ApiResponse(data={"updated": True, "templateId": template_id}, message="Communication template updated")


@router.get("/settings", response_model=ApiResponse[dict])
async def get_admin_settings(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.get_settings()
    return ApiResponse(data=data, message="Platform settings retrieved successfully")


@router.post("/settings", response_model=ApiResponse[dict])
async def update_admin_settings(
    req: AdminSettingsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    data = await AdminService.update_settings(db, req.model_dump(exclude_unset=True), current_user.id)
    return ApiResponse(data=data, message="Platform settings updated successfully")


@router.get("/audit-logs", response_model=ApiResponse[list])
async def get_admin_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    logs = await AdminService.get_audit_logs(db, limit)
    return ApiResponse(data=logs, message="Audit logs retrieved successfully")
