"""Maps and GPS Service for MaterialHub.

Handles GPS tracking, route calculation, and distance estimation using Google Maps API.
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from app.core.config import settings

logger = logging.getLogger(__name__)


class MapsService:
    """Service for maps and GPS functionality."""

    def __init__(self):
        self.client = None

        if settings.GOOGLE_MAPS_API_KEY:
            try:
                import googlemaps
                self.client = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
                logger.info("Google Maps client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Google Maps client: {e}")
        else:
            logger.warning("Google Maps API key not configured. Maps features will use simulation mode.")

    async def calculate_distance(
        self,
        origin: str,
        destination: str,
        mode: str = "driving"
    ) -> Dict[str, Any]:
        """Calculate distance and duration between two locations.

        Args:
            origin: Origin address or coordinates (lat,lng)
            destination: Destination address or coordinates (lat,lng)
            mode: Travel mode (driving, walking, bicycling, transit)

        Returns:
            Dict with distance (km), duration (minutes), and route info
        """
        if not self.client:
            logger.info(f"[SIMULATION] Calculating distance from {origin} to {destination}")
            return {
                "distance_km": 5.0,
                "duration_minutes": 15,
                "polyline": "simulated_polyline",
                "simulated": True
            }

        try:
            result = self.client.distance_matrix(
                origins=[origin],
                destinations=[destination],
                mode=mode,
                units="metric"
            )

            if result["status"] != "OK":
                logger.error(f"Distance calculation failed: {result.get('error_message', 'Unknown error')}")
                raise Exception("Distance calculation failed")

            element = result["rows"][0]["elements"][0]
            distance_km = element["distance"]["value"] / 1000
            duration_minutes = element["duration"]["value"] / 60

            logger.info(f"Distance calculated: {distance_km:.2f} km, {duration_minutes:.1f} minutes")

            return {
                "distance_km": distance_km,
                "duration_minutes": duration_minutes,
                "polyline": None,
                "simulated": False
            }

        except Exception as e:
            logger.error(f"Failed to calculate distance: {e}")
            raise

    async def get_directions(
        self,
        origin: str,
        destination: str,
        waypoints: Optional[List[str]] = None,
        mode: str = "driving"
    ) -> Dict[str, Any]:
        """Get detailed directions between locations.

        Args:
            origin: Origin address or coordinates
            destination: Destination address or coordinates
            waypoints: Optional list of intermediate waypoints
            mode: Travel mode

        Returns:
            Dict with route steps, polyline, and summary
        """
        if not self.client:
            logger.info(f"[SIMULATION] Getting directions from {origin} to {destination}")
            return {
                "steps": [],
                "polyline": "simulated_polyline",
                "total_distance_km": 5.0,
                "total_duration_minutes": 15,
                "simulated": True
            }

        try:
            result = self.client.directions(
                origin=origin,
                destination=destination,
                waypoints=waypoints,
                mode=mode,
                units="metric"
            )

            if not result or result[0]["status"] != "OK":
                logger.error(f"Directions request failed")
                raise Exception("Directions calculation failed")

            route = result[0]
            steps = []
            total_distance = 0
            total_duration = 0

            for leg in route["legs"]:
                total_distance += leg["distance"]["value"] / 1000
                total_duration += leg["duration"]["value"] / 60

                for step in leg["steps"]:
                    steps.append({
                        "instruction": step["html_instructions"],
                        "distance_km": step["distance"]["value"] / 1000,
                        "duration_minutes": step["duration"]["value"] / 60,
                        "start_location": step["start_location"],
                        "end_location": step["end_location"]
                    })

            logger.info(f"Directions retrieved: {len(steps)} steps, {total_distance:.2f} km, {total_duration:.1f} minutes")

            return {
                "steps": steps,
                "polyline": route["overview_polyline"]["points"],
                "total_distance_km": total_distance,
                "total_duration_minutes": total_duration,
                "simulated": False
            }

        except Exception as e:
            logger.error(f"Failed to get directions: {e}")
            raise

    async def geocode_address(self, address: str) -> Dict[str, Any]:
        """Convert address to coordinates.

        Args:
            address: Address string

        Returns:
            Dict with lat, lng, and formatted address
        """
        if not self.client:
            logger.info(f"[SIMULATION] Geocoding address: {address}")
            return {
                "lat": 10.0159,
                "lng": 76.3419,
                "formatted_address": address,
                "simulated": True
            }

        try:
            result = self.client.geocode(address)

            if not result:
                logger.error(f"Geocoding failed for address: {address}")
                raise Exception("Address not found")

            location = result[0]["geometry"]["location"]

            logger.info(f"Address geocoded: {address} -> ({location['lat']}, {location['lng']})")

            return {
                "lat": location["lat"],
                "lng": location["lng"],
                "formatted_address": result[0]["formatted_address"],
                "simulated": False
            }

        except Exception as e:
            logger.error(f"Failed to geocode address: {e}")
            raise

    async def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """Convert coordinates to address.

        Args:
            lat: Latitude
            lng: Longitude

        Returns:
            Dict with formatted address and components
        """
        if not self.client:
            logger.info(f"[SIMULATION] Reverse geocoding: ({lat}, {lng})")
            return {
                "formatted_address": "Simulated Address",
                "components": {},
                "simulated": True
            }

        try:
            result = self.client.reverse_geocode((lat, lng))

            if not result:
                logger.error(f"Reverse geocoding failed for coordinates: ({lat}, {lng})")
                raise Exception("Address not found")

            logger.info(f"Coordinates reverse geocoded: ({lat}, {lng}) -> {result[0]['formatted_address']}")

            return {
                "formatted_address": result[0]["formatted_address"],
                "components": result[0]["address_components"],
                "simulated": False
            }

        except Exception as e:
            logger.error(f"Failed to reverse geocode: {e}")
            raise

    async def update_driver_location(
        self,
        driver_id: str,
        lat: float,
        lng: float,
        db
    ) -> bool:
        """Update driver's current GPS location in database.

        Args:
            driver_id: Driver user ID
            lat: Latitude
            lng: Longitude
            db: Database session

        Returns:
            True if updated successfully
        """
        from sqlalchemy import update
        from app.models.delivery import DeliveryTrip

        try:
            await db.execute(
                update(DeliveryTrip)
                .where(DeliveryTrip.driver_id == driver_id)
                .values(current_gps={"lat": lat, "lng": lng, "updated_at": datetime.now(timezone.utc).isoformat()})
            )
            await db.commit()

            logger.info(f"Driver location updated: driver_id={driver_id}, lat={lat}, lng={lng}")
            return True

        except Exception as e:
            logger.error(f"Failed to update driver location: {e}")
            await db.rollback()
            return False

    async def get_nearby_drivers(
        self,
        lat: float,
        lng: float,
        db,
        radius_km: float = 10.0
    ) -> List[Dict[str, Any]]:
        """Find nearby drivers within a radius.

        Args:
            lat: Center latitude
            lng: Center longitude
            radius_km: Search radius in kilometers
            db: Database session

        Returns:
            List of nearby drivers with their current location
        """
        from sqlalchemy import select
        from app.models.delivery import DeliveryTrip
        from app.models.user import User, UserRole

        try:
            result = await db.execute(
                select(DeliveryTrip, User)
                .join(User, DeliveryTrip.driver_id == User.id)
                .where(User.role == UserRole.DRIVER)
            )

            nearby_drivers = []
            for trip, user in result.all():
                if trip.current_gps and "lat" in trip.current_gps and "lng" in trip.current_gps:
                    driver_lat = trip.current_gps["lat"]
                    driver_lng = trip.current_gps["lng"]

                    distance = self._haversine_distance(lat, lng, driver_lat, driver_lng)

                    if distance <= radius_km:
                        nearby_drivers.append({
                            "driver_id": user.id,
                            "driver_name": user.name,
                            "vehicle_type": trip.vehicle_type,
                            "current_location": {"lat": driver_lat, "lng": driver_lng},
                            "distance_km": distance,
                            "trip_id": trip.id
                        })

            nearby_drivers.sort(key=lambda x: x["distance_km"])

            logger.info(f"Found {len(nearby_drivers)} nearby drivers within {radius_km} km")
            return nearby_drivers

        except Exception as e:
            logger.error(f"Failed to find nearby drivers: {e}")
            return []

    def _haversine_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates using Haversine formula.

        Args:
            lat1, lng1: First coordinate
            lat2, lng2: Second coordinate

        Returns:
            Distance in kilometers
        """
        from math import radians, cos, sin, asin, sqrt

        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])

        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
        c = 2 * asin(sqrt(a))

        r = 6371

        return c * r


maps_service = MapsService()
