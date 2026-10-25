from fastapi import APIRouter
from app.api.v1.endpoints import auth, buyer, vendor, driver, admin, payment, websocket

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(buyer.router)
api_router.include_router(vendor.router)
api_router.include_router(driver.router)
api_router.include_router(admin.router)
api_router.include_router(payment.router)
api_router.include_router(websocket.router)
