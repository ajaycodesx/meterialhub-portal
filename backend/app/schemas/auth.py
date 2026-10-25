from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict
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
    password: str
    role: UserRole = UserRole.BUYER
    site_address: Optional[str] = None
    pincode: Optional[str] = None


class VendorOnboardingRequest(BaseModel):
    owner_name: str
    store_name: str
    email: EmailStr
    phone: str
    password: str
    address: str
    pincode: str
    main_category: Optional[str] = "All Hardware & Building Materials"
    gstin: Optional[str] = "32AAACH7409R1ZZ"


class DriverOnboardingRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    vehicle_type: str
    driver_license: str
    vehicle_reg_number: Optional[str] = None


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

    model_config = ConfigDict(from_attributes=True)
