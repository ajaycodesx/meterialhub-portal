from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.delivery import TripStatus


class DriverFeedCompositeResponse(BaseModel):
    driverId: str
    driverName: str
    vehicleType: str
    vehicleRegNumber: Optional[str] = None
    isOnline: bool
    todayEarnings: float
    todayTripsCount: int
    activeTrip: Optional[Dict[str, Any]] = None
    availableTrips: List[Dict[str, Any]] = []
    weeklyPayoutSummary: Dict[str, Any]


class DriverProfileResponse(BaseModel):
    driverId: str
    name: str
    phone: str
    email: Optional[str] = None
    isOnline: bool
    isVerified: bool
    licenseNumberMasked: str
    licenseExpiry: str
    vehicleType: str
    vehicleRegNumber: str
    payloadCapacityTons: float
    permitStatus: str
    insuranceExpiry: str
    fitnessExpiry: str
    bankName: str
    bankAccountMasked: str
    ifsc: str
    rating: float
    completedTripsLifetime: int


class DriverProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    vehicleType: Optional[str] = None
    vehicleRegNumber: Optional[str] = None
    payloadCapacityTons: Optional[float] = None


class DriverTripHistoryItem(BaseModel):
    tripId: str
    orderId: str
    pickupAddress: str
    dropAddress: str
    distanceKm: float
    tripFare: float
    tipAmount: float
    totalEarned: float
    status: str
    completedAt: Optional[str] = None
    vehicleType: Optional[str] = None


class DriverExceptionReportRequest(BaseModel):
    tripId: str
    exceptionType: str
    description: str
    photoEvidenceUrl: Optional[str] = None


class DriverLocationUpdateRequest(BaseModel):
    tripId: Optional[str] = None
    latitude: float
    longitude: float
    speedKmh: Optional[float] = None
    heading: Optional[float] = None


class UpdateTripStatusRequest(BaseModel):
    tripId: str
    status: TripStatus
    currentLat: Optional[float] = None
    currentLng: Optional[float] = None


class DeliveryOtpRequest(BaseModel):
    tripId: str


class VerifyDeliveryOtpRequest(BaseModel):
    tripId: str
    otp: str
