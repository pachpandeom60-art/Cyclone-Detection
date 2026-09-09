"""
Genesis Feature Extraction and Index Calculations.

Calculates Emanuel-Nolan Genesis Potential Index (GPI) and extracts domain-specific
thermodynamic and kinematic feature vectors for machine learning models.
"""

import math
from typing import Dict, Any, List, Union
import numpy as np
import pandas as pd

FEATURE_NAMES = [
    "sst_celsius",
    "vws_knots",
    "relative_vorticity_850",
    "rh_700_percent",
    "ocean_heat_content",
    "sea_level_pressure",
    "dist_to_land_km",
    "coriolis_f",
    "gpi_index",
    "pressure_deficit"
]


def compute_coriolis(lat: float) -> float:
    """
    Computes Coriolis parameter f = 2 * omega * sin(lat) in 10^-4 s^-1.
    """
    omega = 7.2921e-5  # Earth rotation rate in rad/s
    f = 2 * omega * math.sin(math.radians(abs(lat)))
    return f * 1e4  # scale to 10^-4 s^-1


def compute_gpi(
    sst: float,
    shear: float,
    vorticity: float,
    humidity: float,
    lat: float
) -> float:
    """
    Computes Emanuel and Nolan (2004) Genesis Potential Index (GPI):
    GPI = |10^5 * absolute_vorticity|^1.5 * (RH / 50)^3 * (V_pot / 70)^3 * (1 + 0.1 * Shear)^-2
    """
    f = compute_coriolis(lat)  # in 10^-4 s^-1
    # Absolute vorticity eta = (f + relative_vorticity)
    abs_vorticity = max(0.1, f + vorticity)

    # Potential Intensity (V_pot) proxy based on SST (>26°C threshold)
    if sst < 26.0:
        v_pot = max(5.0, (sst - 20.0) * 2.0)
    else:
        v_pot = 40.0 + (sst - 26.0) * 12.0  # m/s

    # Terms
    vort_term = math.pow(abs_vorticity, 1.5)
    rh_term = math.pow(max(10.0, humidity) / 50.0, 3.0)
    pot_term = math.pow(v_pot / 70.0, 3.0)
    shear_term = math.pow(1.0 + 0.1 * max(0.0, shear), -2.0)

    gpi = vort_term * rh_term * pot_term * shear_term
    return round(float(gpi), 3)


class GenesisFeatureExtractor:
    """
    Feature extraction engine for Cyclone Genesis Prediction models.
    """

    def __init__(self):
        self.feature_names = FEATURE_NAMES

    def extract_dict(self, input_dict: Dict[str, Any]) -> Dict[str, float]:
        """
        Takes raw dictionary observation and enriches with calculated indices.
        """
        lat = float(input_dict.get("latitude", 12.0))
        sst = float(input_dict.get("sst_celsius", 28.5))
        shear = float(input_dict.get("vws_knots", 12.0))
        vorticity = float(input_dict.get("relative_vorticity_850", 4.0))
        humidity = float(input_dict.get("rh_700_percent", 75.0))
        ohc = float(input_dict.get("ocean_heat_content", 50.0))
        slp = float(input_dict.get("sea_level_pressure", 1006.0))
        dist_land = float(input_dict.get("dist_to_land_km", 400.0))

        f_param = compute_coriolis(lat)
        gpi = compute_gpi(sst, shear, vorticity, humidity, lat)
        pressure_deficit = max(0.0, 1013.25 - slp)

        return {
            "sst_celsius": round(sst, 2),
            "vws_knots": round(shear, 2),
            "relative_vorticity_850": round(vorticity, 2),
            "rh_700_percent": round(humidity, 2),
            "ocean_heat_content": round(ohc, 2),
            "sea_level_pressure": round(slp, 2),
            "dist_to_land_km": round(dist_land, 1),
            "coriolis_f": round(f_param, 4),
            "gpi_index": round(gpi, 3),
            "pressure_deficit": round(pressure_deficit, 2)
        }

    def transform_to_matrix(self, records: Union[List[Dict[str, Any]], pd.DataFrame]) -> np.ndarray:
        """
        Converts array of observation records or DataFrame into a 2D numpy array [N, num_features].
        """
        if isinstance(records, pd.DataFrame):
            dict_list = records.to_dict(orient="records")
        else:
            dict_list = records

        feature_rows = []
        for rec in dict_list:
            feats = self.extract_dict(rec)
            row = [feats[name] for name in self.feature_names]
            feature_rows.append(row)

        return np.array(feature_rows, dtype=np.float32)


if __name__ == "__main__":
    extractor = GenesisFeatureExtractor()
    sample_obs = {
        "latitude": 14.5,
        "longitude": 87.2,
        "sst_celsius": 29.8,
        "vws_knots": 8.5,
        "relative_vorticity_850": 6.2,
        "rh_700_percent": 82.0,
        "ocean_heat_content": 75.0,
        "sea_level_pressure": 1002.5,
        "dist_to_land_km": 520.0
    }
    features = extractor.extract_dict(sample_obs)
    print("Extracted Genesis Features:", features)
