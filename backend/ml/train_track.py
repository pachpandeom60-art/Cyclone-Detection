"""Train a 6-hour tropical-cyclone motion model from IBTrACS North Indian tracks.

This is a reproducible research baseline, not an operational forecast model.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor

URL = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.NI.list.v04r01.csv"
FEATURES = ["lat", "lon", "dlat3", "dlon3", "wind_kt", "pressure", "month", "hour"]


def load() -> pd.DataFrame:
    df = pd.read_csv(URL, skiprows=[1], low_memory=False)
    df["ISO_TIME"] = pd.to_datetime(df["ISO_TIME"], errors="coerce", utc=True)
    for col in ("LAT", "LON", "WMO_WIND", "USA_WIND", "WMO_PRES", "USA_PRES"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["wind_kt"] = df["WMO_WIND"].fillna(df["USA_WIND"])
    df["pressure"] = df["WMO_PRES"].fillna(df["USA_PRES"])
    df["lat"] = df["LAT"]
    df["lon"] = df["LON"]
    return df.dropna(subset=["SID", "ISO_TIME", "lat", "lon", "wind_kt"]).sort_values(["SID", "ISO_TIME"])


def make_samples(df: pd.DataFrame) -> pd.DataFrame:
    parts = []
    for _, group in df.groupby("SID"):
        g = group.sort_values("ISO_TIME").copy()
        g["elapsed_hours"] = g["ISO_TIME"].diff().dt.total_seconds().div(3600)
        g["dlat3"] = g["lat"].diff()
        g["dlon3"] = g["lon"].diff()
        g["future_time"] = g["ISO_TIME"].shift(-1)
        g["target_dlat"] = g["lat"].shift(-1) - g["lat"]
        g["target_dlon"] = g["lon"].shift(-1) - g["lon"]
        g["target_hours"] = g["future_time"].sub(g["ISO_TIME"]).dt.total_seconds().div(3600)
        g["month"] = g["ISO_TIME"].dt.month
        g["hour"] = g["ISO_TIME"].dt.hour
        parts.append(g)

    out = pd.concat(parts, ignore_index=True)
    out = out.replace([np.inf, -np.inf], np.nan)
    out = out.dropna(subset=FEATURES + ["target_dlat", "target_dlon", "target_hours"])
    # IBTrACS is generally 3-hourly, but gaps occur. Use only genuine ~6-hour pairs.
    out = out[out["target_hours"].between(5.5, 6.5)]
    out = out[(out["target_dlat"].abs() < 5) & (out["target_dlon"].abs() < 8)]
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--years", nargs=2, type=int, default=[1980, 2025])
    args = parser.parse_args()

    df = load()
    df = df[df["ISO_TIME"].dt.year.between(args.years[0], args.years[1])]
    samples = make_samples(df)
    if samples.empty:
        raise SystemExit("No usable 6-hour IBTrACS training samples found")

    years = sorted(samples["ISO_TIME"].dt.year.unique())
    if len(years) < 5:
        raise SystemExit("Need at least 5 distinct years for a chronological holdout")
    split_index = min(len(years) - 1, max(1, int(len(years) * 0.8)))
    split_year = years[split_index]
    train = samples[samples["ISO_TIME"].dt.year < split_year]
    test = samples[samples["ISO_TIME"].dt.year >= split_year]
    if train.empty or test.empty:
        raise SystemExit("Chronological holdout produced an empty train or test set")

    model = MultiOutputRegressor(
        HistGradientBoostingRegressor(max_iter=250, learning_rate=0.05, max_leaf_nodes=15, random_state=42)
    )
    model.fit(train[FEATURES], train[["target_dlat", "target_dlon"]])
    pred = model.predict(test[FEATURES])

    lat_err_km = (pred[:, 0] - test["target_dlat"].to_numpy()) * 111.32
    lon_scale = 111.32 * np.cos(np.deg2rad(test["lat"].to_numpy()))
    lon_err_km = (pred[:, 1] - test["target_dlon"].to_numpy()) * lon_scale
    distance_error = np.sqrt(lat_err_km**2 + lon_err_km**2)
    print(f"train samples: {len(train)}")
    print(f"test samples: {len(test)}")
    print(f"holdout start year: {split_year}")
    print(f"mean position error (km): {distance_error.mean():.1f}")
    print(f"median position error (km): {np.median(distance_error):.1f}")

    artifact = {
        "model": model,
        "features": FEATURES,
        "horizon_hours": 6,
        "trained_through_year": args.years[1],
        "holdout_start_year": split_year,
        "mean_error_km": float(distance_error.mean()),
        "median_error_km": float(np.median(distance_error)),
        "data_source": "NOAA IBTrACS v04r01 North Indian Ocean",
        "sample_rule": "Observed pairs separated by 5.5 to 6.5 hours",
    }
    path = Path("artifacts/track_model.joblib")
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, path)
    print(f"saved: {path}")


if __name__ == "__main__":
    main()
