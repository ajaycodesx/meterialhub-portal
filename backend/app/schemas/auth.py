from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    phone: str
    role: UserRole


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class LoginRequest(BaseModel):
    phone_or_email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.BUYER
    site_address: Optional[str] = None
    pincode: Optional[str] = None


class VendorOnboardingRequest(BaseModel):
    owner_name: str
    store_name: str
    email: EmailStr
    phone: str
    password: str = Field(min_length=8, max_length=128)
    address: str
    pincode: str
    city: Optional[str] = "Kochi"
    main_category: Optional[str] = "All Hardware & Building Materials"
    gstin: str
    pan_number: Optional[str] = None
    trade_license: Optional[str] = None
    min_order_value: Optional[int] = 1000
    proof_documents: Optional[Dict[str, Any]] = None


class DriverOnboardingRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str = Field(min_length=8, max_length=128)
    vehicle_type: str
    vehicle_reg_number: str
    payload_capacity_tons: Optional[float] = 2.5
    driver_license: str
    license_expiry: Optional[str] = None
    city: Optional[str] = "Kochi"
    proof_documents: Optional[Dict[str, Any]] = None


class OnboardingResponse(BaseModel):
    user_id: str
    status: str = "pending_approval"
    role: UserRole
    email: str
    message: str


class AddressItem(BaseModel):
    id: str
    label: str
    address: str
    pincode: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: UserRole
    is_verified: bool
    saved_addresses: List[Dict[str, Any]] = []
    merchant_id: Optional[str] = None
    proof_documents: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
