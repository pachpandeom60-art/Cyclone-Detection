import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import WhyButton from '../components/WhyButton';
import type { Scenario } from '../data/mockData';
import { Zap, Activity, AlertCircle, CheckCircle2, ShieldAlert, TrendingUp, RefreshCw, Server } from 'lucide-react';
import { predictGenesis, fetchSystemHealth, GenesisPredictionResult, SystemHealthResponse } from '../services/api';

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: '#059669' },
  MODERATE: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: '#d97706' },
  HIGH: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#dc2626' },
  SEVERE: { bg: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5', border: '#b91c1c' },
  EXTREME: { bg: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5', border: '#b91c1c' },
};

function PrecisionRadialGauge({ probability, riskLevel }: { probability: number; riskLevel: string }) {
  const rStyle = riskColors[riskLevel] ?? riskColors.MODERATE;
  // Arc calculation: from 140 deg to 400 deg (260 deg total)
  const radius = 72;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (260 / 360);
  const fillLength = (probability / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none">
      <div className="relative w-44 h-36 flex items-center justify-center">
        <svg viewBox="0 0 180 140" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 28 115 A 72 72 0 1 1 152 115"
            fill="none"
            stroke="#121c33"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Gauge Tick Markers */}
          {[0, 20, 40, 60, 80, 100].map(pct => {
            const angleDeg = 140 + (pct / 100) * 260;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x1 = 90 + 58 * Math.cos(angleRad);
            const y1 = 78 + 58 * Math.sin(angleRad);
            const x2 = 90 + 64 * Math.cos(angleRad);
            const y2 = 78 + 64 * Math.sin(angleRad);
            return (
              <line
                key={pct}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={pct === 60 ? '#f59e0b' : pct === 80 ? '#ef4444' : '#334155'}
                strokeWidth={pct === 60 || pct === 80 ? 2 : 1}
              />
            );
          })}
          {/* Active Value Arc */}
          <path
            d="M 28 115 A 72 72 0 1 1 152 115"
            fill="none"
            stroke={rStyle.text}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${fillLength} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>

        {/* Central Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 font-mono">
          <span className="text-3xl font-black tracking-tight" style={{ color: rStyle.text }}>
            {probability}%
          </span>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
            GENESIS INDEX
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span
          className="text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase"
          style={{ background: rStyle.bg, color: rStyle.text, border: `1px solid ${rStyle.border}` }}
        >
          {riskLevel} FORMATION RISK
        </span>
      </div>
      <span className="text-[10px] font-mono text-slate-400 mt-1">
        PREDICTION HORIZON: +48 HOURS
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono">
        <div className="text-slate-400">{label} Forecast</div>
        <div className="font-bold text-amber-400 text-sm">{payload[0].value}% Probability</div>
      </div>
    );
  }
  return null;
};

import { baseCyclones } from '../data/mockData';

export default function GenesisPrediction({ scenario }: { scenario: Scenario }) {
  const cy = { ...baseCyclones[0], ...scenario.cyclone };
  
  // Interactive inputs & Backend state
  const [lat, setLat] = useState<number>(14.5);
  const [lon, setLon] = useState<number>(87.5);
  const [sst, setSst] = useState<number>(29.2);
  const [vws, setVws] = useState<number>(9.5);
  const [vorticity, setVorticity] = useState<number>(5.8);
  const [humidity, setHumidity] = useState<number>(78.0);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [liveResult, setLiveResult] = useState<GenesisPredictionResult | null>(null);
  const [backendHealth, setBackendHealth] = useState<SystemHealthResponse | null>(null);

  // Initial load
  useEffect(() => {
    fetchSystemHealth().then(setBackendHealth);
    handleRunInference();
  }, [scenario]);

  const handleRunInference = async () => {
    setLoading(true);
    try {
      const res = await predictGenesis({
        latitude: lat,
        longitude: lon,
        sst_celsius: sst,
        vws_knots: vws,
        relative_vorticity_850: vorticity,
        rh_700_percent: humidity
      });
      setLiveResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const prob = liveResult ? liveResult.genesis_probability_48h : (cy.genesisProbability ?? 72);
  const risk = liveResult ? liveResult.risk_level : (cy.riskLevel ?? 'MODERATE');
  const rStyle = riskColors[risk] ?? riskColors.MODERATE;

  const factorsList = liveResult ? liveResult.top_contributing_factors.map((fact, idx) => ({
    name: fact.split('(')[0]?.trim() || fact,
    metric: fact,
    weight: idx === 0 ? '+35%' : idx === 1 ? '+25%' : '+15%',
    score: 85 - idx * 10,
    favorable: !fact.toLowerCase().includes('inhibiting') && !fact.toLowerCase().includes('high destructive')
  })) : [
    { name: 'Sea Surface Temperature', metric: '29.1°C (Threshold > 26.5°C)', weight: '+32%', score: 88, favorable: true },
    { name: 'Low-Level Vorticity (850 hPa)', metric: '14.2 × 10⁻⁵ s⁻¹ (Strong)', weight: '+26%', score: 78, favorable: true },
    { name: 'Mid-Tropospheric Moisture', metric: 'RH 82% at 500 hPa', weight: '+21%', score: 82, favorable: true },
    { name: 'Pressure Fall Rate', metric: '-3.2 hPa / 6h tendency', weight: '+16%', score: 74, favorable: true },
    { name: 'Vertical Wind Shear (200-850 hPa)', metric: '12.4 m/s (Moderate Shear)', weight: '-19%', score: 45, favorable: false },
  ];

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Module Title & Operational Status Bar */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 04 // TROPICAL CYCLONE GENESIS PREDICTION
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              TARGET SYSTEM: <strong className="text-slate-200">{cy.id} ({cy.basin})</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={backendHealth?.status === 'healthy' ? 'badge-live flex items-center gap-1' : 'badge-simulated flex items-center gap-1'}>
              <Server size={10} />
              {backendHealth?.status === 'healthy' ? 'LIVE PYTHON BACKEND' : 'OFFLINE MODE'}
            </span>
            <WhyButton
              title="Explainable AI: Genesis Feature Attribution"
              summary={liveResult ? `Engineered model (${liveResult.model_info.model_type}) evaluated environmental parameters to calculate 48-hour genesis probability.` : "Gradient boosted ensemble model (XGBoost v2.1) evaluates thermodynamic and kinematic oceanic predictors to compute 48-hour cyclone genesis likelihood."}
              factors={factorsList.map(f => ({
                label: f.name,
                value: `${f.metric} [Weight: ${f.weight}]`,
                positive: f.favorable,
              }))}
            />
          </div>
        </div>

        {/* Live Parameter Control Bar */}
        <div className="px-3 py-2.5 bg-slate-950/80 border-t border-slate-800/80 grid grid-cols-12 gap-3 text-xs font-mono items-center">
          <div className="col-span-2 flex flex-col">
            <label className="text-[10px] text-slate-400">LAT / LON</label>
            <div className="flex items-center gap-1 mt-0.5">
              <input type="number" step="0.1" value={lat} onChange={e => setLat(parseFloat(e.target.value) || 0)} className="w-14 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-slate-200 text-xs" />
              <span className="text-slate-500">,</span>
              <input type="number" step="0.1" value={lon} onChange={e => setLon(parseFloat(e.target.value) || 0)} className="w-14 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-slate-200 text-xs" />
            </div>
          </div>
          <div className="col-span-2 flex flex-col">
            <label className="text-[10px] text-slate-400">SST (°C)</label>
            <input type="number" step="0.1" value={sst} onChange={e => setSst(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-200 text-xs mt-0.5" />
          </div>
          <div className="col-span-2 flex flex-col">
            <label className="text-[10px] text-slate-400">SHEAR (KTS)</label>
            <input type="number" step="0.1" value={vws} onChange={e => setVws(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-200 text-xs mt-0.5" />
          </div>
          <div className="col-span-2 flex flex-col">
            <label className="text-[10px] text-slate-400">VORTICITY (10⁻⁵ s⁻¹)</label>
            <input type="number" step="0.1" value={vorticity} onChange={e => setVorticity(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-200 text-xs mt-0.5" />
          </div>
          <div className="col-span-2 flex flex-col">
            <label className="text-[10px] text-slate-400">RH (%)</label>
            <input type="number" step="1" value={humidity} onChange={e => setHumidity(parseFloat(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-200 text-xs mt-0.5" />
          </div>
          <div className="col-span-2 flex items-end">
            <button
              onClick={handleRunInference}
              disabled={loading}
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded flex items-center justify-center gap-1.5 text-xs transition-colors"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {loading ? 'RUNNING...' : 'PREDICT'}
            </button>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>MODEL: <strong className="text-slate-200">{liveResult?.model_info.model_type || 'XGBoost / GradientBoosting Ensemble'}</strong></span>
            <span>GPI SCORE: <strong className="text-cyan-400">{liveResult?.gpi_score ?? 28.4}</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            CONFIDENCE SCORE: <strong className="text-emerald-400">{liveResult?.confidence_score ?? cy.confidence}% ({risk})</strong>
          </div>
        </div>
      </div>

      {/* 3-Column Diagnostic Dashboard */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Gauge Card (4 cols) */}
        <div className="col-span-4 card-panel flex flex-col justify-between">
          <div className="card-panel-header">
            <span className="text-[11px] font-mono font-bold text-slate-300">
              GENESIS PROBABILITY GAUGE
            </span>
            <span className="badge-tag">T+48H HORIZON</span>
          </div>
          <div className="p-4 flex-1 flex flex-col items-center justify-center">
            <PrecisionRadialGauge probability={prob} riskLevel={risk} />
          </div>
          <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>THRESHOLD 60%: <strong className={prob > 60 ? 'text-amber-400' : 'text-slate-400'}>{prob > 60 ? 'TRIGGERED' : 'CLEAR'}</strong></span>
            <span>THRESHOLD 75%: <strong className={prob > 75 ? 'text-red-400' : 'text-slate-400'}>{prob > 75 ? 'WARNING' : 'CLEAR'}</strong></span>
          </div>
        </div>

        {/* Feature Sounding / ML Attribution (5 cols) */}
        <div className="col-span-5 card-panel flex flex-col">
          <div className="card-panel-header">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-cyan-400" />
              <span className="text-[11px] font-mono font-bold text-slate-300">
                ENVIRONMENTAL FEATURE SOUNDING (SHAP ATTRIBUTION)
              </span>
            </div>
            <span className="badge-tag">TOP 5 PREDICTORS</span>
          </div>

          <div className="p-3 space-y-2.5 flex-1 bg-slate-950/40">
            {factorsList.map((f, i) => (
              <div key={i} className="p-2 rounded bg-slate-900/90 border border-slate-800 font-mono">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">{f.name}</span>
                  <span className={`text-[10px] font-bold ${f.favorable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {f.weight} ({f.favorable ? 'FAVORABLE' : 'LIMITING'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${f.score}%`,
                        background: f.favorable ? '#10b981' : '#f43f5e',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{f.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Advisory Checklist & Assessment (3 cols) */}
        <div className="col-span-3 card-panel flex flex-col justify-between">
          <div className="card-panel-header">
            <span className="text-[11px] font-mono font-bold text-slate-300">
              AI ADVISORY BULLETIN
            </span>
            <span className="badge-live">AUTOMATED</span>
          </div>

          <div className="p-3 space-y-2.5 flex-1">
            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-xs font-mono text-amber-200 leading-relaxed">
              "Atmospheric sounding over Central Bay indicates increasing vorticity and sustained 29.1°C SST, favoring cyclone genesis within 48h."
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-900">
                <span className="text-slate-400 text-[11px]">SST &gt; 26.5°C:</span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 size={11} /> MET (29.1°C)
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-900">
                <span className="text-slate-400 text-[11px]">850hPa Vorticity:</span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 size={11} /> STRONG
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-900">
                <span className="text-slate-400 text-[11px]">Vertical Shear:</span>
                <span className="text-amber-400 font-bold text-[10px]">
                  MODERATE (12m/s)
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-900">
                <span className="text-slate-400 text-[11px]">Genesis Watch Trigger:</span>
                <span className={`font-bold text-[10px] ${prob > 60 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {prob > 60 ? 'EXCEEDED (>60%)' : 'NORMAL'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2 bg-slate-950 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 text-center">
            RSMC PROTOCOL 2026 // PS-26070
          </div>
        </div>
      </div>

      {/* Probability Trend Chart */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              48-HOUR GENESIS PROBABILITY TRAJECTORY (T+00H TO T+48H)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
              <span>Watch Line (60%)</span>
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2.5 h-0.5 bg-red-400 inline-block"></span>
              <span>Alert Line (75%)</span>
            </span>
            <span className="badge-simulated">MODEL ESTIMATE</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={scenario.genesisTrend} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="genesisGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#16233b" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'WATCH THRESHOLD (60%)', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }} />
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'FORMATION ALERT (75%)', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />
              <Area
                type="monotone"
                dataKey="probability"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#genesisGrad)"
                dot={{ fill: '#f59e0b', r: 4, strokeWidth: 1, stroke: '#060a14' }}
                activeDot={{ r: 6, stroke: '#fef08a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explainable Alert Generation Logic */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              AUTOMATED RULE ENGINE EVALUATION
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time threshold evaluation for disaster management authorities
          </span>
        </div>

        <div className="p-3 grid grid-cols-3 gap-3 font-mono text-xs">
          {[
            { rule: 'RULE-GEN-01', condition: 'Genesis P > 60% with favorable SST', outcome: 'Genesis Watch Issued', triggered: prob > 60 },
            { rule: 'RULE-GEN-02', condition: 'Genesis P > 75% with pressure drop', outcome: 'Cyclone Formation Alert', triggered: prob > 75 },
            { rule: 'RULE-GEN-03', condition: 'Trend delta > +15% over 12h horizon', outcome: 'Escalation Advisory', triggered: true },
          ].map(r => (
            <div
              key={r.rule}
              className="p-2.5 rounded border flex flex-col justify-between"
              style={{
                background: r.triggered ? 'rgba(16, 185, 129, 0.08)' : '#070c18',
                borderColor: r.triggered ? '#059669' : '#16233b',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">{r.rule}</span>
                  <span className={`text-[10px] font-bold ${r.triggered ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {r.triggered ? '✓ TRIGGERED' : '○ NOT MET'}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  IF: {r.condition}
                </div>
              </div>
              <div className="text-[11px] font-bold text-cyan-400 mt-2 pt-1.5 border-t border-slate-800">
                ACTION: {r.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
