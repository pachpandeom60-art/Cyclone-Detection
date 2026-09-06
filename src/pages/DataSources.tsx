import { Satellite, Wind, Thermometer, MapPin, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { dataSources } from '../data/mockData';

const ICONS: Record<string, typeof Satellite> = {
  Satellite, Wind, Thermometer, MapPin, Database,
};

export default function DataSources() {
  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Database size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 08 // MULTI-SOURCE METEOROLOGICAL DATA INGESTION PIPELINE
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              REAL-TIME SATELLITE & NUMERICAL WEATHER PREDICTION FEEDS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-live">5/5 FEEDS HEALTHY</span>
            <span className="badge-simulated">SIMULATED PIPELINE</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 font-mono text-xs border-t border-slate-800/80">
          <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">
            MULTI-SOURCE INGESTION ARCHITECTURE FLOW:
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {dataSources.map((src, i) => (
              <div key={src.id} className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                  {src.shortName}
                </span>
                {i < dataSources.length - 1 && (
                  <span className="text-slate-600 font-bold">+</span>
                )}
              </div>
            ))}
            <ArrowRight size={14} className="text-cyan-400 mx-1" />
            <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              Feature Synchronization Node
            </span>
            <ArrowRight size={14} className="text-cyan-400 mx-1" />
            <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
              AI Ensemble Models
            </span>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 gap-3">
        {dataSources.map(src => {
          const Icon = ICONS[src.icon] ?? Database;
          return (
            <div key={src.id} className="card-panel">
              <div className="card-panel-header">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Icon size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {src.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 ml-2">
                      [{src.shortName}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-bold flex items-center gap-1">
                    <CheckCircle2 size={11} /> {src.status}
                  </span>
                  <span className="badge-tag">
                    {src.type}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 grid grid-cols-4 gap-3 font-mono text-xs">
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">DESCRIPTION</div>
                  <div className="text-slate-200 font-semibold mt-0.5 truncate">{src.description}</div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">LAST SYNCED</div>
                  <div className="text-cyan-400 font-bold mt-0.5">{src.lastUpdate}</div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">VARIABLES / BANDS</div>
                  <div className="text-slate-200 font-semibold mt-0.5 truncate">{src.variables.join(', ')}</div>
                </div>
                <div className="card-subwell">
                  <div className="text-[10px] text-slate-400">LATENCY / PIPELINE TRANSIT</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{src.latency} (NOMINAL)</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
