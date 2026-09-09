import { useState, useEffect } from 'react';
import { systemComponents as mockComponents } from '../data/mockData';
import { Server, CheckCircle2, AlertTriangle, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { fetchSystemHealth, fetchModelMetrics, SystemHealthResponse, ModelMetricsResponse } from '../services/api';

export default function SystemStatus() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadBackendStatus = async () => {
    setLoading(true);
    try {
      const h = await fetchSystemHealth();
      setHealth(h);
      const m = await fetchModelMetrics();
      setMetrics(m);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendStatus();
  }, []);

  const isLive = health?.status === 'healthy';
  const healthyCount = isLive ? mockComponents.length : mockComponents.length - 1;

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
            <span className={isLive ? 'badge-live' : 'badge-simulated'}>
              {isLive ? 'FASTAPI BACKEND ONLINE' : 'STANDALONE MODE'}
            </span>
            <button
              onClick={loadBackendStatus}
              disabled={loading}
              className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded hover:bg-slate-800 text-xs font-mono flex items-center gap-1"
            >
              <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 font-bold ${isLive ? 'text-emerald-400' : 'text-amber-400'}`}>
              <CheckCircle2 size={14} /> {isLive ? 'FASTAPI ENGINE ONLINE' : 'PYTHON BACKEND DISCONNECTED'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              MODEL: <strong className="text-cyan-400">{health?.model_type || 'Scikit-Learn Ensemble'}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              ACCURACY ROC-AUC: <strong className="text-emerald-400">{health?.roc_auc_accuracy ? `${(health.roc_auc_accuracy * 100).toFixed(1)}%` : '96.0%'}</strong>
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            HOST: http://localhost:8000
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
              {mockComponents.map(c => (
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
