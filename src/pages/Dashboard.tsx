import { useState, useEffect, useCallback } from 'react';
import {
  Wind, Activity, AlertTriangle, Satellite, Bell,
  MapPin, TrendingUp, Play, ChevronRight, Cpu,
  ScanSearch, ShieldAlert, CheckCircle2, RefreshCw
} from 'lucide-react';
import MapPanel from '../components/MapPanel';
import TimelineControl from '../components/TimelineControl';
import type { Scenario, Alert } from '../data/mockData';
import { baseCyclones, pipelineStages } from '../data/mockData';

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: '#059669' },
  MODERATE: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: '#d97706' },
  HIGH: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#dc2626' },
  EXTREME: { bg: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5', border: '#b91c1c' },
};

const stageIcons: Record<string, typeof Wind> = {
  Satellite, Cpu, ScanSearch, TrendingUp, Bell,
};

const DEMO_STEPS = [
  { label: 'Ingesting Multi-spectral INSAT-3D Infrared & Water Vapor bands', phase: 'INGEST' },
  { label: 'Pre-processing GFS & ERA5 atmospheric wind shear and SST soundings', phase: 'PREPROCESS' },
  { label: 'CNN Feature Extractor detects organized cyclonic vortex signature', phase: 'DETECTION' },
  { label: 'XGBoost Genesis Ensemble predicts 48h formation probability (>70%)', phase: 'GENESIS' },
  { label: 'Deep Learning Intensity Network computes wind speed & pressure decline', phase: 'INTENSITY' },
  { label: 'Bidirectional ConvLSTM forecasts WNW trajectory towards coast', phase: 'TRACK' },
  { label: 'Ensemble uncertainty cone & coastal threat envelope synthesized', phase: 'CONE' },
  { label: 'Multi-agency CAP-IN early warning alerts generated & dispatched', phase: 'DISPATCH' },
];

interface DashboardProps {
  scenario: Scenario;
  timelineIndex: number;
  onTimelineChange: (i: number) => void;
  alerts: Alert[];
}

export default function Dashboard({ scenario, timelineIndex, onTimelineChange, alerts }: DashboardProps) {
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [demoDone, setDemoDone] = useState(false);
  const [showUncertainty, setShowUncertainty] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [activePipeline, setActivePipeline] = useState<string | null>(null);

  const cy = { ...baseCyclones[0], ...scenario.cyclone };
  const currentTrackPt = scenario.track[timelineIndex] ?? scenario.track[0];
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;

  const runDemo = useCallback(() => {
    setDemoRunning(true);
    setDemoStep(0);
    setDemoDone(false);
  }, []);

  useEffect(() => {
    if (!demoRunning || demoStep < 0) return;
    if (demoStep >= DEMO_STEPS.length) {
      setDemoRunning(false);
      setDemoDone(true);
      return;
    }
    const t = setTimeout(() => setDemoStep(s => s + 1), 1100);
    return () => clearTimeout(t);
  }, [demoRunning, demoStep]);

  const pipelineDetail = activePipeline
    ? pipelineStages.find(s => s.id === activePipeline)?.detail
    : null;

  const rStyle = riskColors[cy.riskLevel] ?? riskColors.MODERATE;

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Tactical Operational Command Strip (Replaces generic SaaS hero) */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">
                ACTIVE MONITORING ZONE:
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                NORTH INDIAN OCEAN (BOB & ARB)
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>PRIMARY SYSTEM:</span>
              <span className="text-slate-200 font-bold">{cy.id}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{ background: rStyle.bg, color: rStyle.text, border: `1px solid ${rStyle.border}` }}
              >
                {cy.riskLevel} RISK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-simulated">
              PROTOTYPE SIMULATOR
            </span>
            <button
              onClick={runDemo}
              disabled={demoRunning}
              className="btn-primary"
            >
              <Play size={13} className={demoRunning ? 'animate-spin' : ''} />
              <span>{demoRunning ? 'Executing AI Inference Pipeline...' : 'Run Automated AI Pipeline Demo'}</span>
            </button>
          </div>
        </div>

        {/* Live Demo Execution Stream (If active) */}
        {(demoRunning || demoDone) && (
          <div
            className="p-3 border-t bg-slate-950/90 transition-all duration-200"
            style={{ borderColor: demoDone ? '#059669' : '#0284c7' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                {demoDone ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 font-bold">PIPELINE EXECUTION COMPLETE</span>
                    <span className="text-slate-500">— All 8 neural & rule modules synchronized</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="text-cyan-400 animate-spin" />
                    <span className="text-cyan-400 font-bold">ACTIVE INFERENCE PROGRESS</span>
                    <span className="text-slate-400">
                      Step {demoStep + 1} of {DEMO_STEPS.length}: {DEMO_STEPS[demoStep]?.phase}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => { setDemoRunning(false); setDemoDone(false); setDemoStep(-1); }}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800"
              >
                [Dismiss Stream]
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
              {DEMO_STEPS.map((step, idx) => {
                const isPast = idx < demoStep || demoDone;
                const isCurrent = idx === demoStep && !demoDone;
                return (
                  <div
                    key={idx}
                    className="p-1.5 rounded border transition-all"
                    style={{
                      background: isCurrent ? 'rgba(6, 182, 212, 0.12)' : isPast ? 'rgba(16, 185, 129, 0.08)' : '#070c18',
                      borderColor: isCurrent ? '#06b6d4' : isPast ? '#059669' : '#16233b',
                    }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-slate-400">PHASE {idx + 1}</span>
                      <span style={{ color: isCurrent ? '#38bdf8' : isPast ? '#34d399' : '#64748b' }}>
                        {isPast ? '✓ OK' : isCurrent ? '⟳ RUN' : 'WAIT'}
                      </span>
                    </div>
                    <div
                      className="truncate text-[10px]"
                      style={{ color: isCurrent ? '#f1f5f9' : isPast ? '#cbd5e1' : '#64748b' }}
                      title={step.label}
                    >
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* High-Density Operational KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            title: 'MONITORED SYSTEMS',
            value: '02',
            unit: 'CYCLONIC DISTURBANCES',
            sub: 'Bay of Bengal (Primary) + Arabian Sea',
            icon: Wind,
            color: '#06b6d4',
            badge: 'NOMINAL',
          },
          {
            title: 'GENESIS PROBABILITY (48H)',
            value: `${cy.genesisProbability}%`,
            unit: 'FORMATION RISK',
            sub: `${cy.id}: Threshold ${cy.genesisProbability > 60 ? 'EXCEEDED' : 'SUB-THRESHOLD'}`,
            icon: TrendingUp,
            color: '#f59e0b',
            badge: cy.genesisProbability > 60 ? 'WATCH' : 'LOW',
          },
          {
            title: 'COASTAL RISK SECTOR',
            value: '03',
            unit: 'DISTRICTS ON ALERT',
            sub: 'Visakhapatnam, Srikakulam, Puri',
            icon: MapPin,
            color: '#ef4444',
            badge: 'THREAT',
          },
          {
            title: 'DISPATCHED CAP ALERTS',
            value: String(activeAlerts),
            unit: 'UNACKNOWLEDGED',
            sub: `${alerts.length} Total Automated Warnings Dispatched`,
            icon: Bell,
            color: '#38bdf8',
            badge: 'ACTIVE',
          },
        ].map(card => (
          <div key={card.title} className="metric-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">
                {card.title}
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold"
                style={{
                  background: `${card.color}15`,
                  color: card.color,
                  borderColor: `${card.color}40`,
                }}
              >
                {card.badge}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-black font-mono tracking-tight" style={{ color: card.color }}>
                {card.value}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {card.unit}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 truncate pt-1 border-t border-slate-800/60 flex items-center justify-between">
              <span>{card.sub}</span>
              <card.icon size={13} className="text-slate-500 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Meteorological Workspace: Map + Telemetry Panel */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Central Map Workspace (8 cols) */}
        <div className="col-span-8 card-panel flex flex-col">
          {/* Map Header with Tactical Layers */}
          <div className="card-panel-header">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="status-dot status-dot-cyan"></span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  METEOROLOGICAL RADAR & TRACK DISPLAY
                </span>
              </div>
              <span className="badge-tag">
                BAY OF BENGAL
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { label: 'Forecast Track', active: showForecast, toggle: () => setShowForecast(v => !v) },
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

          {/* Leaflet Map Centerpiece */}
          <div className="relative flex-1 bg-slate-950">
            <MapPanel
              cyclones={baseCyclones}
              track={scenario.track}
              timelineIndex={timelineIndex}
              showUncertainty={showUncertainty}
              showForecast={showForecast}
              showRiskZones={showRiskZones}
              height="450px"
            />
          </div>

          {/* Precision Forecast Timeline Scrubber */}
          <div className="px-3.5 py-2.5 bg-slate-950 border-t border-slate-800/80">
            <TimelineControl timelineIndex={timelineIndex} onChange={onTimelineChange} />
          </div>
        </div>

        {/* Tactical Telemetry Readout (4 cols) */}
        <div className="col-span-4 flex flex-col gap-3">
          {/* Primary Cyclone Readout Card */}
          <div className="card-panel flex-1 flex flex-col">
            <div className="card-panel-header">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {cy.id}
                </span>
                <span className="text-[11px] text-slate-300 font-medium truncate">
                  {cy.name}
                </span>
              </div>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                style={{ background: rStyle.bg, color: rStyle.text, border: `1px solid ${rStyle.border}` }}
              >
                {cy.riskLevel} THREAT
              </span>
            </div>

            <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
              {/* Structured Key-Value Readout */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">CLASSIFICATION</div>
                  <div className="font-bold text-slate-200 truncate mt-0.5">{cy.classification}</div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">CENTER POSITION</div>
                  <div className="font-bold text-slate-200 mt-0.5">{cy.lat}°N, {cy.lon}°E</div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">MAX SUSTAINED WIND</div>
                  <div className="font-bold text-amber-400 mt-0.5">
                    {currentTrackPt?.windSpeed ?? cy.windSpeed} km/h
                  </div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">CENTRAL PRESSURE</div>
                  <div className="font-bold text-blue-400 mt-0.5">
                    {currentTrackPt?.pressure ?? cy.pressure} hPa
                  </div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">TRANSLATION VECTOR</div>
                  <div className="font-bold text-slate-200 truncate mt-0.5">{cy.movement}</div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">MODEL CONFIDENCE</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{cy.confidence}% (HIGH)</div>
                </div>
              </div>

              {/* Genesis Probability Gauge Bar */}
              <div className="card-subwell">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-slate-400">48H GENESIS PROBABILITY</span>
                  <span className="font-bold" style={{ color: rStyle.text }}>
                    {cy.genesisProbability}%
                  </span>
                </div>
                <div className="relative h-2 rounded bg-slate-900 overflow-hidden border border-slate-800">
                  {/* Threshold tick marks */}
                  <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-amber-500/60 z-10" title="Watch (60%)"></div>
                  <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-red-500/60 z-10" title="Alert (75%)"></div>
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${cy.genesisProbability}%`,
                      background: `linear-gradient(90deg, #0284c7, ${rStyle.text})`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                  <span>0% (BASELINE)</span>
                  <span className="text-amber-400">60% (WATCH)</span>
                  <span className="text-red-400">75% (ALERT)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Landfall & Coastal Proximity Alert */}
              <div className="px-2.5 py-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">ESTIMATED LANDFALL HORIZON:</div>
                  <div className="font-semibold text-slate-200">{cy.expectedLandfall}</div>
                </div>
                <ShieldAlert size={16} className="text-amber-400" />
              </div>
            </div>
          </div>

          {/* Secondary System Telemetry Card (Arabian Sea) */}
          <div className="card-panel">
            <div className="card-panel-header">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  CY-2026-08
                </span>
                <span className="text-[11px] text-slate-400">
                  Arabian Sea Disturbance
                </span>
              </div>
              <span className="badge-live">
                LOW RISK
              </span>
            </div>
            <div className="p-2.5 grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="text-center p-1.5 rounded bg-slate-950 border border-slate-900">
                <div className="text-[9px] text-slate-400">GENESIS</div>
                <div className="font-bold text-emerald-400">28%</div>
              </div>
              <div className="text-center p-1.5 rounded bg-slate-950 border border-slate-900">
                <div className="text-[9px] text-slate-400">WIND</div>
                <div className="font-bold text-slate-300">30 km/h</div>
              </div>
              <div className="text-center p-1.5 rounded bg-slate-950 border border-slate-900">
                <div className="text-[9px] text-slate-400">PRESSURE</div>
                <div className="font-bold text-slate-300">1008 hPa</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End-to-End AI Processing Pipeline Ribbon */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              AI FORECAST PROCESSING PIPELINE ARCHITECTURE
            </span>
            <span className="badge-tag">
              END-TO-END MODEL STACK
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click any module for architecture & weights breakdown
          </span>
        </div>

        <div className="p-3 bg-slate-950/60">
          <div className="flex items-center gap-1">
            {pipelineStages.map((stage, i) => {
              const Icon = stageIcons[stage.icon] ?? Satellite;
              const isActive = activePipeline === stage.id;
              return (
                <div key={stage.id} className="flex items-center flex-1">
                  <div
                    className={`pipeline-step ${isActive ? 'bg-cyan-950/40 border border-cyan-500/40' : ''}`}
                    onClick={() => setActivePipeline(isActive ? null : stage.id)}
                  >
                    <div
                      className="pipeline-step-icon"
                      style={{
                        borderColor: isActive ? '#06b6d4' : '#16233b',
                        background: isActive ? 'rgba(6, 182, 212, 0.15)' : '#070c18',
                      }}
                    >
                      <Icon size={15} style={{ color: isActive ? '#38bdf8' : '#94a3b8' }} />
                    </div>
                    <div className="text-center">
                      <div
                        className="text-[11px] font-mono font-bold leading-tight"
                        style={{ color: isActive ? '#38bdf8' : '#cbd5e1' }}
                      >
                        {stage.label}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                        {stage.sublabel}
                      </div>
                    </div>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <ChevronRight size={13} className="text-slate-600 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {pipelineDetail && (
            <div className="mt-3 p-3 rounded bg-slate-900 border border-cyan-500/30 animate-fadeIn font-mono">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold text-cyan-400">{pipelineDetail.title}</div>
                <span className="text-[10px] text-slate-400">[INFERENCE ACTIVE]</span>
              </div>
              <div className="text-xs text-slate-300 mb-2 font-sans">{pipelineDetail.description}</div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                {pipelineDetail.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-cyan-400">▸</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dispatched Early Warning Advisory Ticker */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              DISPATCHED EARLY WARNING BULLETINS (CAP-IN)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Automated alerts forwarded to State Disaster Management Authorities
          </span>
        </div>

        <div className="p-2.5 grid grid-cols-3 gap-2.5 font-mono text-xs">
          {alerts.slice(0, 3).map(alert => (
            <div
              key={alert.id}
              className="p-2.5 rounded border flex flex-col justify-between"
              style={{
                background: alert.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                borderColor: alert.severity === 'HIGH' ? '#dc2626' : '#d97706',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                    style={{
                      background: alert.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: alert.severity === 'HIGH' ? '#fca5a5' : '#fde68a',
                    }}
                  >
                    {alert.severity} SEVERITY
                  </span>
                  <span className="text-[10px] text-slate-400">{alert.time}</span>
                </div>
                <div className="font-semibold text-slate-200 leading-snug font-sans text-xs">
                  {alert.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Target: {alert.location}
                </div>
              </div>
              <div className="text-[10px] text-cyan-400 mt-2 pt-1 border-t border-slate-800/60">
                Action: {alert.action.slice(0, 48)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
