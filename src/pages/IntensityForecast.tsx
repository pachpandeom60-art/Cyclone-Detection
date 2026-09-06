import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import WhyButton from '../components/WhyButton';
import type { Scenario } from '../data/mockData';
import { TrendingUp, Activity, Gauge, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Low Pressure Area': { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', border: '#475569' },
  'Area of Interest': { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', border: '#475569' },
  'Tropical Disturbance': { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: '#64748b' },
  'Depression': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#2563eb' },
  'Deep Depression': { bg: 'rgba(37, 99, 235, 0.2)', text: '#93c5fd', border: '#1d4ed8' },
  'Cyclonic Storm': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '#d97706' },
  'Severe Cyclonic Storm': { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#dc2626' },
  'Very Severe Cyclonic Storm': { bg: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5', border: '#b91c1c' },
  'Extremely Severe Cyclonic Storm': { bg: 'rgba(153, 27, 27, 0.25)', text: '#fecaca', border: '#7f1d1d' },
  'Cyclonic Storm (Weakening)': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fde68a', border: '#d97706' },
  'Dissipating': { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8', border: '#475569' },
};

const IMD_SCALE = [
  { name: 'Low Pressure Area', wind: '< 31 km/h', pressure: '> 1004 hPa' },
  { name: 'Depression', wind: '31–49 km/h', pressure: '1000–1004 hPa' },
  { name: 'Deep Depression', wind: '50–61 km/h', pressure: '996–1000 hPa' },
  { name: 'Cyclonic Storm', wind: '62–88 km/h', pressure: '988–996 hPa' },
  { name: 'Severe Cyclonic Storm', wind: '89–117 km/h', pressure: '978–988 hPa' },
  { name: 'Very Severe CS', wind: '118–166 km/h', pressure: '950–978 hPa' },
];

const INTENSITY_FACTORS = [
  { label: 'Sea Surface Temperature', value: '29.1°C — High ocean thermal energy pool', positive: true },
  { label: 'Ocean Heat Content (OHC)', value: '85 kJ/cm² — Deep warm mixed layer', positive: true },
  { label: 'Low-level moisture convergence', value: 'Strong inflow at 850 hPa from SW monsoon', positive: true },
  { label: 'Upper-tropospheric divergence', value: 'Favorable radial outflow at 200 hPa', positive: true },
  { label: 'Vertical Wind Shear (VWS)', value: '12.4 m/s — Moderate shear acts as dampener', positive: false },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-xs font-mono shadow-xl">
        <div className="font-bold text-slate-300 mb-1 border-b border-slate-800 pb-0.5">{label} Prediction</div>
        {payload.map((p, i) => (
          <div key={i} className="flex justify-between gap-3 text-[11px]" style={{ color: p.color }}>
            <span>{p.name}:</span>
            <strong>{p.value} {p.name.includes('Wind') ? 'km/h' : 'hPa'}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

import { baseCyclones } from '../data/mockData';

export default function IntensityForecast({ scenario }: { scenario: Scenario }) {
  const cy = { ...baseCyclones[0], ...scenario.cyclone };
  const forecast = scenario.intensityForecast;
  const peakForecast = [...forecast].sort((a, b) => b.windSpeed - a.windSpeed)[0] ?? forecast[0];

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Module Title & Operational Status */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 05 // CYCLONE INTENSITY & RAPID INTENSIFICATION FORECAST
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              TARGET: <strong className="text-slate-200">{cy.id}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-simulated">
              SIMULATED PREDICTION
            </span>
            <WhyButton
              title="Explainable AI: Intensity Drivers"
              summary="Deep convolutional regression networks (ResNet-18 + EfficientNet-B2) integrate satellite cloud pattern symmetry with atmospheric thermal soundings."
              factors={INTENSITY_FACTORS}
            />
          </div>
        </div>

        <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>CURRENT STAGE: <strong className="text-slate-200">{cy.classification}</strong></span>
            <span>PEAK 48H ESTIMATE: <strong className="text-amber-400">{peakForecast.windSpeed} km/h ({peakForecast.category})</strong></span>
            <span>RAPID INTENSIFICATION: <strong className="text-cyan-400">UNLIKELY (18% INDEX)</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            FRAMEWORK: <strong className="text-slate-200">IMD 3-Minute Average Wind Scale</strong>
          </div>
        </div>
      </div>

      {/* Split View: Table (7 cols) + IMD Progression Scale (5 cols) */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Intensity Table */}
        <div className="col-span-7 card-panel flex flex-col">
          <div className="card-panel-header">
            <div className="flex items-center gap-2">
              <Gauge size={13} className="text-cyan-400" />
              <span className="text-[11px] font-mono font-bold text-slate-300">
                48-HOUR INTENSITY TRAJECTORY SCHEDULE
              </span>
            </div>
            <span className="badge-tag">MODEL: RESNET-18 / DVO</span>
          </div>

          <div className="overflow-x-auto flex-1 bg-slate-950">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TIMESTEP</th>
                  <th>SUSTAINED WIND</th>
                  <th>CENTRAL PRESSURE</th>
                  <th>IMD CATEGORY</th>
                  <th>INTENSITY DELTA</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((pt, i) => {
                  const prev = forecast[i - 1];
                  const windDelta = prev ? pt.windSpeed - prev.windSpeed : 0;
                  const cStyle = CATEGORY_COLORS[pt.category] ?? CATEGORY_COLORS['Low Pressure Area'];

                  return (
                    <tr key={pt.time}>
                      <td className="font-mono font-bold text-cyan-400">
                        {pt.time}
                      </td>
                      <td className="font-mono font-bold text-amber-400">
                        {pt.windSpeed} km/h
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({Math.round(pt.windSpeed / 1.852)} kt)
                        </span>
                      </td>
                      <td className="font-mono font-bold text-blue-400">
                        {pt.pressure} hPa
                      </td>
                      <td>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold whitespace-nowrap"
                          style={{
                            background: cStyle.bg,
                            color: cStyle.text,
                            border: `1px solid ${cStyle.border}`,
                          }}
                        >
                          {pt.category}
                        </span>
                      </td>
                      <td className="font-mono text-[11px]">
                        {i === 0 ? (
                          <span className="text-slate-400">BASELINE</span>
                        ) : (
                          <span className={`flex items-center gap-1 ${windDelta > 0 ? 'text-rose-400 font-bold' : windDelta < 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                            {windDelta > 0 ? (
                              <>
                                <ArrowUpRight size={12} />
                                <span>+{windDelta} km/h</span>
                              </>
                            ) : windDelta < 0 ? (
                              <>
                                <ArrowDownRight size={12} />
                                <span>{windDelta} km/h</span>
                              </>
                            ) : (
                              <span>STEADY</span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-2 bg-slate-950 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Dvorak T-Number Approximation: T1.5 (Now) → T3.0 (Peak)</span>
            <span>Simulated Output for Evaluation</span>
          </div>
        </div>

        {/* IMD Cyclone Classification Progression */}
        <div className="col-span-5 card-panel flex flex-col justify-between">
          <div className="card-panel-header">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-cyan-400" />
              <span className="text-[11px] font-mono font-bold text-slate-300">
                IMD STAGE PROGRESSION REFERENCE
              </span>
            </div>
            <span className="badge-tag">RSMC STANDARD</span>
          </div>

          <div className="p-3 space-y-2 flex-1 bg-slate-950/40 font-mono">
            {IMD_SCALE.map((stage, idx) => {
              const isCurrent = (cy.classification ?? '').toLowerCase().includes(stage.name.toLowerCase());
              const isPeak = peakForecast.category.toLowerCase().includes(stage.name.toLowerCase());

              return (
                <div
                  key={stage.name}
                  className="p-2 rounded border flex items-center justify-between text-xs transition-all"
                  style={{
                    background: isCurrent ? 'rgba(6, 182, 212, 0.12)' : isPeak ? 'rgba(245, 158, 11, 0.12)' : '#070c18',
                    borderColor: isCurrent ? '#06b6d4' : isPeak ? '#f59e0b' : '#16233b',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200 text-[11px]">
                        {stage.name}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {stage.wind} • {stage.pressure}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        NOW
                      </span>
                    )}
                    {isPeak && !isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                        PEAK (+36H)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2 bg-slate-950 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 text-center">
            Standard India Meteorological Department (IMD) Classification
          </div>
        </div>
      </div>

      {/* Synchronized Twin Forecast Charts */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Chart 1: Maximum Sustained Wind Speed */}
        <div className="card-panel">
          <div className="card-panel-header">
            <span className="text-[11px] font-mono font-bold text-slate-300">
              MAXIMUM SUSTAINED SURFACE WIND (KM/H)
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="text-amber-400 font-bold">● WIND SPEED</span>
            </div>
          </div>
          <div className="p-3 bg-slate-950">
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={forecast} margin={{ top: 10, right: 25, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16233b" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} unit=" km/h" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={62} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'CS (62)', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }} />
                <ReferenceLine y={89} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SCS (89)', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />
                <Line
                  type="monotone"
                  name="Wind Speed"
                  dataKey="windSpeed"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4, stroke: '#060a14' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Central Atmospheric Pressure (Inverted) */}
        <div className="card-panel">
          <div className="card-panel-header">
            <span className="text-[11px] font-mono font-bold text-slate-300">
              ESTIMATED CENTRAL PRESSURE (HPA)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              [↓ INVERTED: LOWER PRESSURE = STRONGER STORM]
            </span>
          </div>
          <div className="p-3 bg-slate-950">
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={forecast} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16233b" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis
                  reversed={true}
                  domain={['dataMax + 2', 'dataMin - 2']}
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                  unit=" hPa"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  name="Central Pressure"
                  dataKey="pressure"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ fill: '#38bdf8', r: 4, stroke: '#060a14' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
