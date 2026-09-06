import { useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, MapPin, Radio, ShieldAlert, Send, Bell, CheckCircle2, FileText } from 'lucide-react';
import type { Alert } from '../data/mockData';

interface AlertsProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

const severityColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  HIGH: { bg: 'rgba(239, 68, 68, 0.08)', border: '#dc2626', text: '#fca5a5', badge: '#ef4444' },
  MEDIUM: { bg: 'rgba(245, 158, 11, 0.08)', border: '#d97706', text: '#fde68a', badge: '#f59e0b' },
  LOW: { bg: 'rgba(6, 182, 212, 0.08)', border: '#0284c7', text: '#bae6fd', badge: '#06b6d4' },
};

const ALERT_RULES = [
  { id: 'RULE-CAP-01', trigger: 'Genesis Probability > 60%', action: 'Dispatch Genesis Watch bulletin to SDMA', status: 'ACTIVE' },
  { id: 'RULE-CAP-02', trigger: 'Genesis Probability > 75%', action: 'Elevate to Cyclone Formation Alert', status: 'ACTIVE' },
  { id: 'RULE-CAP-03', trigger: 'Intensity Δ > 30 km/h in 24h', action: 'Trigger Rapid Intensification Warning', status: 'STANDBY' },
  { id: 'RULE-CAP-04', trigger: 'Trajectory within 200 km coast', action: 'Issue Coastal Threat & Port Warning Signal', status: 'ACTIVE' },
  { id: 'RULE-CAP-05', trigger: 'Ensemble uncertainty > 300 km', action: 'Broaden Advisory Threat Envelope', status: 'STANDBY' },
];

const CHANNELS = [
  { name: 'Common Alerting Protocol (CAP-IN)', status: 'OPERATIONAL', latency: '< 1.2s' },
  { name: 'National Disaster Response Force (NDRF) API', status: 'CONNECTED', latency: '< 0.8s' },
  { name: 'Coast Guard & Port Warning Relays', status: 'DISPATCHED', latency: '< 2.4s' },
  { name: 'Coastal District Collectors Network', status: 'SYNCED', latency: '< 1.5s' },
];

export default function Alerts({ alerts, onAcknowledge }: AlertsProps) {
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);
  const counts = {
    HIGH: alerts.filter(a => a.severity === 'HIGH').length,
    MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
    LOW: alerts.filter(a => a.severity === 'LOW').length,
  };

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Module Title & Operational Status */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 07 // DISASTER MANAGEMENT EARLY WARNING & CAP-IN DISPATCH CONSOLE
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              NDMA / SDMA INTEGRATION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-live">
              ALERT ENGINE ONLINE
            </span>
            <span className="badge-simulated">
              SIMULATED DISPATCH
            </span>
          </div>
        </div>

        <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>DISSEMINATION PROTOCOL: <strong className="text-slate-200">CAP-IN v1.2 (ITU-T X.1303)</strong></span>
            <span>TOTAL BULLETINS: <strong className="text-cyan-400">{alerts.length} Generated</strong></span>
            <span>PENDING ACKNOWLEDGEMENT: <strong className="text-amber-400">{alerts.filter(a => !a.acknowledged).length}</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            JURISDICTION: <strong className="text-slate-200">Odisha, Andhra Pradesh, West Bengal</strong>
          </div>
        </div>
      </div>

      {/* Priority Filter Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'ALL ADVISORIES', count: alerts.length, key: 'ALL' as const, color: '#94a3b8' },
          { label: 'CRITICAL (HIGH)', count: counts.HIGH, key: 'HIGH' as const, color: '#ef4444' },
          { label: 'CAUTIONARY (MEDIUM)', count: counts.MEDIUM, key: 'MEDIUM' as const, color: '#f59e0b' },
          { label: 'WATCH (LOW)', count: counts.LOW, key: 'LOW' as const, color: '#06b6d4' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => setFilter(item.key)}
            className="metric-card text-left transition-all font-mono"
            style={{
              borderColor: filter === item.key ? item.color : '#16233b',
              background: filter === item.key ? '#0d162d' : '#090f1f',
            }}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>{item.label}</span>
              {filter === item.key && <span className="text-[9px] text-cyan-400 font-bold">[SELECTED]</span>}
            </div>
            <div className="text-2xl font-black" style={{ color: item.color }}>
              {item.count}
            </div>
          </button>
        ))}
      </div>

      {/* Split Operations Workspace */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Active Bulletins (7 cols) */}
        <div className="col-span-7 card-panel flex flex-col">
          <div className="card-panel-header">
            <span className="text-[11px] font-mono font-bold text-slate-300">
              DISPATCHED EARLY WARNING BULLETINS ({filtered.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              CLICK ADVISORY FOR DETAILS & ACTIONS
            </span>
          </div>

          <div className="p-3 space-y-2.5 flex-1 bg-slate-950 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                <CheckCircle size={28} className="mx-auto mb-2 opacity-40 text-emerald-400" />
                No active bulletins in this filter tier.
              </div>
            ) : (
              filtered.map(alert => {
                const style = severityColors[alert.severity] ?? severityColors.MEDIUM;
                const expanded = expandedId === alert.id;

                return (
                  <div
                    key={alert.id}
                    onClick={() => setExpandedId(expanded ? null : alert.id)}
                    className="p-3 rounded border transition-all cursor-pointer"
                    style={{
                      background: alert.acknowledged ? '#070c18' : style.bg,
                      borderColor: alert.acknowledged ? '#1e293b' : style.border,
                      opacity: alert.acknowledged ? 0.7 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${style.badge}22`, color: style.text, border: `1px solid ${style.border}` }}
                        >
                          {alert.severity} PRIORITY
                        </span>
                        {alert.acknowledged ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                            ACKNOWLEDGED BY EOC
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-amber-400 animate-pulse">
                            ● PENDING EOC SIGN-OFF
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {alert.time}
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <div className="font-semibold text-slate-200 text-sm">
                        {alert.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                        <MapPin size={11} className="text-cyan-400" />
                        <span>Target: {alert.location}</span>
                        <span className="text-slate-600">|</span>
                        <span>Ref: {alert.systemId}</span>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 font-mono text-xs animate-fadeIn">
                        <div className="card-subwell">
                          <div className="text-[10px] text-slate-400">METEOROLOGICAL TRIGGER:</div>
                          <div className="text-slate-200 mt-0.5">{alert.reason}</div>
                        </div>

                        <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30">
                          <div className="text-[10px] text-cyan-400 font-bold">RECOMMENDED DISASTER MITIGATION DIRECTIVE:</div>
                          <div className="text-slate-200 mt-0.5 font-sans text-xs">{alert.action}</div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[10px] text-slate-400">
                            CAP Identifier: <span className="text-slate-300">urn:oid:2.49.0.0.356.alert-{alert.id}</span>
                          </div>

                          {!alert.acknowledged && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAcknowledge(alert.id);
                              }}
                              className="btn-primary text-xs"
                            >
                              <CheckCircle2 size={12} />
                              <span>Acknowledge Receipt</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rule Engine & Dissemination Network (5 cols) */}
        <div className="col-span-5 space-y-3.5 flex flex-col">
          {/* Automated Rule Matrix */}
          <div className="card-panel">
            <div className="card-panel-header">
              <div className="flex items-center gap-2">
                <ShieldAlert size={13} className="text-cyan-400" />
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  AUTOMATED RULE DECISION MATRIX
                </span>
              </div>
              <span className="badge-tag">EXPLAINABLE AI</span>
            </div>

            <div className="p-2.5 space-y-2 bg-slate-950 text-xs font-mono">
              {ALERT_RULES.map(rule => (
                <div key={rule.id} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-cyan-400 font-bold">{rule.id}</span>
                    <span className={`text-[9px] font-bold px-1 rounded ${rule.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {rule.status}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    <span className="text-slate-400">IF: </span>{rule.trigger}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    <span className="text-cyan-400">THEN: </span>{rule.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dissemination Infrastructure Status */}
          <div className="card-panel">
            <div className="card-panel-header">
              <div className="flex items-center gap-2">
                <Radio size={13} className="text-cyan-400" />
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  EMERGENCY DISSEMINATION RELAYS
                </span>
              </div>
              <span className="badge-live">LIVE MOCK</span>
            </div>

            <div className="p-2.5 space-y-1.5 bg-slate-950 text-xs font-mono">
              {CHANNELS.map(ch => (
                <div key={ch.name} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                  <div>
                    <div className="text-slate-200 text-[11px] font-medium">{ch.name}</div>
                    <div className="text-[9px] text-slate-400">Transit latency: {ch.latency}</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    {ch.status}
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
