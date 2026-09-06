# CYCLONE AI | AI-Powered Tropical Cyclone Intelligence Platform

A high-fidelity, real-time meteorological intelligence and cyclone prediction prototype built with React, TypeScript, Leaflet GIS mapping, Recharts, and Tailwind CSS.

---

## Key Features

- 🛰️ **Cyclone Detection**: Satellite imagery upload and automated deep-learning inference for eye detection, storm center localization, and feature extraction.
- 🌀 **Track Prediction**: Ensemble meteorological trajectory modeling with cone of uncertainty, waypoints, and landfall forecasting.
- ⚡ **Intensity & Wind Forecasting**: Temporal prediction curves for maximum sustained winds (knots), central barometric pressure (hPa), and Saffir-Simpson / IMD classification.
- 🌊 **Genesis Prediction**: Oceanic thermal analysis, vertical wind shear, and Coriolis vorticity heatmaps for early cyclone formation warnings.
- 🗺️ **Live Geospatial Monitoring**: Interactive Leaflet map with dark canvas, ocean bathymetry, satellite tile layers, active storm tracking, and distance measurement.
- 🚨 **Automated Alerting & Bulletins**: Real-time evacuation advisories, maritime warnings, and emergency bulletin generation.
- 📊 **Model Metrics & System Health**: Comprehensive telemetry on inference latency, accuracy, precision/recall, and real-time backend pipeline status.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism Theme
- **Mapping**: Leaflet + React-Leaflet (Esri World Imagery & Dark Gray Canvas basemaps)
- **Charts & Visualizations**: Recharts
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/pachpandeom60-art/Cyclone-Detection.git

# Navigate into the directory
cd Cyclone-Detection

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## License

This project is licensed under the MIT License.
