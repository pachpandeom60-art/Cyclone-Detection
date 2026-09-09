import type { Alert, Scenario, TrackPoint, IntensityPoint } from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

type LiveResponse = {
  key: string;
  label: string;
  description: string;
  cyclone: Scenario['cyclone'];
  genesisTrend: Scenario['genesisTrend'];
  intensityForecast: IntensityPoint[];
  track: TrackPoint[];
  alerts: Alert[];
  generatedAt: string;
  model: { name: string; version: string; isML: boolean };
};

export async function fetchLiveScenario(signal?: AbortSignal): Promise<Scenario> {
  const response = await fetch(`${API_BASE}/v1/live-scenario`, { signal });
  if (!response.ok) {
    throw new Error(`Cyclone API returned ${response.status}`);
  }
  const data = (await response.json()) as LiveResponse;
  return {
    key: 'early',
    label: data.label,
    description: `${data.description} • Generated ${new Date(data.generatedAt).toLocaleString()}`,
    cyclone: data.cyclone,
    genesisTrend: data.genesisTrend,
    intensityForecast: data.intensityForecast,
    track: data.track,
    alerts: data.alerts,
  };
}
