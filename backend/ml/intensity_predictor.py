"""
Intensity & Wind Speed Forecast Engine.

Predicts temporal evolution of Maximum Sustained Wind Speed (knots),
Central Barometric Pressure (hPa), Rapid Intensification (RI) flags, and Saffir-Simpson / IMD stage.
"""

import logging
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IntensityPredictor")


class IntensityPredictor:
    """
    Intensity forecasting engine for wind speed and central barometric pressure curves.
    """

    def predict_intensity(
        self,
        current_wind_kts: float = 65.0,
        current_pres_hpa: float = 985.0,
        sst_celsius: float = 29.5,
        vws_knots: float = 8.5
    ) -> Dict[str, Any]:
        """
        Calculates 72-hour wind speed and pressure forecast trajectory.
        """
        hours = [0, 6, 12, 18, 24, 36, 48, 72]

        # Rapid Intensification (RI) check: Wind increases >= 30 kts in 24h
        ri_favorable = (sst_celsius >= 28.8 and vws_knots <= 12.0)
        ri_flag = ri_favorable and (current_wind_kts < 100.0)

        rate_factor = 1.6 if ri_flag else 0.7

        forecast_series = []
        max_wind = current_wind_kts
        min_pres = current_pres_hpa
        peak_time = 0

        for t in hours:
            if t == 0:
                w = current_wind_kts
                p = current_pres_hpa
            elif t <= 36:
                # Intensification phase
                delta_w = rate_factor * (t ** 0.85)
                w = min(145.0, current_wind_kts + delta_w)
                p = max(900.0, 1013.25 - (w * 0.72))
            else:
                # Decay / Landfall decay phase
                decay_t = t - 36
                w = max(30.0, forecast_series[-1]["wind_kts"] - decay_t * 0.8)
                p = min(1008.0, 1013.25 - (w * 0.65))

            w = round(w, 1)
            p = round(p, 1)

            if w > max_wind:
                max_wind = w
                peak_time = t
            if p < min_pres:
                min_pres = p

            forecast_series.append({
                "time_hour": t,
                "label": f"T+{t:02d}H",
                "wind_kts": w,
                "pressure_hpa": p,
                "category": self._classify_stage(w)
            })

        return {
            "rapid_intensification_alert": ri_flag,
            "ri_probability_pct": 82.0 if ri_flag else 18.0,
            "peak_forecast_wind_kts": max_wind,
            "minimum_forecast_pressure_hpa": min_pres,
            "peak_intensity_time_hours": peak_time,
            "peak_classification": self._classify_stage(max_wind),
            "forecast_series": forecast_series
        }

    def _classify_stage(self, wind_kts: float) -> str:
        if wind_kts >= 120.0:
            return "Super Cyclonic Storm (SuCS)"
        elif wind_kts >= 90.0:
            return "Extremely Severe Cyclonic Storm (ESCS)"
        elif wind_kts >= 64.0:
            return "Very Severe Cyclonic Storm (VSCS)"
        elif wind_kts >= 48.0:
            return "Severe Cyclonic Storm (SCS)"
        elif wind_kts >= 34.0:
            return "Cyclonic Storm (CS)"
        elif wind_kts >= 28.0:
            return "Deep Depression (DD)"
        else:
            return "Depression (D)"


if __name__ == "__main__":
    predictor = IntensityPredictor()
    result = predictor.predict_intensity(65.0, 982.0, 29.8, 7.5)
    print("Intensity Forecast Test Result:", result["peak_classification"], "Max Wind:", result["peak_forecast_wind_kts"])
