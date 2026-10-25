from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.delivery import TripStatus


class DriverFeedCompositeResponse(BaseModel):
    driverId: str
    driverName: str
    vehicleType: str
    isOnline: bool
    todayEarnings: float
    todayTripsCount: int
    activeTrip: Optional[Dict[str, Any]] = None
    availableTrips: List[Dict[str, Any]] = []
    weeklyPayoutSummary: Dict[str, Any]


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
