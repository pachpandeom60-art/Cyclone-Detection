# Cyclone AI backend

This directory is the server-side boundary for live ingestion, feature engineering, ML inference, forecast persistence, and alert generation.

## Architecture

`connectors -> normalized observations -> feature builder -> model adapters -> forecast service -> API`

The frontend must consume API output instead of `src/data/mockData.ts`.

## Planned services

- `connectors/`: MOSDAC/INSAT, numerical weather prediction, ocean/environmental feeds, and historical best-track ingestion.
- `features/`: normalized cyclone/environment feature vectors and quality checks.
- `models/`: versioned detection, genesis, intensity, and track model adapters.
- `forecast/`: forecast orchestration, uncertainty products, classification, and landfall calculations.
- `api/`: read-only forecast endpoints and operational health endpoints.
- `jobs/`: scheduled ingestion/inference jobs.

Do not place credentials in source control. Use environment variables/secrets for provider access.
