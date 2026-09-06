import { useState } from 'react';
import { HelpCircle, X, ShieldCheck } from 'lucide-react';

interface WhyFactor {
  label: string;
  value: string;
  positive: boolean;
}

interface WhyButtonProps {
  title: string;
  factors: WhyFactor[];
  summary: string;
}

export default function WhyButton({ title, factors, summary }: WhyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary"
        title="View Explainable AI (XAI) feature attribution"
      >
        <HelpCircle size={12} className="text-cyan-400" />
        <span>Explainable AI</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div
            className="card-panel max-w-lg w-full shadow-2xl border-cyan-500/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="card-panel-header">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  EXPLAINABLE AI // MODEL REASONING & FEATURE ATTRIBUTION
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3 bg-slate-950">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">{title}</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">{summary}</p>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {factors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded border flex items-center justify-between"
                    style={{
                      background: f.positive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      borderColor: f.positive ? '#059669' : '#dc2626',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${f.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {f.positive ? '▲' : '▼'}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200 text-[11px]">{f.label}</div>
                        <div className="text-[10px] text-slate-400">{f.value}</div>
                      </div>
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: f.positive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: f.positive ? '#6ee7b7' : '#fca5a5',
                      }}
                    >
                      {f.positive ? 'FAVORABLE' : 'LIMITING'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                <strong>Prototype Transparency:</strong> Demonstrates SHAP (SHapley Additive exPlanations) attribution to ensure trust and accountability for operational meteorological forecasters.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
