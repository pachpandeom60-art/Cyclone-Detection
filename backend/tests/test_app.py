import pandas as pd

from app import _classification, _forecast_track


def test_imd_classification_boundaries():
    assert _classification(30) == "Low Pressure Area"
    assert _classification(31) == "Depression"
    assert _classification(62) == "Cyclonic Storm"
    assert _classification(118) == "Very Severe Cyclonic Storm"


def test_baseline_track_produces_six_points():
    frame = pd.DataFrame([
        {"ISO_TIME": pd.Timestamp("2026-09-01T00:00:00Z"), "LAT": 14.0, "LON": 88.0, "WMO_WIND": 30, "USA_WIND": None, "WMO_PRES": 1000, "USA_PRES": None},
        {"ISO_TIME": pd.Timestamp("2026-09-01T03:00:00Z"), "LAT": 14.2, "LON": 87.7, "WMO_WIND": 32, "USA_WIND": None, "WMO_PRES": 998, "USA_PRES": None},
    ])
    points = _forecast_track(frame)
    assert len(points) == 6
    assert points[0]["lat"] == 14.2
    assert points[-1]["hours"] == 48
