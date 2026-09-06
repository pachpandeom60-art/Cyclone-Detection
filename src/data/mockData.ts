// ============================================================
// CYCLONE AI — Centralized Mock Data
// ALL VALUES ARE SIMULATED PROTOTYPE DATA — NOT REAL FORECASTS
// ============================================================

export interface Cyclone {
  id: string;
  name: string;
  lat: number;
  lon: number;
  status: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  genesisProbability: number;
  confidence: number;
  classification: string;
  windSpeed: number; // km/h
  pressure: number; // hPa
  movement: string;
  expectedLandfall: string;
  pattern: string;
  basin: string;
}

export interface TrackPoint {
  time: string;
  lat: number;
  lon: number;
  uncertainty: number; // km
  windSpeed: number;
  pressure: number;
  intensity: string;
}

export interface GenesisPoint {
  time: string;
  hours: number;
  probability: number;
}

export interface IntensityPoint {
  time: string;
  hours: number;
  windSpeed: number;
  pressure: number;
  category: string;
}

export interface Alert {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  location: string;
  time: string;
  reason: string;
  action: string;
  systemId: string;
  acknowledged: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  shortName: string;
  type: string;
  status: 'CONNECTED' | 'DEGRADED' | 'OFFLINE';
  lastUpdate: string;
  description: string;
  variables: string[];
  quality: number;
  latency: string;
  icon: string;
}

export interface ModelMetric {
  model: string;
  purpose: string;
  metrics: { label: string; value: string; unit: string }[];
  note: string;
}

export interface SystemComponent {
  name: string;
  status: 'ONLINE' | 'HEALTHY' | 'READY' | 'DEGRADED' | 'OFFLINE';
  description: string;
  uptime: string;
  lastCheck: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  detail: {
    title: string;
    description: string;
    items: string[];
  };
}

// ── Scenario configurations ───────────────────────────────────
export type ScenarioKey = 'early' | 'rapid' | 'coastal' | 'low';

export interface Scenario {
  key: ScenarioKey;
  label: string;
  description: string;
  cyclone: Partial<Cyclone>;
  genesisTrend: GenesisPoint[];
  intensityForecast: IntensityPoint[];
  track: TrackPoint[];
  alerts: Alert[];
}

// ── Base cyclone systems ──────────────────────────────────────
export const baseCyclones: Cyclone[] = [
  {
    id: 'CY-2026-07',
    name: 'System CY-2026-07',
    lat: 14.8,
    lon: 87.2,
    status: 'Potential Cyclone Formation',
    riskLevel: 'MODERATE',
    genesisProbability: 72,
    confidence: 84,
    classification: 'Tropical Disturbance',
    windSpeed: 45,
    pressure: 998,
    movement: 'NW at 12 km/h',
    expectedLandfall: 'Demo forecast — ~72h',
    pattern: 'Organizing circulation',
    basin: 'Bay of Bengal',
  },
  {
    id: 'CY-2026-08',
    name: 'System CY-2026-08',
    lat: 16.2,
    lon: 67.5,
    status: 'Low Pressure Area',
    riskLevel: 'LOW',
    genesisProbability: 28,
    confidence: 61,
    classification: 'Low Pressure Area',
    windSpeed: 30,
    pressure: 1004,
    movement: 'W at 8 km/h',
    expectedLandfall: 'Track uncertain',
    pattern: 'Diffuse cloudiness',
    basin: 'Arabian Sea',
  },
];

// ── Genesis trend ─────────────────────────────────────────────
export const defaultGenesisTrend: GenesisPoint[] = [
  { time: 'NOW', hours: 0, probability: 41 },
  { time: '+12h', hours: 12, probability: 53 },
  { time: '+24h', hours: 24, probability: 64 },
  { time: '+36h', hours: 36, probability: 69 },
  { time: '+48h', hours: 48, probability: 72 },
];

// ── Intensity forecast ────────────────────────────────────────
export const defaultIntensityForecast: IntensityPoint[] = [
  { time: 'NOW', hours: 0, windSpeed: 45, pressure: 998, category: 'Tropical Disturbance' },
  { time: '+12h', hours: 12, windSpeed: 55, pressure: 994, category: 'Depression' },
  { time: '+24h', hours: 24, windSpeed: 70, pressure: 988, category: 'Deep Depression' },
  { time: '+36h', hours: 36, windSpeed: 85, pressure: 980, category: 'Cyclonic Storm' },
  { time: '+48h', hours: 48, windSpeed: 100, pressure: 972, category: 'Cyclonic Storm' },
];

// ── Track forecast ────────────────────────────────────────────
export const defaultTrack: TrackPoint[] = [
  { time: 'NOW', lat: 14.8, lon: 87.2, uncertainty: 0, windSpeed: 45, pressure: 998, intensity: 'Tropical Disturbance' },
  { time: '+6h', lat: 15.5, lon: 86.1, uncertainty: 40, windSpeed: 50, pressure: 996, intensity: 'Tropical Disturbance' },
  { time: '+12h', lat: 16.3, lon: 85.0, uncertainty: 70, windSpeed: 60, pressure: 992, intensity: 'Depression' },
  { time: '+24h', lat: 17.4, lon: 82.9, uncertainty: 120, windSpeed: 75, pressure: 985, intensity: 'Deep Depression' },
  { time: '+36h', lat: 18.1, lon: 80.7, uncertainty: 170, windSpeed: 90, pressure: 978, intensity: 'Cyclonic Storm' },
  { time: '+48h', lat: 18.7, lon: 78.9, uncertainty: 240, windSpeed: 105, pressure: 969, intensity: 'Cyclonic Storm' },
];

// ── Default alerts ────────────────────────────────────────────
export const defaultAlerts: Alert[] = [
  {
    id: 'AL-001',
    severity: 'HIGH',
    title: 'Potential cyclone intensification detected',
    location: 'Bay of Bengal (14.8°N, 87.2°E)',
    time: '12 minutes ago',
    reason: 'Genesis probability crossed 70% threshold and intensification trend detected.',
    action: 'Monitor closely. Issue coastal advisories if probability exceeds 80%.',
    systemId: 'CY-2026-07',
    acknowledged: false,
  },
  {
    id: 'AL-002',
    severity: 'MEDIUM',
    title: 'Genesis probability crossed 60%',
    location: 'Bay of Bengal',
    time: '27 minutes ago',
    reason: 'AI model detected organized convection with increasing low-level circulation.',
    action: 'Issue Genesis Watch. Increase observation frequency.',
    systemId: 'CY-2026-07',
    acknowledged: false,
  },
  {
    id: 'AL-003',
    severity: 'MEDIUM',
    title: 'Forecast track updated — coastal proximity',
    location: 'Eastern Coast Region',
    time: '42 minutes ago',
    reason: 'Updated track model output shows potential approach towards Andhra Pradesh coastline within 72h.',
    action: 'Notify state disaster management authorities. Pre-position resources.',
    systemId: 'CY-2026-07',
    acknowledged: false,
  },
  {
    id: 'AL-004',
    severity: 'LOW',
    title: 'New low pressure area detected',
    location: 'Arabian Sea (16.2°N, 67.5°E)',
    time: '1 hour ago',
    reason: 'Satellite imagery indicates diffuse cloud organization. Genesis probability at 28%.',
    action: 'Continue routine monitoring. No immediate action required.',
    systemId: 'CY-2026-08',
    acknowledged: true,
  },
];

// ── Data sources ──────────────────────────────────────────────
export const dataSources: DataSource[] = [
  {
    id: 'insat',
    name: 'INSAT-3D / INSAT-3DR',
    shortName: 'INSAT',
    type: 'Geostationary Satellite Imagery',
    status: 'CONNECTED',
    lastUpdate: '06 Sep 2026, 08:30 IST',
    description: 'Indian geostationary satellites providing high-resolution imagery over the Indian Ocean region every 30 minutes.',
    variables: ['Cloud top temperature', 'Water vapour', 'Infrared imagery', 'Visible imagery', 'Brightness temperature'],
    quality: 96,
    latency: '~15 min',
    icon: 'Satellite',
  },
  {
    id: 'era5',
    name: 'ERA5 Reanalysis',
    shortName: 'ERA5',
    type: 'Atmospheric Reanalysis',
    status: 'CONNECTED',
    lastUpdate: '06 Sep 2026, 06:00 UTC',
    description: 'ECMWF ERA5 global atmospheric reanalysis providing comprehensive historical and near-real-time atmospheric data at 0.25° resolution.',
    variables: ['Wind (U, V at 850/500/200 hPa)', 'Temperature', 'Relative humidity', 'Geopotential height', 'Vertical velocity'],
    quality: 98,
    latency: '~6 hours',
    icon: 'Wind',
  },
  {
    id: 'oisst',
    name: 'NOAA OISST',
    shortName: 'OISST',
    type: 'Sea Surface Temperature',
    status: 'CONNECTED',
    lastUpdate: '06 Sep 2026, 00:00 UTC',
    description: 'NOAA Optimum Interpolation SST — daily 0.25° resolution sea surface temperature product combining satellite and in-situ observations.',
    variables: ['Sea surface temperature (29.1°C avg)', 'SST anomaly', 'Ice coverage'],
    quality: 94,
    latency: '~1 day',
    icon: 'Thermometer',
  },
  {
    id: 'imd',
    name: 'IMD Best-Track Archive',
    shortName: 'IMD',
    type: 'Historical Cyclone Track Data',
    status: 'CONNECTED',
    lastUpdate: 'Static archive (validation)',
    description: 'India Meteorological Department official best-track dataset for historical cyclone position, intensity and classification — used for model training and validation.',
    variables: ['Track positions', 'Wind intensity', 'Central pressure', 'Cyclone category', 'Landfall details'],
    quality: 100,
    latency: 'Historical',
    icon: 'MapPin',
  },
  {
    id: 'mosdac',
    name: 'MOSDAC',
    shortName: 'MOSDAC',
    type: 'Indian Satellite Data Platform',
    status: 'CONNECTED',
    lastUpdate: '06 Sep 2026, 08:00 IST',
    description: 'Meteorological & Oceanographic Satellite Data Archival Centre (ISRO/SAC) — providing processed satellite-derived products for the Indian Ocean region.',
    variables: ['Outgoing longwave radiation', 'Cloud motion vectors', 'Rainfall estimates', 'Ocean heat content'],
    quality: 91,
    latency: '~30 min',
    icon: 'Database',
  },
];

// ── Model metrics ─────────────────────────────────────────────
export const modelMetrics: ModelMetric[] = [
  {
    model: 'XGBoost',
    purpose: 'Genesis Prediction',
    metrics: [
      { label: 'Precision', value: '89', unit: '%' },
      { label: 'Recall', value: '86', unit: '%' },
      { label: 'F1 Score', value: '87', unit: '%' },
      { label: 'AUC-ROC', value: '0.93', unit: '' },
      { label: 'Lead Time', value: '48', unit: 'hours' },
    ],
    note: 'Reference benchmark / target performance',
  },
  {
    model: 'ResNet18 / EfficientNet',
    purpose: 'Detection & Intensity Classification',
    metrics: [
      { label: 'Classification Accuracy', value: '91', unit: '%' },
      { label: 'Intensity MAE', value: '4.7', unit: 'knots' },
      { label: 'Pressure MAE', value: '3.5', unit: 'hPa' },
      { label: 'Rapid Intensification Detection', value: '78', unit: '%' },
      { label: 'False Alarm Rate', value: '12', unit: '%' },
    ],
    note: 'Reference benchmark / target performance',
  },
  {
    model: 'LSTM / ConvLSTM',
    purpose: 'Track Prediction',
    metrics: [
      { label: '6h Track Error', value: '55', unit: 'km' },
      { label: '12h Track Error', value: '95', unit: 'km' },
      { label: '24h Track Error', value: '170', unit: 'km' },
      { label: '48h Track Error', value: '310', unit: 'km' },
      { label: 'Landfall Error', value: '±85', unit: 'km' },
    ],
    note: 'Reference benchmark / target performance',
  },
];

// ── System components ─────────────────────────────────────────
export const systemComponents: SystemComponent[] = [
  { name: 'Satellite Ingestion', status: 'ONLINE', description: 'INSAT-3D/3DR & MOSDAC data pipeline', uptime: '99.8%', lastCheck: '30s ago' },
  { name: 'Atmospheric Data Feed', status: 'ONLINE', description: 'ERA5 reanalysis & NOAA OISST pipeline', uptime: '99.5%', lastCheck: '45s ago' },
  { name: 'Data Preprocessing', status: 'HEALTHY', description: 'Cleaning, normalization & regridding engine', uptime: '100%', lastCheck: '1 min ago' },
  { name: 'Genesis Prediction Model', status: 'READY', description: 'XGBoost genesis classification', uptime: '100%', lastCheck: '2 min ago' },
  { name: 'Detection & Classification Model', status: 'READY', description: 'ResNet18/EfficientNet inference engine', uptime: '100%', lastCheck: '2 min ago' },
  { name: 'Track Prediction Model', status: 'READY', description: 'LSTM/ConvLSTM track forecasting', uptime: '100%', lastCheck: '2 min ago' },
  { name: 'Alert Engine', status: 'ONLINE', description: 'Rule-based alert generation & dispatch', uptime: '100%', lastCheck: '15s ago' },
  { name: 'Dashboard & API', status: 'ONLINE', description: 'Frontend dashboard & data API', uptime: '100%', lastCheck: '5s ago' },
];

// ── Preprocessing stats ───────────────────────────────────────
export const preprocessingStats = {
  recordsProcessed: 24680,
  missingDetected: 312,
  missingResolved: 307,
  gridsAligned: '100%',
  timestampSync: 'Complete',
  normalization: 'Complete',
  spatialResolution: '0.25°',
  temporalAlignment: '6-hourly',
};

// ── Pipeline stages ───────────────────────────────────────────
export const pipelineStages: PipelineStage[] = [
  {
    id: 'ingestion',
    label: 'Satellite & Atmospheric Data',
    sublabel: '5 sources',
    icon: 'Satellite',
    detail: {
      title: 'Multi-Source Data Ingestion',
      description: 'Continuously ingests data from INSAT-3D/3DR, ERA5, NOAA OISST, IMD Best-Track and MOSDAC.',
      items: ['30-min satellite refresh', 'ERA5 6-hourly atmospheric data', 'Daily SST updates', 'Historical track validation'],
    },
  },
  {
    id: 'processing',
    label: 'AI Data Processing',
    sublabel: 'Clean & align',
    icon: 'Cpu',
    detail: {
      title: 'Preprocessing Pipeline',
      description: 'Automated data cleaning, normalization, regridding and temporal alignment across all sources.',
      items: ['Missing value interpolation', 'Spatial regridding to 0.25°', 'Temporal alignment (6-hourly)', 'Feature engineering & normalization'],
    },
  },
  {
    id: 'detection',
    label: 'Detection & Classification',
    sublabel: 'ResNet / EfficientNet',
    icon: 'ScanSearch',
    detail: {
      title: 'AI Cyclone Detection & Classification',
      description: 'Deep learning models analyze satellite imagery and atmospheric patterns to detect and classify cyclone structures.',
      items: ['Satellite pattern recognition', 'Spiral band detection', 'Eye/eyewall identification', 'Intensity classification'],
    },
  },
  {
    id: 'prediction',
    label: 'Genesis / Intensity / Track',
    sublabel: 'XGBoost + LSTM',
    icon: 'TrendingUp',
    detail: {
      title: 'Multi-Task AI Prediction',
      description: 'Separate specialized models for genesis probability, intensity evolution and future track prediction with uncertainty quantification.',
      items: ['XGBoost genesis probability (48h lead)', 'ResNet18 intensity forecast', 'ConvLSTM track prediction', 'Uncertainty cone generation'],
    },
  },
  {
    id: 'alerts',
    label: 'Alerts & Dashboard',
    sublabel: 'Early warning',
    icon: 'Bell',
    detail: {
      title: 'Alert Generation & Dashboard',
      description: 'Rule-based alert engine translates AI predictions into actionable warnings for disaster management authorities.',
      items: ['Threshold-based alert triggers', 'Multi-level severity classification', 'Geofenced coastal risk zones', 'Real-time dashboard updates'],
    },
  },
];

// ── Scenario definitions ──────────────────────────────────────
export const scenarios: Scenario[] = [
  {
    key: 'early',
    label: 'Scenario 1: Early Disturbance',
    description: 'An early-stage atmospheric disturbance with low-to-moderate genesis probability.',
    cyclone: {
      genesisProbability: 42,
      confidence: 61,
      classification: 'Low Pressure Area',
      riskLevel: 'LOW',
      windSpeed: 32,
      pressure: 1004,
      movement: 'WNW at 8 km/h',
      status: 'Low Pressure Area',
    },
    genesisTrend: [
      { time: 'NOW', hours: 0, probability: 28 },
      { time: '+12h', hours: 12, probability: 34 },
      { time: '+24h', hours: 24, probability: 39 },
      { time: '+36h', hours: 36, probability: 41 },
      { time: '+48h', hours: 48, probability: 42 },
    ],
    intensityForecast: [
      { time: 'NOW', hours: 0, windSpeed: 32, pressure: 1004, category: 'Low Pressure Area' },
      { time: '+12h', hours: 12, windSpeed: 36, pressure: 1002, category: 'Low Pressure Area' },
      { time: '+24h', hours: 24, windSpeed: 40, pressure: 1000, category: 'Low Pressure Area' },
      { time: '+36h', hours: 36, windSpeed: 44, pressure: 999, category: 'Tropical Disturbance' },
      { time: '+48h', hours: 48, windSpeed: 47, pressure: 998, category: 'Tropical Disturbance' },
    ],
    track: [
      { time: 'NOW', lat: 14.8, lon: 87.2, uncertainty: 0, windSpeed: 32, pressure: 1004, intensity: 'Low Pressure Area' },
      { time: '+6h', lat: 15.2, lon: 86.5, uncertainty: 60, windSpeed: 34, pressure: 1003, intensity: 'Low Pressure Area' },
      { time: '+12h', lat: 15.7, lon: 85.7, uncertainty: 110, windSpeed: 36, pressure: 1002, intensity: 'Low Pressure Area' },
      { time: '+24h', lat: 16.5, lon: 84.1, uncertainty: 190, windSpeed: 40, pressure: 1000, intensity: 'Low Pressure Area' },
      { time: '+36h', lat: 17.2, lon: 82.5, uncertainty: 270, windSpeed: 44, pressure: 999, intensity: 'Tropical Disturbance' },
      { time: '+48h', lat: 17.8, lon: 81.0, uncertainty: 350, windSpeed: 47, pressure: 998, intensity: 'Tropical Disturbance' },
    ],
    alerts: [
      {
        id: 'S1-AL-001', severity: 'LOW', title: 'Low pressure area detected', location: 'Bay of Bengal',
        time: '45 min ago', reason: 'Genesis probability at 42%. Routine monitoring.',
        action: 'Continue monitoring. No immediate action required.', systemId: 'CY-2026-07', acknowledged: false,
      },
    ],
  },
  {
    key: 'rapid',
    label: 'Scenario 2: Rapid Intensification',
    description: 'A developing system undergoing rapid intensification over warm waters.',
    cyclone: {
      genesisProbability: 92,
      confidence: 96,
      classification: 'Cyclonic Storm',
      riskLevel: 'HIGH',
      windSpeed: 90,
      pressure: 978,
      movement: 'NW at 16 km/h',
      status: 'Rapid Intensification',
    },
    genesisTrend: [
      { time: 'NOW', hours: 0, probability: 78 },
      { time: '+12h', hours: 12, probability: 85 },
      { time: '+24h', hours: 24, probability: 90 },
      { time: '+36h', hours: 36, probability: 93 },
      { time: '+48h', hours: 48, probability: 92 },
    ],
    intensityForecast: [
      { time: 'NOW', hours: 0, windSpeed: 90, pressure: 978, category: 'Cyclonic Storm' },
      { time: '+12h', hours: 12, windSpeed: 115, pressure: 962, category: 'Severe Cyclonic Storm' },
      { time: '+24h', hours: 24, windSpeed: 145, pressure: 940, category: 'Very Severe Cyclonic Storm' },
      { time: '+36h', hours: 36, windSpeed: 165, pressure: 922, category: 'Extremely Severe Cyclonic Storm' },
      { time: '+48h', hours: 48, windSpeed: 150, pressure: 935, category: 'Very Severe Cyclonic Storm' },
    ],
    track: [
      { time: 'NOW', lat: 14.8, lon: 87.2, uncertainty: 0, windSpeed: 90, pressure: 978, intensity: 'Cyclonic Storm' },
      { time: '+6h', lat: 15.7, lon: 86.0, uncertainty: 35, windSpeed: 105, pressure: 970, intensity: 'Cyclonic Storm' },
      { time: '+12h', lat: 16.6, lon: 84.7, uncertainty: 60, windSpeed: 120, pressure: 958, intensity: 'Severe CS' },
      { time: '+24h', lat: 17.8, lon: 82.2, uncertainty: 100, windSpeed: 148, pressure: 938, intensity: 'Very Severe CS' },
      { time: '+36h', lat: 18.6, lon: 80.0, uncertainty: 140, windSpeed: 165, pressure: 920, intensity: 'Extremely Severe CS' },
      { time: '+48h', lat: 19.1, lon: 78.5, uncertainty: 190, windSpeed: 150, pressure: 932, intensity: 'Very Severe CS' },
    ],
    alerts: [
      {
        id: 'S2-AL-001', severity: 'HIGH', title: 'RAPID INTENSIFICATION DETECTED', location: 'Bay of Bengal (14.8°N, 87.2°E)',
        time: '5 min ago', reason: 'Wind speed increased 30 km/h in 12h. SST 30.5°C. Very low wind shear.',
        action: 'Issue Cyclone Warning. Alert coastal districts. Activate emergency protocol.', systemId: 'CY-2026-07', acknowledged: false,
      },
      {
        id: 'S2-AL-002', severity: 'HIGH', title: 'Extremely Severe Cyclonic Storm forecast', location: 'Andhra Pradesh / Odisha coast',
        time: '8 min ago', reason: 'AI intensity model predicts Extremely Severe CS within 36h.',
        action: 'Coordinate evacuations. Pre-position rescue teams and relief supplies.', systemId: 'CY-2026-07', acknowledged: false,
      },
    ],
  },
  {
    key: 'coastal',
    label: 'Scenario 3: Coastal Approach',
    description: 'A cyclonic storm on a direct coastal approach trajectory.',
    cyclone: {
      genesisProbability: 98,
      confidence: 97,
      classification: 'Severe Cyclonic Storm',
      riskLevel: 'EXTREME',
      windSpeed: 120,
      pressure: 964,
      movement: 'NW at 18 km/h',
      status: 'Imminent Landfall',
    },
    genesisTrend: [
      { time: '-48h', hours: -48, probability: 65 },
      { time: '-24h', hours: -24, probability: 82 },
      { time: '-12h', hours: -12, probability: 94 },
      { time: 'NOW', hours: 0, probability: 98 },
      { time: '+12h', hours: 12, probability: 99 },
    ],
    intensityForecast: [
      { time: 'NOW', hours: 0, windSpeed: 120, pressure: 964, category: 'Severe Cyclonic Storm' },
      { time: '+12h', hours: 12, windSpeed: 130, pressure: 952, category: 'Very Severe Cyclonic Storm' },
      { time: '+24h', hours: 24, windSpeed: 110, pressure: 968, category: 'Cyclonic Storm (Weakening)' },
      { time: '+36h', hours: 36, windSpeed: 75, pressure: 985, category: 'Cyclonic Storm' },
      { time: '+48h', hours: 48, windSpeed: 50, pressure: 995, category: 'Deep Depression' },
    ],
    track: [
      { time: 'NOW', lat: 14.8, lon: 87.2, uncertainty: 0, windSpeed: 120, pressure: 964, intensity: 'Severe CS' },
      { time: '+6h', lat: 15.8, lon: 85.8, uncertainty: 30, windSpeed: 126, pressure: 958, intensity: 'Severe CS' },
      { time: '+12h', lat: 16.8, lon: 84.4, uncertainty: 55, windSpeed: 132, pressure: 951, intensity: 'Very Severe CS' },
      { time: '+24h', lat: 18.1, lon: 82.0, uncertainty: 90, windSpeed: 115, pressure: 965, intensity: 'Severe CS' },
      { time: '+36h', lat: 18.8, lon: 80.8, uncertainty: 130, windSpeed: 80, pressure: 983, intensity: 'CS Weakening' },
      { time: '+48h', lat: 19.2, lon: 80.3, uncertainty: 170, windSpeed: 55, pressure: 993, intensity: 'Deep Depression' },
    ],
    alerts: [
      {
        id: 'S3-AL-001', severity: 'HIGH', title: 'CYCLONE LANDFALL WARNING — EXTREME RISK', location: 'Andhra Pradesh coast (~18.8°N)',
        time: '2 min ago', reason: 'Severe Cyclonic Storm on direct approach. Landfall expected within 18-24h.',
        action: 'Immediate evacuation of coastal areas. Red Alert for 5 districts.', systemId: 'CY-2026-07', acknowledged: false,
      },
      {
        id: 'S3-AL-002', severity: 'HIGH', title: 'Storm surge warning — 3-4m expected', location: 'Kakinada to Visakhapatnam',
        time: '5 min ago', reason: 'Storm surge model predicts 3-4m above astronomical tide.',
        action: 'Mandatory evacuation within 5 km of coastline. Shut ports.', systemId: 'CY-2026-07', acknowledged: false,
      },
      {
        id: 'S3-AL-003', severity: 'HIGH', title: 'Extremely heavy rainfall alert', location: 'AP, Odisha, Telangana',
        time: '10 min ago', reason: 'Rainfall estimates indicate 200-300mm in 24h for landfall zone.',
        action: 'Alert flood control authorities. Open relief camps.', systemId: 'CY-2026-07', acknowledged: false,
      },
    ],
  },
  {
    key: 'low',
    label: 'Scenario 4: Low-Confidence System',
    description: 'A poorly-organized system with high forecast uncertainty.',
    cyclone: {
      genesisProbability: 35,
      confidence: 42,
      classification: 'Area of Interest',
      riskLevel: 'LOW',
      windSpeed: 28,
      pressure: 1007,
      movement: 'Erratic / Slow',
      status: 'Low Confidence',
    },
    genesisTrend: [
      { time: 'NOW', hours: 0, probability: 22 },
      { time: '+12h', hours: 12, probability: 27 },
      { time: '+24h', hours: 24, probability: 33 },
      { time: '+36h', hours: 36, probability: 31 },
      { time: '+48h', hours: 48, probability: 35 },
    ],
    intensityForecast: [
      { time: 'NOW', hours: 0, windSpeed: 28, pressure: 1007, category: 'Area of Interest' },
      { time: '+12h', hours: 12, windSpeed: 30, pressure: 1006, category: 'Area of Interest' },
      { time: '+24h', hours: 24, windSpeed: 33, pressure: 1004, category: 'Low Pressure Area' },
      { time: '+36h', hours: 36, windSpeed: 30, pressure: 1006, category: 'Dissipating' },
      { time: '+48h', hours: 48, windSpeed: 25, pressure: 1009, category: 'Dissipating' },
    ],
    track: [
      { time: 'NOW', lat: 14.8, lon: 87.2, uncertainty: 0, windSpeed: 28, pressure: 1007, intensity: 'Area of Interest' },
      { time: '+6h', lat: 14.9, lon: 87.0, uncertainty: 90, windSpeed: 29, pressure: 1007, intensity: 'Area of Interest' },
      { time: '+12h', lat: 15.1, lon: 86.7, uncertainty: 160, windSpeed: 30, pressure: 1006, intensity: 'Area of Interest' },
      { time: '+24h', lat: 15.5, lon: 86.0, uncertainty: 290, windSpeed: 33, pressure: 1004, intensity: 'LPA' },
      { time: '+36h', lat: 15.8, lon: 85.2, uncertainty: 400, windSpeed: 30, pressure: 1006, intensity: 'Weakening' },
      { time: '+48h', lat: 16.0, lon: 84.5, uncertainty: 500, windSpeed: 25, pressure: 1009, intensity: 'Dissipating' },
    ],
    alerts: [
      {
        id: 'S4-AL-001', severity: 'LOW', title: 'Area of interest — low confidence', location: 'Bay of Bengal',
        time: '30 min ago', reason: 'Poorly organized convection. Genesis probability 35%. High uncertainty.',
        action: 'Watch only. Do not issue public alerts at this stage.', systemId: 'CY-2026-07', acknowledged: false,
      },
    ],
  },
];
