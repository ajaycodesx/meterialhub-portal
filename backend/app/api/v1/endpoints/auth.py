import logging
import os
import re
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, Request, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import create_access_token, verify_password, get_password_hash
from app.models.user import User, UserRole
from app.models.merchant import HardwareMerchant
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    VendorOnboardingRequest,
    DriverOnboardingRequest,
    OnboardingResponse,
    Token,
    UserResponse
)
from app.schemas.common import ApiResponse
from app.api.deps import get_current_user
from app.services.audit_service import audit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=ApiResponse[Token])
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login(
    request: Request,
    req: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(
        or_(User.email == req.phone_or_email, User.phone == req.phone_or_email)
    )
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not verify_password(req.password, user.hashed_password):
        logger.warning("Failed login attempt for identifier: %s", req.phone_or_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone/email or password"
        )

    if not user.is_active:
        logger.warning("Inactive account login attempt: user_id=%s", user.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support."
        )

    if user.role in [UserRole.VENDOR, UserRole.DRIVER] and not user.is_verified:
        logger.warning("Unverified login attempt: user_id=%s, role=%s", user.id, user.role.value)
        if user.verification_reason:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your application was not approved by MaterialHub Operations: {user.verification_reason}. Please contact support."
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your application is currently pending administrative verification. You will receive an email once approved."
        )

    access_token = create_access_token(subject=user.id)
    token_data = Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role
    )
    logger.info("User login successful: user_id=%s, role=%s", user.id, user.role.value)

    await audit_service.log_user_login(db, user, request)

    return ApiResponse(data=token_data, message="Login successful")


@router.post("/register", response_model=ApiResponse[Token])
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def register(
    request: Request,
    req: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    if req.role in [UserRole.VENDOR, UserRole.DRIVER, UserRole.ADMIN]:
        logger.warning("Blocked self-registration attempt for privileged role: %s", req.role.value)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Please use the dedicated onboarding procedure for {req.role.value}."
        )

    stmt = select(User).where(or_(User.email == req.email, User.phone == req.phone))
    res = await db.execute(stmt)
    if res.scalars().first():
        logger.warning("Registration conflict: email/phone already registered")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
        )

    saved_addresses = []
    if req.site_address:
        saved_addresses.append({
            "id": f"addr_{uuid.uuid4().hex[:6]}",
            "label": "Primary Construction Site",
            "address": req.site_address,
            "pincode": req.pincode or "682030"
        })

    new_user = User(
        id=f"u_{uuid.uuid4().hex[:8]}",
        email=req.email,
        phone=req.phone,
        name=req.name,
        hashed_password=get_password_hash(req.password),
        role=UserRole.BUYER,
        is_active=True,
        is_verified=True,
        saved_addresses=saved_addresses
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token(subject=new_user.id)
    token_data = Token(
        access_token=access_token,
        token_type="bearer",
        user_id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        phone=new_user.phone,
        role=new_user.role
    )
    logger.info("New buyer registered: user_id=%s", new_user.id)
    return ApiResponse(data=token_data, message="Buyer registered successfully")


@router.post("/onboard/vendor", response_model=ApiResponse[OnboardingResponse])
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def onboard_vendor(
    request: Request,
    req: VendorOnboardingRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(or_(User.email == req.email, User.phone == req.phone))
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email or phone is already registered."
        )

    merchant_id = f"m_{uuid.uuid4().hex[:6]}"
    new_merchant = HardwareMerchant(
        id=merchant_id,
        name=req.store_name,
        owner_name=req.owner_name,
        phone=req.phone,
        email=req.email,
        address=req.address,
        pincode=req.pincode,
        verified=False,
        reviews_count=0,
        main_category=req.main_category,
        brands=[],
        is_online=False,
        gstin=req.gstin,
        pan_number=req.pan_number,
        trade_license=req.trade_license,
        min_order_value=req.min_order_value or 1000,
        proof_documents=req.proof_documents or {},
        wallet_balance=0.0
    )
    db.add(new_merchant)

    user_id = f"u_vendor_{uuid.uuid4().hex[:6]}"
    new_user = User(
        id=user_id,
        email=req.email,
        phone=req.phone,
        name=req.owner_name,
        hashed_password=get_password_hash(req.password),
        role=UserRole.VENDOR,
        merchant_id=merchant_id,
        is_active=True,
        is_verified=False,
        proof_documents=req.proof_documents or {}
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    logger.info("Vendor onboarded awaiting approval: user_id=%s, merchant_id=%s", user_id, merchant_id)
    return ApiResponse(
        data=OnboardingResponse(
            user_id=new_user.id,
            status="pending_approval",
            role=new_user.role,
            email=new_user.email,
            message="Merchant application submitted successfully. Awaiting administrative review."
        ),
        message="Merchant application submitted successfully. Your account is pending administrative review. You will receive an email once approved."
    )


@router.post("/onboard/driver", response_model=ApiResponse[OnboardingResponse])
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def onboard_driver(
    request: Request,
    req: DriverOnboardingRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(or_(User.email == req.email, User.phone == req.phone))
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A driver with this email or phone is already registered."
        )

    user_id = f"u_driver_{uuid.uuid4().hex[:6]}"
    new_user = User(
        id=user_id,
        email=req.email,
        phone=req.phone,
        name=req.name,
        hashed_password=get_password_hash(req.password),
        role=UserRole.DRIVER,
        vehicle_type=req.vehicle_type,
        vehicle_reg_number=req.vehicle_reg_number,
        payload_capacity_tons=req.payload_capacity_tons or 2.5,
        driver_license=req.driver_license,
        is_active=True,
        is_verified=False,
        proof_documents=req.proof_documents or {}
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    logger.info("Driver onboarded awaiting approval: user_id=%s, vehicle=%s", user_id, req.vehicle_type)
    return ApiResponse(
        data=OnboardingResponse(
            user_id=new_user.id,
            status="pending_approval",
            role=new_user.role,
            email=new_user.email,
            message="Driver application submitted successfully. Awaiting administrative review."
        ),
        message="Driver application submitted successfully. Your account is pending administrative review. You will receive an email once approved."
    )


@router.post("/upload-proof", response_model=ApiResponse[dict])
@limiter.limit("20/minute")
async def upload_onboarding_proof(
    request: Request,
    file: UploadFile = File(...)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    allowed_extensions = {".png", ".jpg", ".jpeg", ".webp", ".pdf"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: JPEG, PNG, WEBP, PDF"
        )

    max_size = 10 * 1024 * 1024
    content = await file.read(max_size + 1)
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB")

    clean_base = re.sub(r"[^a-zA-Z0-9_\-]", "_", os.path.splitext(file.filename)[0])[:30]
    unique_filename = f"proof_{clean_base}_{uuid.uuid4().hex[:8]}{ext}"
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    url = f"/uploads/{unique_filename}"
    return ApiResponse(
        data={"url": url, "filename": unique_filename},
        message="Proof document uploaded successfully"
    )


@router.get("/me", response_model=ApiResponse[UserResponse])
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return ApiResponse(
        data=UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            phone=current_user.phone,
            role=current_user.role,
            is_verified=current_user.is_verified,
            saved_addresses=current_user.saved_addresses or [],
            merchant_id=current_user.merchant_id,
            proof_documents=current_user.proof_documents or {}
        )
    )
