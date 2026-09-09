# Track model pipeline

The first learned model targets 6-hour storm-motion increments. It is intentionally modest and auditable: a pair of gradient-boosted regressors predicts latitude/longitude displacement from recent observed motion and intensity.

## Data

Training uses NOAA IBTrACS v04r01 North Indian Ocean historical tracks. IBTrACS is a best-track archive, so it supplies the supervised target for track verification, not the environmental predictors that would be required for a stronger operational model.

## Train

```bash
cd backend
python -m ml.train_track --years 1980 2025
```

The trainer performs a chronological year split: the final 20% of years are held out. It reports MAE in km and writes `backend/artifacts/track_model.joblib`.

## Important limitation

This model is a research/demo baseline, not an operational warning model. A production-quality system should add NWP steering fields, satellite-derived structure, ocean/environmental predictors, ensemble members, calibration, and storm-level out-of-sample validation.
