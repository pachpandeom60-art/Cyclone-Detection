from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ARTIFACT = Path(__file__).resolve().parents[1] / "artifacts" / "track_model.joblib"


def available() -> bool:
    return ARTIFACT.exists()


def forecast(lat: float, lon: float, dlat3: float, dlon3: float, wind_kt: float, pressure: float | None, start_time: pd.Timestamp) -> dict:
    if not available():
        raise FileNotFoundError(str(ARTIFACT))
    artifact = joblib.load(ARTIFACT)
    model = artifact["model"]
    features = artifact["features"]
    current = np.array([[lat, lon, dlat3, dlon3, wind_kt, pressure or 0.0, start_time.month, start_time.hour]])
    step = model.predict(pd.DataFrame(current, columns=features))[0]
    return {"dlat": float(step[0]), "dlon": float(step[1]), "errorKm": float(artifact["mean_error_km"])}
