# Model adapters

The baseline API is intentionally transparent. These are the replacement points for the real research models:

1. **Detection**: satellite IR/Water Vapor tiles -> cyclone center probability + center coordinates.
2. **Genesis**: SST, OHC, 850 hPa vorticity, humidity, pressure tendency, vertical shear -> 0-48h genesis probability.
3. **Intensity**: satellite morphology + environmental predictors -> wind/pressure trajectory.
4. **Track**: recent storm positions + NWP steering fields + environmental predictors -> latitude/longitude distribution.

Each model should expose:

- `model_name`
- `model_version`
- `trained_at`
- input feature schema/version
- point prediction
- calibrated confidence/probability where appropriate
- uncertainty distribution or ensemble spread
- validation metrics on a held-out time period

Never display a fabricated confidence percentage. If a model has not been calibrated, the API should return `null` and the UI should say `NOT CALIBRATED`.
