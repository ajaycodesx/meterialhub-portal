from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.services.vendor_service import VendorService
from app.schemas.vendor import (
    VendorDashboardCompositeResponse,
    StockUpdateRequest,
    VendorOrderUpdateRequest,
    VendorProfileUpdateRequest,
    VendorProductCreateRequest,
    VendorProductUpdateRequest,
    VendorStockAdjustRequest,
    VendorBoqQuoteSubmitRequest,
    VendorDealProposeRequest
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/vendor", tags=["Vendor BFF Endpoints"])


def get_verified_merchant_id(current_user: User) -> str:
    if current_user.role != UserRole.VENDOR:
        raise HTTPException(status_code=403, detail="Access denied. Vendor role required.")
    merchant_id = current_user.merchant_id
    if not merchant_id:
        raise HTTPException(status_code=400, detail="Vendor has no merchant store assigned.")
    return merchant_id


@router.get("/dashboard", response_model=ApiResponse[VendorDashboardCompositeResponse])
async def get_vendor_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    data = await VendorService.get_dashboard_composite(db, merchant_id)
    return ApiResponse(data=data, message="Vendor dashboard data retrieved successfully")


@router.get("/profile", response_model=ApiResponse[dict])
async def get_vendor_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    profile = await VendorService.get_profile(db, merchant_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Merchant profile record not found")
    return ApiResponse(data=profile, message="Vendor profile retrieved")


@router.put("/profile", response_model=ApiResponse[dict])
async def update_vendor_profile(
    req: VendorProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.update_profile(db, merchant_id, req.model_dump(exclude_unset=True), current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Merchant record not found")
    return ApiResponse(data={"updated": True}, message="Vendor profile updated")


@router.post("/toggle-online", response_model=ApiResponse[dict])
async def toggle_vendor_online(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    is_online = await VendorService.toggle_online(db, merchant_id, current_user.id)
    return ApiResponse(data={"isOnline": is_online}, message="Store online status updated")


@router.get("/orders", response_model=ApiResponse[dict])
async def get_vendor_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    data = await VendorService.get_orders(db, merchant_id, status, search, page, limit)
    return ApiResponse(data=data, message="Vendor orders retrieved")


@router.get("/orders/{order_id}", response_model=ApiResponse[dict])
async def get_vendor_order_detail(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    detail = await VendorService.get_order_detail(db, merchant_id, order_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Order not found or does not belong to your store")
    return ApiResponse(data=detail, message="Order details retrieved")


@router.post("/orders/{order_id}/pack", response_model=ApiResponse[dict])
async def pack_vendor_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.pack_order(db, merchant_id, order_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to mark order as packed. Verify order ownership.")
    return ApiResponse(data={"packed": True, "orderId": order_id}, message="Order marked as packed and ready for driver pickup")


@router.post("/orders/{order_id}/reject", response_model=ApiResponse[dict])
async def reject_vendor_order(
    order_id: str,
    req: VendorOrderUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.reject_order(db, merchant_id, order_id, req.reason or "Stock shortage", current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to cancel order")
    return ApiResponse(data={"cancelled": True, "orderId": order_id}, message="Order rejected and inventory restored")


@router.get("/products", response_model=ApiResponse[dict])
async def get_vendor_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    data = await VendorService.get_products(db, merchant_id, category, search, page, limit)
    return ApiResponse(data=data, message="Store products retrieved")


@router.post("/products", response_model=ApiResponse[dict])
async def create_vendor_product(
    req: VendorProductCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    res = await VendorService.create_product(db, merchant_id, req.model_dump(), current_user.id)
    return ApiResponse(data=res, message="Product created successfully")


@router.put("/products/{product_id}", response_model=ApiResponse[dict])
async def update_vendor_product(
    product_id: str,
    req: VendorProductUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.update_product(db, merchant_id, product_id, req.model_dump(exclude_unset=True), current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(data={"updated": True, "productId": product_id}, message="Product specs updated")


@router.delete("/products/{product_id}", response_model=ApiResponse[dict])
async def delete_vendor_product(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.delete_product(db, merchant_id, product_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(data={"deleted": True, "productId": product_id}, message="Product deleted")


@router.post("/products/{product_id}/adjust-stock", response_model=ApiResponse[dict])
async def adjust_vendor_stock(
    product_id: str,
    req: VendorStockAdjustRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    try:
        res = await VendorService.adjust_stock(db, merchant_id, product_id, req.adjustmentQty, req.reason, current_user.id)
        return ApiResponse(data=res, message="Inventory stock adjusted successfully")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/update-stock", response_model=ApiResponse[dict])
async def update_product_stock_direct(
    req: StockUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    get_verified_merchant_id(current_user)
    success = await VendorService.update_stock(db, req)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return ApiResponse(data={"updated": True, "productId": req.productId}, message="Stock updated successfully")


@router.post("/update-order-status", response_model=ApiResponse[dict])
async def update_vendor_order_status_direct(
    req: VendorOrderUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.update_order_status(db, req.orderId, req.status, merchant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found or does not belong to this vendor")
    return ApiResponse(data={"updated": True, "orderId": req.orderId, "newStatus": req.status}, message="Order status updated successfully")


@router.get("/boq-quotes", response_model=ApiResponse[list])
async def get_vendor_boq_quotes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    quotes = await VendorService.get_boq_quotes(db, merchant_id)
    return ApiResponse(data=quotes, message="BOQ quotes retrieved")


@router.post("/boq-quotes/{quote_id}/quote", response_model=ApiResponse[dict])
async def submit_vendor_boq_quote(
    quote_id: str,
    req: VendorBoqQuoteSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.submit_boq_quote(db, merchant_id, quote_id, req.estimatedTotal, req.notes, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="BOQ quote not found")
    return ApiResponse(data={"submitted": True, "quoteId": quote_id}, message="BOQ quote submitted to contractor")


@router.get("/commodity-rates", response_model=ApiResponse[list])
async def get_vendor_commodity_rates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    get_verified_merchant_id(current_user)
    rates = await VendorService.get_commodity_rates(db)
    return ApiResponse(data=rates, message="Live commodity rates retrieved")


@router.get("/deals", response_model=ApiResponse[list])
async def get_vendor_deals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    deals = await VendorService.get_deals(db, merchant_id)
    return ApiResponse(data=deals, message="Deals retrieved")


@router.post("/deals/propose", response_model=ApiResponse[dict])
async def propose_vendor_deal(
    req: VendorDealProposeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    success = await VendorService.propose_deal(db, merchant_id, req.model_dump(), current_user.id)
    return ApiResponse(data={"proposed": True}, message="Promotional deal proposed successfully")


@router.get("/settlements", response_model=ApiResponse[dict])
async def get_vendor_settlements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    merchant_id = get_verified_merchant_id(current_user)
    ledger = await VendorService.get_settlements(db, merchant_id)
    return ApiResponse(data=ledger, message="Settlement ledger retrieved")
