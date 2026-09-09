# Run the live backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Then start the frontend in another terminal:

```bash
npm install
npm run dev
```

Optional frontend override:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Train the first real ML component

From `backend/`:

```bash
python -m ml.train_track --years 1980 2025
```

This downloads the NOAA IBTrACS North Indian Ocean historical track subset, creates 6-hour motion samples, performs a chronological holdout, reports position error, and writes `artifacts/track_model.joblib`.

Restart the API after training. The API automatically uses the trained track model when that artifact exists. Otherwise it uses the transparent persistence/advection baseline.

## Data provenance

IBTrACS v04r01 is NOAA/NCEI's unified tropical-cyclone best-track archive. It provides basin subsets including North Indian and is updated regularly. See the official NCEI documentation for dataset versioning and column definitions.

The learned track model is a research baseline. It is **not** yet an operational warning model because it currently uses historical track/intensity variables rather than full NWP, satellite, and ocean predictors.
