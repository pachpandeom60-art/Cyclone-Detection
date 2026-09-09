"""
ERA5 ECMWF Atmospheric & Ocean Reanalysis Data Ingestion Module.

Provides thermodynamic and kinematic environmental data (SST, Wind Shear, Vorticity, Humidity)
required for Cyclone Genesis Potential calculation.
"""

import os
import json
import logging
import math
from typing import Dict, Any, List, Tuple
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ERA5Ingestion")


class ERA5Ingestion:
    """
    Ingest or simulate ERA5 ECMWF ocean-atmosphere reanalysis grids for cyclone prediction.
    """

    def __init__(self, base_dir: str = None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.cache_dir = os.path.join(base_dir, "data", "cache")
        os.makedirs(self.cache_dir, exist_ok=True)

    def sample_point_environment(self, lat: float, lon: float) -> Dict[str, float]:
        """
        Samples atmospheric and oceanic environmental parameters for a given lat/lon coordinate.
        Calculates realistic spatial variation based on North Indian Ocean climatology.
        """
        np.random.seed(int(abs(lat * 100 + lon * 10)) % 100000)

        # Baseline SST: Warmer in Bay of Bengal (80-92°E) and Equatorial waters (5-15°N)
        base_sst = 28.5 + 1.8 * math.cos(math.radians((lat - 12) * 4)) + 0.8 * math.sin(math.radians((lon - 70) * 3))
        sst = max(24.5, min(31.5, base_sst + np.random.normal(0, 0.4)))

        # Vertical Wind Shear (850 - 200 hPa): Favorable genesis zone < 15 knots (typically 5-18 kts in summer/post-monsoon)
        base_shear = 12.0 + 6.0 * math.sin(math.radians((lat - 15) * 5)) + 4.0 * math.cos(math.radians(lon))
        vws_kts = max(4.0, min(35.0, base_shear + np.random.normal(0, 2.0)))

        # Relative Vorticity at 850 hPa (x10^-5 s^-1): Cyclonic positive in Northern Hemisphere
        vorticity = 3.5 + 4.0 * max(0.0, math.sin(math.radians(lat * 6))) + np.random.normal(0, 1.2)
        vorticity = max(0.1, vorticity)

        # Relative Humidity at 700 hPa (%): Moister over Bay of Bengal / Arabian Sea
        rh_700 = 65.0 + 15.0 * math.sin(math.radians(lon * 2)) + np.random.normal(0, 4.0)
        rh_700 = max(35.0, min(95.0, rh_700))

        # Ocean Heat Content (kJ/cm^2)
        ohc = max(15.0, (sst - 26.0) * 22.0 + np.random.normal(0, 8.0))

        # Sea Level Pressure (hPa)
        slp = 1008.0 - (vorticity * 0.8) + np.random.normal(0, 1.0)

        # Distance to land proxy
        dist_to_land = 450.0 + 250.0 * math.sin(math.radians(lat * 3 + lon * 2))
        dist_to_land = max(20.0, min(1200.0, dist_to_land))

        return {
            "latitude": round(lat, 2),
            "longitude": round(lon, 2),
            "sst_celsius": round(sst, 2),
            "vws_knots": round(vws_kts, 2),
            "relative_vorticity_850": round(vorticity, 2),
            "rh_700_percent": round(rh_700, 2),
            "ocean_heat_content": round(ohc, 2),
            "sea_level_pressure": round(slp, 2),
            "dist_to_land_km": round(dist_to_land, 1)
        }

    def fetch_grid_snapshot(
        self,
        lat_range: Tuple[float, float] = (5.0, 25.0),
        lon_range: Tuple[float, float] = (60.0, 95.0),
        resolution: float = 2.0
    ) -> List[Dict[str, float]]:
        """
        Generates/fetches spatial grid snapshot across specified lat/lon boundaries.
        Used for raster heatmaps on interactive GIS maps.
        """
        lats = np.arange(lat_range[0], lat_range[1] + 0.1, resolution)
        lons = np.arange(lon_range[0], lon_range[1] + 0.1, resolution)

        grid_data = []
        for lat in lats:
            for lon in lons:
                point_data = self.sample_point_environment(float(lat), float(lon))
                grid_data.append(point_data)

        # Cache snapshot
        cache_path = os.path.join(self.cache_dir, "era5_latest.json")
        try:
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(grid_data, f, indent=2)
            logger.info(f"Cached ERA5 grid snapshot with {len(grid_data)} points to {cache_path}")
        except Exception as e:
            logger.warning(f"Could not cache ERA5 grid: {e}")

        return grid_data


if __name__ == "__main__":
    era5 = ERA5Ingestion()
    sample = era5.sample_point_environment(15.0, 88.0)
    print("Sample ERA5 Point Data:", sample)
    grid = era5.fetch_grid_snapshot(resolution=5.0)
    print(f"Generated grid with {len(grid)} points.")
