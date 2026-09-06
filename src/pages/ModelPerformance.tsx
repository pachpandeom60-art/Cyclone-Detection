import { modelMetrics } from '../data/mockData';
import { BarChart3, AlertCircle, Zap, ScanSearch, Navigation, ShieldCheck } from 'lucide-react';

const MODEL_COLORS: Record<string, string> = {
  XGBoost: '#f59e0b',
  'ResNet18 / EfficientNet': '#38bdf8',
  'LSTM / ConvLSTM': '#06b6d4',
};

const MODEL_ICONS: Record<string, typeof Zap> = {
  XGBoost: Zap,
  'ResNet18 / EfficientNet': ScanSearch,
  'LSTM / ConvLSTM': Navigation,
};

export default function ModelPerformance() {
  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 09 // MODEL ARCHITECTURE & REFERENCE BENCHMARK METRICS
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              VALIDATION SUITE // NORTH INDIAN OCEAN CYCLONES (2000–2025)
            </span>
          </div>

          <span className="badge-simulated">
            LITERATURE BENCHMARKS
          </span>
        </div>

        <div className="p-3 bg-amber-950/20 border-t border-amber-500/30 flex items-start gap-2.5 text-xs font-mono text-amber-200">
          <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Benchmark Integrity Notice:</strong> All metrics below reflect published literature target benchmarks (IMD-RSMC historical test suites & peer-reviewed meteorological deep learning baselines). They demonstrate target operational standards for Smart India Hackathon Problem Statement 26070.
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-3 gap-3.5">
        {modelMetrics.map((model) => {
          const color = MODEL_COLORS[model.model] ?? '#94a3b8';
          const Icon = MODEL_ICONS[model.model] ?? Zap;

          return (
            <div key={model.model} className="card-panel flex flex-col justify-between">
              <div className="card-panel-header">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: `${color}20`, color }}
                  >
                    <Icon size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold" style={{ color }}>
                      {model.model}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {model.purpose}
                    </div>
                  </div>
                </div>
                <span className="badge-tag">READY</span>
              </div>

              <div className="p-3 space-y-3 flex-1 bg-slate-950 font-mono">
                {model.metrics.map(m => (
                  <div key={m.label} className="p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-slate-400 text-[11px]">{m.label}:</span>
                      <strong className="text-sm font-bold" style={{ color }}>
                        {m.value}{m.unit ? ` ${m.unit}` : ''}
                      </strong>
                    </div>

                    {m.unit === '%' && (
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(Number(m.value.replace('%', '')), 100)}%`,
                            background: color,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-2 bg-slate-950 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 text-center">
                Validated on INSAT-3D & ERA5 Reanalysis
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
