"""
Ensemble Cyclone Track Trajectory & Cone of Uncertainty Predictor.

Forecasts 72-hour cyclone trajectory waypoints, Beta Drift deflection,
expanding uncertainty cone geometry, and coastal landfall predictions.
"""

import math
import logging
from typing import Dict, Any, List, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TrackPredictor")


class TrackPredictor:
    """
    Trajectory forecasting engine using numerical steering currents & Beta Drift dynamics.
    """

    def __init__(self):
        # Landfall coastline polygon proxies (North Indian Ocean)
        self.coastlines = [
            {"name": "Odisha / West Bengal Coast", "lat_range": (19.5, 22.0), "lon_range": (85.0, 89.0)},
            {"name": "Bangladesh Sundarbans", "lat_range": (21.5, 23.0), "lon_range": (89.0, 92.5)},
            {"name": "Andhra Pradesh Coast", "lat_range": (14.0, 19.5), "lon_range": (80.0, 85.0)},
            {"name": "Gujarat / Saurashtra Coast", "lat_range": (20.5, 23.5), "lon_range": (68.0, 72.5)},
        ]

    def predict_track(
        self,
        start_lat: float,
        start_lon: float,
        current_wind_kts: float = 65.0,
        heading_deg: float = 320.0,
        speed_kts: float = 12.0
    ) -> Dict[str, Any]:
        """
        Calculates 72-hour forecast trajectory waypoints and cone of uncertainty.
        """
        hours = [0, 6, 12, 18, 24, 36, 48, 72]
        waypoints = []
        cone_bounds = []
        landfall_info = None

        cur_lat = start_lat
        cur_lon = start_lon
        heading_rad = math.radians(heading_deg)

        for t in hours:
            if t > 0:
                dt = 6 if t <= 24 else (12 if t <= 48 else 24)
                # Beta Drift effect: Deflection towards North-West due to Earth rotation gradient
                beta_lat = 0.05 * (t / 12.0)
                beta_lon = -0.04 * (t / 12.0)

                # Distance traveled in nautical miles (1 nm ≈ 1/60 degree lat)
                dist_nm = speed_kts * dt
                d_lat = (dist_nm * math.cos(heading_rad)) / 60.0 + beta_lat
                d_lon = (dist_nm * math.sin(heading_rad)) / (60.0 * math.cos(math.radians(cur_lat))) + beta_lon

                cur_lat += d_lat
                cur_lon += d_lon

            # Cone radius expands with forecast lead time (km)
            cone_radius_km = round(25.0 + 1.1 * t, 1)

            # Check landfall intersection
            if landfall_info is None:
                for coast in self.coastlines:
                    if (coast["lat_range"][0] <= cur_lat <= coast["lat_range"][1] and
                            coast["lon_range"][0] <= cur_lon <= coast["lon_range"][1]):
                        landfall_info = {
                            "location": coast["name"],
                            "forecast_time_hours": t,
                            "estimated_lat": round(cur_lat, 2),
                            "estimated_lon": round(cur_lon, 2)
                        }

            waypoints.append({
                "time_hour": t,
                "label": f"T+{t:02d}H",
                "latitude": round(cur_lat, 3),
                "longitude": round(cur_lon, 3),
                "cone_radius_km": cone_radius_km
            })

            # Calculate cone polygon left/right offset bounds
            perp_angle = heading_rad + math.pi / 2.0
            r_deg = (cone_radius_km / 111.0)
            left_lat = cur_lat + r_deg * math.cos(perp_angle)
            left_lon = cur_lon + r_deg * math.sin(perp_angle) / math.cos(math.radians(cur_lat))
            right_lat = cur_lat - r_deg * math.cos(perp_angle)
            right_lon = cur_lon - r_deg * math.sin(perp_angle) / math.cos(math.radians(cur_lat))

            cone_bounds.append({
                "time_hour": t,
                "left_lat": round(left_lat, 3),
                "left_lon": round(left_lon, 3),
                "right_lat": round(right_lat, 3),
                "right_lon": round(right_lon, 3)
            })

        return {
            "initial_position": {"lat": start_lat, "lon": start_lon},
            "forecast_heading_deg": heading_deg,
            "forward_speed_kts": speed_kts,
            "waypoints": waypoints,
            "cone_bounds": cone_bounds,
            "landfall_prediction": landfall_info or {"location": "Open Ocean (No Landfall within 72h)", "forecast_time_hours": None}
        }


if __name__ == "__main__":
    predictor = TrackPredictor()
    result = predictor.predict_track(14.5, 87.5, heading_deg=315.0, speed_kts=14.0)
    print("Track Forecast Test Result:", result["waypoints"][:4])
