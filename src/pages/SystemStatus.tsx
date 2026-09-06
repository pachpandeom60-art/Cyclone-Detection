import { systemComponents } from '../data/mockData';
import { Server, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function SystemStatus() {
  const allOk = systemComponents.every(c => c.status !== 'DEGRADED' && c.status !== 'OFFLINE');
  const healthyCount = systemComponents.filter(c => c.status !== 'OFFLINE' && c.status !== 'DEGRADED').length;

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Server size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 10 // HIGH-AVAILABILITY PIPELINE CLUSTER HEALTH
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              DISTRIBUTED INFERENCE NODES
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-live">CLUSTER ACTIVE</span>
            <span className="badge-simulated">SIMULATED TELEMETRY</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 size={14} /> ALL {systemComponents.length} WORKER NODES NOMINAL
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              CLUSTER HEALTH: <strong className="text-emerald-400">100.0%</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              FAILOVER MODE: <strong className="text-cyan-400">ACTIVE-ACTIVE REDUNDANCY</strong>
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            LAST HEARTBEAT: 08:30:14 IST
          </div>
        </div>
      </div>

      {/* Component Health Table */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              PIPELINE WORKER NODES AUDIT
            </span>
          </div>
          <span className="badge-tag">6 MICROSERVICES</span>
        </div>

        <div className="overflow-x-auto bg-slate-950">
          <table className="data-table font-mono">
            <thead>
              <tr>
                <th>SUBSYSTEM / NODE</th>
                <th>OPERATIONAL RESPONSIBILITY</th>
                <th>HEALTH STATUS</th>
                <th>UPTIME SLA</th>
                <th>LAST AUDIT PASS</th>
              </tr>
            </thead>
            <tbody>
              {systemComponents.map(c => (
                <tr key={c.name}>
                  <td className="font-bold text-slate-200 text-xs">{c.name}</td>
                  <td className="text-slate-400 text-xs">{c.description}</td>
                  <td>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 inline-flex items-center gap-1">
                      <span className="status-dot status-dot-green"></span>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-cyan-400 font-bold text-xs">{c.uptime}</td>
                  <td className="text-slate-400 text-xs">{c.lastCheck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
