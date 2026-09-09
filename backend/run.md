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

The `/v1/live-scenario` endpoint reads the NOAA IBTrACS active-system CSV. The current forecast is intentionally a transparent persistence/advection baseline, not a claimed deep-learning forecast.
