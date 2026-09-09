"""Cyclone AI API: live tropical-cyclone observations + forecast adapters.

The API prefers the trained track model when a model artifact is available. Until
that artifact is trained, it falls back to a transparent persistence/advection
baseline. This avoids presenting a fake ML forecast as a real model.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ml.track_predictor import available as track_model_available, forecast as predict_track_step

IBTRACS_ACTIVE_URL = (
    "https://www.ncei.noaa.gov/data/international-best-track-archive-for-"
    "climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.active.list.v04r01.csv"
)
ACTIVE_CACHE_TTL = timedelta(minutes=10)
_active_cache: tuple[datetime, pd.DataFrame] | None = None

app = FastAPI(title="Cyclone AI Forecast API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _num(value: Any) -> float | None:
    try:
        result = float(value)
        return None if pd.isna(result) else result
    except (TypeError, ValueError):
        return None


def _wind(row: pd.Series) -> float:
    value = _num(row.get("WMO_WIND"))
    if value is None:
        value = _num(row.get("USA_WIND"))
    return round(value * 1.852, 1) if value is not None else 0.0


def _pressure(row: pd.Series) -> float | None:
    value = _num(row.get("WMO_PRES"))
    if value is None:
        value = _num(row.get("USA_PRES"))
    return round(value, 1) if value is not None else None


def _classification(wind_kph: float) -> str:
    if wind_kph < 31:
        return "Low Pressure Area"
    if wind_kph < 50:
        return "Depression"
    if wind_kph < 62:
        return "Deep Depression"
    if wind_kph < 89:
        return "Cyclonic Storm"
    if wind_kph < 118:
        return "Severe Cyclonic Storm"
    if wind_kph < 166:
        return "Very Severe Cyclonic Storm"
    return "Extremely Severe Cyclonic Storm"


def _load_active(force: bool = False) -> pd.DataFrame:
    """Load NOAA's active feed with a short in-process cache.

    IBTrACS is updated periodically, so repeatedly downloading the CSV for every
    dashboard request adds latency and creates unnecessary upstream load.
    """
    global _active_cache
    now = datetime.now(timezone.utc)
    if not force and _active_cache and now - _active_cache[0] < ACTIVE_CACHE_TTL:
        return _active_cache[1].copy()

    try:
        frame = pd.read_csv(IBTRACS_ACTIVE_URL, skiprows=[1], low_memory=False)
    except Exception as exc:
        if _active_cache:
            return _active_cache[1].copy()
        raise HTTPException(status_code=503, detail=f"Unable to load NOAA IBTrACS feed: {exc}") from exc

    frame["ISO_TIME"] = pd.to_datetime(frame["ISO_TIME"], errors="coerce", utc=True)
    frame["LAT"] = pd.to_numeric(frame["LAT"], errors="coerce")
    frame["LON"] = pd.to_numeric(frame["LON"], errors="coerce")
    frame = frame.dropna(subset=["SID", "ISO_TIME", "LAT", "LON"])
    _active_cache = (now, frame.copy())
    return frame


def _systems(frame: pd.DataFrame) -> list[dict[str, Any]]:
    systems: list[dict[str, Any]] = []
    for sid, group in frame.groupby("SID", sort=False):
        group = group.sort_values("ISO_TIME")
        last = group.iloc[-1]
        wind = _wind(last)
        pressure = _pressure(last)
        systems.append({
            "id": str(sid),
            "name": str(last.get("NAME") or sid),
            "lat": round(float(last["LAT"]), 2),
            "lon": round(float(last["LON"]), 2),
            "status": "ACTIVE",
            "riskLevel": "HIGH" if wind >= 89 else "MODERATE" if wind >= 50 else "LOW",
            "genesisProbability": None,
            "confidence": None,
            "classification": _classification(wind),
            "windSpeed": wind,
            "pressure": pressure or 0,
            "movement": "Computed from latest observations",
            "expectedLandfall": "Not estimated by current model",
            "pattern": "Observed tropical system",
            "basin": str(last.get("BASIN") or "Unknown"),
            "observedAt": last["ISO_TIME"].isoformat(),
            "source": "NOAA IBTrACS v04r01",
        })
    return sorted(systems, key=lambda item: item["windSpeed"], reverse=True)


def _forecast_track(group: pd.DataFrame) -> list[dict[str, Any]]:
    group = group.sort_values("ISO_TIME").dropna(subset=["LAT", "LON"])
    last = group.iloc[-1]
    previous = group.iloc[-2] if len(group) > 1 else last
    lat, lon = float(last["LAT"]), float(last["LON"])
    dlat, dlon = lat - float(previous["LAT"]), lon - float(previous["LON"])
    wind = _wind(last)
    pressure = _pressure(last) or 0.0
    points = [{
        "time": "NOW", "hours": 0, "lat": lat, "lon": lon, "uncertainty": 0,
        "windSpeed": wind, "pressure": pressure, "intensity": _classification(wind),
    }]

    model_available = track_model_available()
    current_time = pd.Timestamp(last["ISO_TIME"])
    for hours in (6, 12, 24, 36, 48):
        if model_available:
            try:
                prediction = predict_track_step(lat, lon, dlat, dlon, wind / 1.852, pressure, current_time)
                next_dlat, next_dlon = prediction["dlat"], prediction["dlon"]
                error = max(20.0, prediction["errorKm"] * (hours / 6) ** 0.5)
            except Exception:
                model_available = False
        if not model_available:
            next_dlat, next_dlon = dlat, dlon
            error = 40 + hours * 4.5
        lat += next_dlat
        lon += next_dlon
        dlat, dlon = next_dlat, next_dlon
        points.append({
            "time": f"+{hours}h", "hours": hours,
            "lat": round(lat, 3), "lon": round(lon, 3), "uncertainty": round(error),
            "windSpeed": wind, "pressure": pressure, "intensity": _classification(wind),
        })
    return points


def _scenario(frame: pd.DataFrame) -> dict[str, Any]:
    systems = _systems(frame)
    if not systems:
        raise HTTPException(status_code=503, detail="No active systems in IBTrACS feed")
    primary = systems[0]
    group = frame[frame["SID"].astype(str) == primary["id"]]
    track = _forecast_track(group)
    intensity = [{
        "time": p["time"], "hours": p["hours"], "windSpeed": p["windSpeed"],
        "pressure": p["pressure"], "category": p["intensity"],
    } for p in track]
    model_name = "IBTrACS-trained gradient boosting track model" if track_model_available() else "Observed-track persistence/advection baseline"
    return {
        "key": "live",
        "label": "LIVE",
        "description": "NOAA IBTrACS observation-backed forecast",
        "cyclone": primary,
        "genesisTrend": [],
        "intensityForecast": intensity,
        "track": track,
        "alerts": [],
        "systems": systems,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "dataQuality": {
            "source": "NOAA IBTrACS v04r01",
            "cacheTtlMinutes": int(ACTIVE_CACHE_TTL.total_seconds() / 60),
            "model": model_name,
        },
        "model": {"name": model_name, "version": "0.3.0", "isML": track_model_available()},
    }


@app.get("/health")
def health() -> dict[str, Any]:
    cache_age = None
    if _active_cache:
        cache_age = round((datetime.now(timezone.utc) - _active_cache[0]).total_seconds())
    return {
        "status": "ok",
        "service": "cyclone-ai-api",
        "trackModelAvailable": track_model_available(),
        "activeFeedCached": _active_cache is not None,
        "activeFeedCacheAgeSeconds": cache_age,
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/v1/systems")
def get_systems() -> dict[str, Any]:
    frame = _load_active()
    return {"systems": _systems(frame), "source": "NOAA IBTrACS v04r01"}


@app.get("/v1/live-scenario")
def get_live_scenario() -> dict[str, Any]:
    return _scenario(_load_active())


@app.get("/v1/systems/{system_id}/track")
def get_track(system_id: str) -> dict[str, Any]:
    frame = _load_active()
    group = frame[frame["SID"].astype(str) == system_id]
    if group.empty:
        raise HTTPException(status_code=404, detail="System not found")
    return {
        "systemId": system_id,
        "track": _forecast_track(group),
        "model": "trained-track-model-or-baseline",
    }
