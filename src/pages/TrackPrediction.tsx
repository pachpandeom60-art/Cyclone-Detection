import { useState, useEffect } from 'react';
import MapPanel from '../components/MapPanel';
import TimelineControl from '../components/TimelineControl';
import WhyButton from '../components/WhyButton';
import type { Scenario } from '../data/mockData';
import { baseCyclones } from '../data/mockData';
import { Navigation, Compass, MapPin, ShieldAlert, Activity, Check, RefreshCw } from 'lucide-react';
import { predictTrack } from '../services/api';

const TRACK_FACTORS = [
  { label: 'Deep-layer steering flow (700-500 hPa)', value: 'East-southeasterly flow pushing system WNW', positive: true },
  { label: 'Subtropical Ridge Position', value: 'Ridge anchored over East-Central India acts as guide', positive: true },
  { label: 'Beta-drift effect', value: 'Coriolis vorticity gradient causes subtle poleward drift', positive: true },
  { label: 'Climatological analogue correlation', value: '88% match with historical post-monsoon BOB tracks', positive: true },
  { label: 'Ensemble model spread beyond +36h', value: 'Spread increases between Odisha and North AP coast', positive: false },
];

export default function TrackPrediction({
  scenario,
  timelineIndex,
  onTimelineChange,
}: {
  scenario: Scenario;
  timelineIndex: number;
  onTimelineChange: (i: number) => void;
}) {
  const [showUncertainty, setShowUncertainty] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);

  const [liveTrack, setLiveTrack] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const currentPt = scenario.track[timelineIndex] ?? scenario.track[0];
  const cy = { ...baseCyclones[0], ...scenario.cyclone };

  useEffect(() => {
    setLoading(true);
    predictTrack(currentPt.lat || 14.5, currentPt.lon || 87.5)
      .then(res => setLiveTrack(res))
      .finally(() => setLoading(false));
  }, [scenario, timelineIndex]);

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Module Title & Operational Status */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Navigation size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 06 // CYCLONE TRACK TRAJECTORY & UNCERTAINTY CONE FORECAST
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              STORM ID: <strong className="text-slate-200">{cy.id} ({cy.basin})</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={liveTrack ? 'badge-live flex items-center gap-1' : 'badge-simulated'}>
              {loading ? <RefreshCw size={10} className="animate-spin" /> : null}
              {liveTrack ? 'LIVE TRAJECTORY ENGINE' : 'SIMULATED TRACK'}
            </span>
            <WhyButton
              title="Explainable AI: Trajectory Dynamics"
              summary="Bidirectional ConvLSTM and multi-model ensemble neural networks ingest upper-air geopotential height fields and steering currents to compute cyclone track."
              factors={TRACK_FACTORS}
            />
          </div>
        </div>

        <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>MODEL: <strong className="text-slate-200">Bi-ConvLSTM + Beta-Drift Deflection</strong></span>
            <span>FORECAST STEP: <strong className="text-cyan-400">T+{timelineIndex * 6}h ({currentPt.time})</strong></span>
            <span>STEERING VECTOR: <strong className="text-slate-200">320° NW at 12 kts</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            LANDFALL PREDICTION: <strong className="text-amber-400">{liveTrack?.landfall_prediction?.location || 'North AP / South Odisha Coast (~72h)'}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Map Centerpiece (8 cols) + Precision Track Telemetry (4 cols) */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Map Panel (8 cols) */}
        <div className="col-span-8 card-panel flex flex-col">
          <div className="card-panel-header">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                TRAJECTORY CONE & COASTAL THREAT MAP
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { label: 'Forecast Path', active: showForecast, toggle: () => setShowForecast(v => !v) },
                { label: 'Uncertainty Cone', active: showUncertainty, toggle: () => setShowUncertainty(v => !v) },
                { label: 'Coastal Risk Sectors', active: showRiskZones, toggle: () => setShowRiskZones(v => !v) },
              ].map(layer => (
                <button
                  key={layer.label}
                  onClick={layer.toggle}
                  className={`btn-secondary ${layer.active ? 'active' : ''}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${layer.active ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
                  <span>{layer.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 bg-slate-950">
            <MapPanel
              cyclones={baseCyclones}
              track={scenario.track}
              timelineIndex={timelineIndex}
              showUncertainty={showUncertainty}
              showForecast={showForecast}
              showRiskZones={showRiskZones}
              height="460px"
            />
          </div>

          <div className="px-3.5 py-2.5 bg-slate-950 border-t border-slate-800/80">
            <TimelineControl timelineIndex={timelineIndex} onChange={onTimelineChange} />
          </div>
        </div>

        {/* Right Telemetry Column (4 cols) */}
        <div className="col-span-4 space-y-3 flex flex-col">
          {/* Selected Waypoint Telemetry */}
          <div className="card-panel">
            <div className="card-panel-header">
              <span className="text-[11px] font-mono font-bold text-cyan-400">
                WAYPOINT TELEMETRY // {currentPt.time}
              </span>
              <span className="badge-tag">
                {timelineIndex === 0 ? 'CURRENT' : `T+${timelineIndex * 6}H`}
              </span>
            </div>

            <div className="p-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="card-subwell">
                <div className="text-[10px] text-slate-400">COORDINATES</div>
                <div className="font-bold text-slate-200 mt-0.5">{currentPt.lat}°N, {currentPt.lon}°E</div>
              </div>
              <div className="card-subwell">
                <div className="text-[10px] text-slate-400">STAGE</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">{currentPt.intensity}</div>
              </div>
              <div className="card-subwell">
                <div className="text-[10px] text-slate-400">MAX WIND</div>
                <div className="font-bold text-amber-400 mt-0.5">{currentPt.windSpeed} km/h</div>
              </div>
              <div className="card-subwell">
                <div className="text-[10px] text-slate-400">CENTRAL PRESSURE</div>
                <div className="font-bold text-blue-400 mt-0.5">{currentPt.pressure} hPa</div>
              </div>
              <div className="col-span-2 card-subwell flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">POSITIONAL UNCERTAINTY</div>
                  <div className="font-bold text-slate-200">
                    {currentPt.uncertainty === 0 ? '±0 km (Observed)' : `±${currentPt.uncertainty} km (Ensemble Spread)`}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                  CONF: {Math.max(65, 95 - timelineIndex * 6)}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Forecast Waypoints Schedule */}
          <div className="card-panel flex-1 flex flex-col">
            <div className="card-panel-header">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                WAYPOINT SCHEDULE (CLICK TO SCRUB)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                5 POINTS
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs">
              {scenario.track.map((pt, i) => {
                const isSelected = i === timelineIndex;
                return (
                  <div
                    key={pt.time}
                    onClick={() => onTimelineChange(i)}
                    className="px-3 py-2 flex items-center justify-between cursor-pointer transition-colors"
                    style={{
                      background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #06b6d4' : '3px solid transparent',
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {pt.time}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({pt.lat}°N, {pt.lon}°E)
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {pt.intensity} • {pt.windSpeed} km/h
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-300 font-semibold">
                        {pt.pressure} hPa
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {pt.uncertainty === 0 ? 'FIX' : `±${pt.uncertainty} km`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Uncertainty Growth Breakdown */}
          <div className="card-panel">
            <div className="card-panel-header">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                ENSEMBLE SPREAD GROWTH (KM)
              </span>
              <span className="text-[10px] font-mono text-slate-400">90% CONE</span>
            </div>
            <div className="p-2.5 space-y-1.5 font-mono text-[11px]">
              {[
                { step: '+06h', error: 60, pct: 22 },
                { step: '+12h', error: 110, pct: 40 },
                { step: '+24h', error: 190, pct: 70 },
                { step: '+48h', error: 270, pct: 100 },
              ].map(bar => (
                <div key={bar.step} className="flex items-center gap-2">
                  <span className="w-8 text-slate-400 text-[10px]">{bar.step}:</span>
                  <div className="flex-1 h-2 bg-slate-900 rounded overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded bg-gradient-to-r from-cyan-500 to-amber-500"
                      style={{ width: `${bar.pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-slate-300 text-[10px] font-bold">
                    ±{bar.error} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
