import { useState, useEffect } from 'react';
import { ScanSearch, CheckCircle, Cpu, Wind, ShieldCheck, RefreshCw, Crosshair } from 'lucide-react';
import type { Scenario } from '../data/mockData';

const AI_STEPS = [
  'Ingesting INSAT-3D Infrared & Water Vapor channels...',
  'Extracting multi-scale deep spatial vortex features...',
  'Evaluating convective cloud banding curvature...',
  'Running Convolutional Neural Network (CNN) classifier...',
  'Synthesizing detection confidence & center coordinates...',
];

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: '#059669' },
  MODERATE: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: '#d97706' },
  HIGH: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#dc2626' },
  EXTREME: { bg: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5', border: '#b91c1c' },
};

function SatelliteImage({ animating, confidence }: { animating: boolean; confidence: number }) {
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full" style={{ borderRadius: '0.375rem' }}>
      <defs>
        <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#081124" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>
        <radialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#cbd5e1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* Ocean background */}
      <rect width="400" height="280" fill="url(#oceanGrad)" />

      {/* Grid lines */}
      <line x1="100" y1="0" x2="100" y2="280" stroke="#0f1f3d" strokeWidth="0.8" strokeDasharray="4,4" />
      <line x1="200" y1="0" x2="200" y2="280" stroke="#0f1f3d" strokeWidth="0.8" strokeDasharray="4,4" />
      <line x1="300" y1="0" x2="300" y2="280" stroke="#0f1f3d" strokeWidth="0.8" strokeDasharray="4,4" />
      <line x1="0" y1="70" x2="400" y2="70" stroke="#0f1f3d" strokeWidth="0.8" strokeDasharray="4,4" />
      <line x1="0" y1="140" x2="400" y2="140" stroke="#0f1f3d" strokeWidth="0.8" strokeDasharray="4,4" />
      <line x1="0" y1="210" x2="400" y2="210" stroke="#0f1f3d" strokeWidth="0.8" strokeDasharray="4,4" />

      {/* Spiral cloud bands */}
      <g transform="translate(200, 140)">
        {[0, 1, 2, 3].map(ring => (
          <ellipse
            key={ring}
            rx={24 + ring * 32}
            ry={16 + ring * 22}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={ring === 0 ? 2 : 1.5 - ring * 0.2}
            strokeOpacity={0.65 - ring * 0.12}
            strokeDasharray={ring === 0 ? 'none' : `${10 + ring * 6},${5 + ring * 3}`}
            style={animating ? { animation: `spin-slow ${8 + ring * 2}s linear infinite` } : {}}
          />
        ))}

        {/* Central dense overcast */}
        <ellipse rx="32" ry="22" fill="url(#cloudGrad)" opacity="0.85" />

        {/* Cloud blobs */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const r = 48 + i * 4;
          return (
            <ellipse
              key={angle}
              cx={Math.cos(rad) * r}
              cy={Math.sin(rad) * r * 0.7}
              rx={20 + i * 2}
              ry={12 + i}
              fill="#e2e8f0"
              opacity={0.45 - i * 0.05}
            />
          );
        })}

        {/* Cyclone Eye Indicator */}
        <circle r="7" fill="#040814" opacity="0.95" />
        <circle r="3" fill="#06b6d4" opacity="0.9" />
      </g>

      {/* AI bounding box & crosshair */}
      {confidence > 0 && (
        <g>
          <rect
            x="95" y="55" width="210" height="170"
            fill="none" stroke="#06b6d4" strokeWidth="1.5"
            strokeDasharray="6,4" opacity="0.85"
          />
          {/* Corner brackets */}
          {[[95, 55], [305, 55], [95, 225], [305, 225]].map(([x, y], i) => (
            <g key={i}>
              <line x1={x} y1={y} x2={x + (i % 2 === 0 ? 14 : -14)} y2={y} stroke="#06b6d4" strokeWidth="2.5" />
              <line x1={x} y1={y} x2={x} y2={y + (i < 2 ? 14 : -14)} stroke="#06b6d4" strokeWidth="2.5" />
            </g>
          ))}
          {/* Center crosshair */}
          <line x1="192" y1="140" x2="208" y2="140" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="200" y1="132" x2="200" y2="148" stroke="#ef4444" strokeWidth="1.5" />
          <circle cx="200" cy="140" r="5" fill="none" stroke="#ef4444" strokeWidth="1.2" />

          {/* Confidence tag */}
          <rect x="100" y="60" width="105" height="18" fill="#06b6d4" rx="2" />
          <text x="152" y="73" textAnchor="middle" fill="#040711" fontSize="9" fontWeight="800" fontFamily="monospace">
            {confidence}% AI CONFIDENCE
          </text>
        </g>
      )}

      {/* Footnotes */}
      <text x="12" y="270" fill="#64748b" fontSize="9" fontFamily="monospace">INSAT-3D MULTISPECTRAL IR-1 (10.8 µm) // 08:30 IST</text>
      <text x="388" y="270" textAnchor="end" fill="#06b6d4" fontSize="9" fontFamily="monospace">EST. CENTER: 14.8°N, 87.2°E</text>
    </svg>
  );
}

import { baseCyclones } from '../data/mockData';

export default function CycloneDetection({ scenario }: { scenario: Scenario }) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [confidence, setConfidence] = useState(0);
  const [done, setDone] = useState(false);

  const cy = { ...baseCyclones[0], ...scenario.cyclone };

  const runAnalysis = () => {
    setRunning(true);
    setStep(0);
    setDone(false);
    setConfidence(0);
  };

  useEffect(() => {
    if (!running || step < 0) return;
    if (step >= AI_STEPS.length) {
      setDone(true);
      setRunning(false);
      setConfidence(91);
      return;
    }
    const t = setTimeout(() => setStep(s => s + 1), 850);
    return () => clearTimeout(t);
  }, [running, step]);

  const rStyle = riskColors[cy.riskLevel ?? 'MODERATE'] ?? riskColors.MODERATE;

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Module Title */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ScanSearch size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 03 // COMPUTER VISION CYCLONIC CIRCULATION DETECTION
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              CONVOLUTIONAL FEATURE EXTRACTION (RESNET-BACKBONE)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-live">MODEL READY</span>
            <span className="badge-simulated">SIMULATED INGEST</span>
          </div>
        </div>

        <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>SATELLITE PASS: <strong className="text-slate-200">INSAT-3D 10.8µm Thermal IR</strong></span>
            <span>MODEL: <strong className="text-cyan-400">CycloneNet-YOLOv8 + ResNet18</strong></span>
            <span>RESOLUTION: <strong className="text-slate-200">4 km Spatial / 30-min Refresh</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            DETECTION STATUS: <strong className={done ? 'text-emerald-400' : 'text-slate-400'}>{done ? 'CIRCULATION VERIFIED' : 'AWAITING INFERENCE'}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Satellite Image (8 cols) + Detection Telemetry (4 cols) */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Satellite Imagery View */}
        <div className="col-span-8 card-panel flex flex-col">
          <div className="card-panel-header">
            <div className="flex items-center gap-2">
              <Crosshair size={14} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                INSAT-3D SATELLITE IR IMAGERY WITH AI FEATURE BOUNDING
              </span>
            </div>

            <button
              onClick={runAnalysis}
              disabled={running}
              className="btn-primary"
            >
              <Cpu size={13} className={running ? 'animate-spin' : ''} />
              <span>{running ? 'Neural Feature Extraction...' : 'Execute AI Detection Model'}</span>
            </button>
          </div>

          <div className="relative flex-1 bg-slate-950 p-2.5 flex items-center justify-center">
            <SatelliteImage animating={running || done} confidence={done ? confidence : 0} />
          </div>

          {/* Inference Steps Bar */}
          {(running || done) && (
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 font-mono text-xs">
              <div className="flex items-center justify-between mb-1.5 text-[10px]">
                <span className="text-slate-400">PIPELINE EXECUTION LOG</span>
                <span className={done ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
                  {done ? '✓ INFERENCE COMPLETE' : `STEP ${step + 1} / ${AI_STEPS.length}`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-[10px]">
                {AI_STEPS.map((s, i) => {
                  const isDone = i < step || done;
                  const isCurrent = i === step && !done;
                  return (
                    <div
                      key={i}
                      className="p-1.5 rounded border truncate"
                      style={{
                        background: isCurrent ? 'rgba(6, 182, 212, 0.12)' : isDone ? 'rgba(16, 185, 129, 0.08)' : '#070c18',
                        borderColor: isCurrent ? '#06b6d4' : isDone ? '#059669' : '#16233b',
                        color: isCurrent ? '#38bdf8' : isDone ? '#34d399' : '#64748b',
                      }}
                      title={s}
                    >
                      {isDone ? '✓ ' : isCurrent ? '⟳ ' : '○ '}{s}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detection Telemetry & Result */}
        <div className="col-span-4 space-y-3 flex flex-col">
          <div className="card-panel flex-1 flex flex-col">
            <div className="card-panel-header">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                AI INFERENCE CLASSIFICATION
              </span>
              <span className="badge-tag">STATUS</span>
            </div>

            <div className="p-3 space-y-3 flex-1 flex flex-col justify-between font-mono text-xs bg-slate-950">
              {!done ? (
                <div className="text-center py-12 text-slate-500">
                  <ScanSearch size={32} className="mx-auto mb-2 opacity-30 text-cyan-400" />
                  <div className="text-slate-300 font-semibold text-xs">Awaiting Model Execution</div>
                  <div className="text-[11px] text-slate-400 mt-1">Click "Execute AI Detection Model" to detect circulation patterns.</div>
                </div>
              ) : (
                <>
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-emerald-400 font-bold text-xs">VORTEX SIGNATURE DETECTED</div>
                      <div className="text-[10px] text-slate-300">Organized cyclonic curvature identified</div>
                    </div>
                  </div>

                  <div className="card-subwell space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>DETECTION CONFIDENCE:</span>
                      <strong className="text-emerald-400">{confidence}%</strong>
                    </div>
                    <div className="h-2 rounded bg-slate-900 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { label: 'ESTIMATED STAGE', val: cy.classification ?? 'Low Pressure Area', color: '#f1f5f9' },
                      { label: 'VORTEX PATTERN', val: 'Curved cloud band (T1.5)', color: '#38bdf8' },
                      { label: 'CENTER COORDINATES', val: `${cy.lat}°N, ${cy.lon}°E`, color: '#f1f5f9' },
                      { label: 'THREAT CLASSIFICATION', val: cy.riskLevel ?? 'MODERATE', color: rStyle.text },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400">{row.label}:</span>
                        <strong className="text-xs" style={{ color: row.color }}>{row.val}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300">
                    Next Action: Trigger Genesis Prediction model to compute 48-hour development probability.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
