"""
Cyclone Intelligence & Genesis Prediction Backend API.

FastAPI web service serving machine learning inference, ERA5/IBTrACS data ingestion,
spatial heatmap generation, and real-time model telemetry.
"""

import os
import sys
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Ensure local modules are resolvable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ingestion.ibtracs import IBTrACSIngestion
from ingestion.era5 import ERA5Ingestion
from ml.genesis_predictor import GenesisPredictor
from ml.vision_detector import SatelliteEyeDetector
from ml.track_predictor import TrackPredictor
from ml.intensity_predictor import IntensityPredictor
from ml.train_genesis import train_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CycloneBackend")

app = FastAPI(
    title="Cyclone AI Backend API",
    description="Backend API service for Cyclone Genesis Prediction, Computer Vision Eye Detection, Track Trajectory & Intensity Forecasting.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictor and Ingestion engines lazily / at startup
predictor: Optional[GenesisPredictor] = None
vision_detector: Optional[SatelliteEyeDetector] = None
track_predictor: Optional[TrackPredictor] = None
intensity_predictor: Optional[IntensityPredictor] = None
ibtracs_engine: Optional[IBTrACSIngestion] = None
era5_engine: Optional[ERA5Ingestion] = None


@app.on_event("startup")
def startup_event():
    global predictor, vision_detector, track_predictor, intensity_predictor, ibtracs_engine, era5_engine
    logger.info("Initializing Cyclone AI Backend components...")
    ibtracs_engine = IBTrACSIngestion()
    era5_engine = ERA5Ingestion()
    predictor = GenesisPredictor()
    vision_detector = SatelliteEyeDetector()
    track_predictor = TrackPredictor()
    intensity_predictor = IntensityPredictor()
    logger.info("Backend components successfully initialized.")


# Pydantic Schemas
class GenesisPredictionRequest(BaseModel):
    latitude: float = Field(14.5, ge=-90.0, le=90.0, description="Latitude degree (-90 to 90)")
    longitude: float = Field(87.5, ge=-180.0, le=180.0, description="Longitude degree (-180 to 180)")
    sst_celsius: Optional[float] = Field(None, description="Sea Surface Temperature (°C)")
    vws_knots: Optional[float] = Field(None, description="850-200 hPa Vertical Wind Shear (kts)")
    relative_vorticity_850: Optional[float] = Field(None, description="Relative Vorticity at 850hPa (10^-5 s^-1)")
    rh_700_percent: Optional[float] = Field(None, description="Relative Humidity at 700hPa (%)")
    ocean_heat_content: Optional[float] = Field(None, description="Ocean Heat Content (kJ/cm^2)")
    sea_level_pressure: Optional[float] = Field(None, description="Sea Level Pressure (hPa)")
    dist_to_land_km: Optional[float] = Field(None, description="Distance to nearest coastline (km)")


class HeatmapRequest(BaseModel):
    lat_min: float = Field(5.0, description="Minimum latitude bound")
    lat_max: float = Field(25.0, description="Maximum latitude bound")
    lon_min: float = Field(60.0, description="Minimum longitude bound")
    lon_max: float = Field(95.0, description="Maximum longitude bound")
    resolution: float = Field(2.0, description="Grid step size in degrees")


class TrackPredictionRequest(BaseModel):
    start_lat: float = Field(14.5, description="Initial storm latitude")
    start_lon: float = Field(87.5, description="Initial storm longitude")
    current_wind_kts: Optional[float] = Field(65.0, description="Current max sustained wind speed in knots")
    heading_deg: Optional[float] = Field(320.0, description="Storm trajectory heading direction in degrees (0-360)")
    speed_kts: Optional[float] = Field(12.0, description="Forward translation speed in knots")


class IntensityPredictionRequest(BaseModel):
    current_wind_kts: float = Field(65.0, description="Current max sustained wind speed in knots")
    current_pres_hpa: float = Field(985.0, description="Current central barometric pressure in hPa")
    sst_celsius: Optional[float] = Field(29.5, description="Sea surface temperature in °C")
    vws_knots: Optional[float] = Field(8.5, description="850-200 hPa vertical wind shear in knots")


# Routes
@app.get("/")
def read_root():
    return {
        "service": "Cyclone AI Backend API",
        "status": "ONLINE",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def get_health():
    model_loaded = predictor is not None and predictor.model is not None
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "model_type": predictor.metrics.get("model_type", "Unknown") if predictor else None,
        "roc_auc_accuracy": predictor.metrics.get("roc_auc", None) if predictor else None
    }


@app.post("/api/predict/genesis")
def predict_genesis(req: GenesisPredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Predictor service not initialized")
    try:
        data = req.dict(exclude_none=True)
        result = predictor.predict(data)
        return result
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/satellite-eye")
async def detect_satellite_eye(file: UploadFile = File(...)):
    if vision_detector is None:
        raise HTTPException(status_code=503, detail="Vision detector service not initialized")
    try:
        content = await file.read()
        analysis = vision_detector.analyze_image_bytes(content)
        return analysis
    except Exception as e:
        logger.error(f"Satellite eye detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/track")
def predict_track(req: TrackPredictionRequest):
    if track_predictor is None:
        raise HTTPException(status_code=503, detail="Track predictor service not initialized")
    try:
        result = track_predictor.predict_track(
            start_lat=req.start_lat,
            start_lon=req.start_lon,
            current_wind_kts=req.current_wind_kts or 65.0,
            heading_deg=req.heading_deg or 320.0,
            speed_kts=req.speed_kts or 12.0
        )
        return result
    except Exception as e:
        logger.error(f"Track prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/intensity")
def predict_intensity(req: IntensityPredictionRequest):
    if intensity_predictor is None:
        raise HTTPException(status_code=503, detail="Intensity predictor service not initialized")
    try:
        result = intensity_predictor.predict_intensity(
            current_wind_kts=req.current_wind_kts,
            current_pres_hpa=req.current_pres_hpa,
            sst_celsius=req.sst_celsius or 29.5,
            vws_knots=req.vws_knots or 8.5
        )
        return result
    except Exception as e:
        logger.error(f"Intensity prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/genesis/heatmap")
def get_heatmap(
    lat_min: float = Query(5.0, ge=-90.0, le=90.0),
    lat_max: float = Query(25.0, ge=-90.0, le=90.0),
    lon_min: float = Query(60.0, ge=-180.0, le=180.0),
    lon_max: float = Query(95.0, ge=-180.0, le=180.0),
    resolution: float = Query(2.5, ge=0.5, le=10.0)
):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Predictor service not initialized")
    try:
        grid_data = predictor.predict_spatial_grid(
            lat_min=lat_min,
            lat_max=lat_max,
            lon_min=lon_min,
            lon_max=lon_max,
            resolution=resolution
        )
        return {
            "count": len(grid_data),
            "bounds": {
                "lat_min": lat_min, "lat_max": lat_max,
                "lon_min": lon_min, "lon_max": lon_max,
                "resolution": resolution
            },
            "grid": grid_data
        }
    except Exception as e:
        logger.error(f"Heatmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/genesis/heatmap")
def post_heatmap(req: HeatmapRequest):
    return get_heatmap(
        lat_min=req.lat_min,
        lat_max=req.lat_max,
        lon_min=req.lon_min,
        lon_max=req.lon_max,
        resolution=req.resolution
    )


@app.post("/api/ingest/ibtracs")
def trigger_ibtracs_ingestion(background_tasks: BackgroundTasks, basin: str = "NI"):
    if ibtracs_engine is None:
        raise HTTPException(status_code=503, detail="Ingestion engine not ready")

    def run_ingest():
        raw_p = ibtracs_engine.fetch_raw_data(basin=basin)
        ibtracs_engine.process_raw_data(raw_p)

    background_tasks.add_task(run_ingest)
    return {"message": f"IBTrACS ingestion triggered for basin {basin} in background."}


@app.post("/api/ingest/era5")
def trigger_era5_ingestion(background_tasks: BackgroundTasks):
    if era5_engine is None:
        raise HTTPException(status_code=503, detail="ERA5 engine not ready")

    def run_ingest():
        era5_engine.fetch_grid_snapshot(resolution=2.0)

    background_tasks.add_task(run_ingest)
    return {"message": "ERA5 grid snapshot update triggered in background."}


@app.post("/api/ml/train")
def trigger_training(background_tasks: BackgroundTasks):
    def run_train():
        global predictor
        train_model()
        if predictor:
            predictor.load_or_train()

    background_tasks.add_task(run_train)
    return {"message": "Model retraining job scheduled in background."}


@app.get("/api/ml/metrics")
def get_model_metrics():
    if predictor is None or not predictor.metrics:
        raise HTTPException(status_code=404, detail="No model metrics available")
    return predictor.metrics


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
