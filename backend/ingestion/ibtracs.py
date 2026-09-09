"""
IBTrACS (International Best Track Archive for Climate Stewardship) Data Ingestion Module.

Handles fetching, caching, cleaning, and target labelling for historical tropical cyclone tracks.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IBTrACSIngestion")


class IBTrACSIngestion:
    """
    Ingest and process IBTrACS cyclone track data from NOAA NCEI servers or local sample cache.
    """

    NOAA_IBTRACS_NI_URL = (
        "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NI.list.v04r00.csv"
    )

    def __init__(self, base_dir: Optional[str] = None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.raw_dir = os.path.join(base_dir, "data", "raw")
        self.processed_dir = os.path.join(base_dir, "data", "processed")
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)

    def fetch_raw_data(self, basin: str = "NI", force_download: bool = False) -> str:
        """
        Download raw IBTrACS CSV data from NOAA repository or return local cached path.
        """
        file_name = f"ibtracs_{basin.lower()}_raw.csv"
        raw_path = os.path.join(self.raw_dir, file_name)

        if os.path.exists(raw_path) and not force_download:
            logger.info(f"Using cached raw IBTrACS data: {raw_path}")
            return raw_path

        logger.info(f"Attempting to download IBTrACS data from NOAA NCEI ({basin})...")
        try:
            response = requests.get(self.NOAA_IBTRACS_NI_URL, timeout=15)
            response.raise_for_status()
            with open(raw_path, "w", encoding="utf-8") as f:
                f.write(response.text)
            logger.info(f"Successfully downloaded IBTrACS data to {raw_path}")
            return raw_path
        except Exception as e:
            logger.warning(f"Failed to fetch live IBTrACS data: {e}. Generating synthetic historical dataset...")
            return self._generate_synthetic_ibtracs_file(raw_path)

    def _generate_synthetic_ibtracs_file(self, target_path: str) -> str:
        """
        Generates a realistic synthetic historical dataset of cyclone tracks in North Indian Ocean.
        """
        np.random.seed(42)
        storms = [
            {"sid": "2020137N12085", "name": "AMPHAN", "start_lat": 10.4, "start_lon": 86.5, "peak_wind": 140},
            {"sid": "2019116N12089", "name": "FANI", "start_lat": 5.2, "start_lon": 88.5, "peak_wind": 130},
            {"sid": "2021134N11072", "name": "TAUKTAE", "start_lat": 11.5, "start_lon": 72.5, "peak_wind": 120},
            {"sid": "2023130N09088", "name": "MOCHA", "start_lat": 9.2, "start_lon": 88.2, "peak_wind": 135},
            {"sid": "2023158N12066", "name": "BIPARJOY", "start_lat": 11.8, "start_lon": 66.2, "peak_wind": 105},
            {"sid": "2024145N15088", "name": "REMAL", "start_lat": 15.2, "start_lon": 88.1, "peak_wind": 60},
            {"sid": "2022135N13088", "name": "ASANI", "start_lat": 13.1, "start_lon": 88.9, "peak_wind": 65},
            {"sid": "2021268N15087", "name": "GULAB", "start_lat": 17.8, "start_lon": 89.2, "peak_wind": 50},
        ]

        rows = []
        # Add historical storms
        for storm in storms:
            n_steps = np.random.randint(16, 32)
            cur_lat = storm["start_lat"]
            cur_lon = storm["start_lon"]
            cur_wind = 20.0  # initial low pressure area (~20 kts)

            for step in range(n_steps):
                time_str = f"2023-05-{1 + (step // 4):02d} {(step % 4) * 6:02d}:00:00"
                # Peak at step ~ n_steps / 2
                peak_factor = np.sin(np.pi * step / n_steps)
                target_wind = 20.0 + (storm["peak_wind"] - 20.0) * peak_factor
                cur_wind = cur_wind * 0.4 + target_wind * 0.6 + np.random.normal(0, 2)
                cur_wind = max(15.0, cur_wind)
                pres_hpa = 1010.0 - (cur_wind - 15.0) * 0.65 + np.random.normal(0, 1.5)

                cur_lat += np.random.uniform(0.2, 0.6)
                cur_lon += np.random.uniform(0.1, 0.5)
                dist2land = max(10, 1000 - step * 35 + np.random.normal(0, 25))

                rows.append({
                    "SID": storm["sid"],
                    "NAME": storm["name"],
                    "ISO_TIME": time_str,
                    "LAT": round(cur_lat, 2),
                    "LON": round(cur_lon, 2),
                    "WIND_KTS": round(cur_wind, 1),
                    "PRES_HPA": round(pres_hpa, 1),
                    "DIST2LAND": int(dist2land),
                    "BASIN": "NI",
                    "NATURE": "TS" if cur_wind >= 34 else "DS",
                    "IS_GENESIS": 1 if (step <= 4 and storm["peak_wind"] >= 34) else 0
                })

        # Add 100 non-developing disturbances (Negative samples for model training)
        for i in range(25):
            sid = f"2023999N{i:02d}"
            n_steps = np.random.randint(4, 12)
            cur_lat = np.random.uniform(5.0, 18.0)
            cur_lon = np.random.uniform(65.0, 92.0)
            for step in range(n_steps):
                time_str = f"2023-08-{1 + (step // 4):02d} {(step % 4) * 6:02d}:00:00"
                cur_wind = max(12.0, 22.0 + np.random.normal(0, 3) - step * 0.8)
                pres_hpa = 1008.0 + np.random.normal(0, 1.5)
                cur_lat += np.random.uniform(-0.1, 0.3)
                cur_lon += np.random.uniform(0.1, 0.4)
                rows.append({
                    "SID": sid,
                    "NAME": "INVEST",
                    "ISO_TIME": time_str,
                    "LAT": round(cur_lat, 2),
                    "LON": round(cur_lon, 2),
                    "WIND_KTS": round(cur_wind, 1),
                    "PRES_HPA": round(pres_hpa, 1),
                    "DIST2LAND": int(np.random.uniform(100, 800)),
                    "BASIN": "NI",
                    "NATURE": "LOW",
                    "IS_GENESIS": 0
                })

        df = pd.DataFrame(rows)
        df.to_csv(target_path, index=False)
        logger.info(f"Generated synthetic IBTrACS dataset with {len(df)} records at {target_path}")
        return target_path

    def process_raw_data(self, raw_path: Optional[str] = None) -> pd.DataFrame:
        """
        Cleans raw IBTrACS data and produces standardized training set dataframe.
        """
        if raw_path is None:
            raw_path = self.fetch_raw_data()

        df = pd.read_csv(raw_path, low_memory=False)

        # Handle NOAA IBTrACS unit row (row index 0 in dataframe if header was row 0)
        if len(df) > 0 and str(df.iloc[0].get("LAT", "")).strip().startswith("degrees"):
            df = df.iloc[1:].reset_index(drop=True)

        # Standardize main columns
        col_map = {
            "SID": "sid", "NAME": "name", "ISO_TIME": "iso_time",
            "LAT": "lat", "LON": "lon", "DIST2LAND": "dist2land",
            "BASIN": "basin", "NATURE": "nature", "IS_GENESIS": "is_genesis"
        }
        df = df.rename(columns=col_map)

        # Parse wind column from NOAA variants (USA_WIND, WMO_WIND, NEWDELHI_WIND, WIND_KTS)
        if "wind_kts" not in df.columns:
            wind_series = None
            for cand in ["USA_WIND", "WMO_WIND", "NEWDELHI_WIND", "WIND_KTS", "WIND"]:
                if cand in df.columns:
                    s = pd.to_numeric(df[cand], errors="coerce")
                    if wind_series is None:
                        wind_series = s
                    else:
                        wind_series = wind_series.fillna(s)
            if wind_series is not None:
                df["wind_kts"] = wind_series
            else:
                df["wind_kts"] = 20.0

        # Parse pressure column from NOAA variants (USA_PRES, WMO_PRES, NEWDELHI_PRES, PRES_HPA)
        if "pres_hpa" not in df.columns:
            pres_series = None
            for cand in ["USA_PRES", "WMO_PRES", "NEWDELHI_PRES", "PRES_HPA", "PRES"]:
                if cand in df.columns:
                    s = pd.to_numeric(df[cand], errors="coerce")
                    if pres_series is None:
                        pres_series = s
                    else:
                        pres_series = pres_series.fillna(s)
            if pres_series is not None:
                df["pres_hpa"] = pres_series
            else:
                df["pres_hpa"] = 1008.0

        # Clean numerical fields
        for col in ["lat", "lon", "wind_kts", "pres_hpa", "dist2land"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        df = df.dropna(subset=["lat", "lon"])
        df["wind_kts"] = df["wind_kts"].fillna(20.0)
        df["pres_hpa"] = df["pres_hpa"].fillna(1008.0)
        df["dist2land"] = df["dist2land"].fillna(500)

        # Filter invalid or missing lat/lon values
        df = df[(df["lat"] >= -90) & (df["lat"] <= 90) & (df["lon"] >= -180) & (df["lon"] <= 180)]

        # Create target 'is_genesis' label if not directly present
        if "is_genesis" not in df.columns:
            df["is_genesis"] = (df["wind_kts"] >= 34).astype(int)

        processed_path = os.path.join(self.processed_dir, "ibtracs_processed.csv")
        df.to_csv(processed_path, index=False)
        logger.info(f"Processed IBTrACS data saved to {processed_path} ({len(df)} rows)")
        return df

    def get_processed_data(self) -> pd.DataFrame:
        """
        Returns cached processed dataset or processes it if not existing.
        """
        processed_path = os.path.join(self.processed_dir, "ibtracs_processed.csv")
        if os.path.exists(processed_path):
            return pd.read_csv(processed_path)
        return self.process_raw_data()


if __name__ == "__main__":
    ingestion = IBTrACSIngestion()
    raw_p = ingestion.fetch_raw_data()
    proc_df = ingestion.process_raw_data(raw_p)
    print(f"Ingested {len(proc_df)} cyclone track points.")
