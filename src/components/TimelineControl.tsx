import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimelineControlProps {
  timelineIndex: number;
  onChange: (index: number) => void;
  labels?: string[];
}

const defaultLabels = ['T+00h (NOW)', 'T+06h', 'T+12h', 'T+24h', 'T+36h', 'T+48h'];

export default function TimelineControl({ timelineIndex, onChange, labels = defaultLabels }: TimelineControlProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      onChange((timelineIndex + 1) % labels.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [playing, timelineIndex, labels.length, onChange]);

  return (
    <div className="flex flex-col gap-2 font-mono select-none">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 transition-colors"
            title={playing ? 'Pause Animation' : 'Play Timeline Progression'}
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChange(Math.max(0, timelineIndex - 1))}
              disabled={timelineIndex === 0}
              className="p-0.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30"
              title="Previous Step"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => onChange(Math.min(labels.length - 1, timelineIndex + 1))}
              disabled={timelineIndex === labels.length - 1}
              className="p-0.5 rounded text-slate-400 hover:text-slate-200 disabled:opacity-30"
              title="Next Step"
            >
              <ChevronRight size={13} />
            </button>
          </div>
          <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold">
            FORECAST TIMELINE HORIZON
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">ACTIVE TIMESTEP:</span>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
            {labels[timelineIndex]}
          </span>
        </div>
      </div>

      <div className="relative pt-1 pb-0.5">
        {/* Step Buttons */}
        <div className="flex justify-between items-center relative z-10">
          {labels.map((label, i) => {
            const isSelected = i === timelineIndex;
            const isPast = i < timelineIndex;
            return (
              <button
                key={label}
                onClick={() => onChange(i)}
                className="flex flex-col items-center gap-1 group transition-all"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full border transition-all"
                  style={{
                    background: isSelected ? '#06b6d4' : isPast ? '#0284c7' : '#0f172a',
                    borderColor: isSelected ? '#38bdf8' : isPast ? '#0369a1' : '#334155',
                    boxShadow: isSelected ? '0 0 8px #06b6d4' : 'none',
                    transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
                <span
                  className="text-[10px] tracking-tight transition-colors"
                  style={{
                    color: isSelected ? '#38bdf8' : isPast ? '#94a3b8' : '#64748b',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Connecting Progress Track */}
        <div className="absolute top-[9px] left-2 right-2 h-0.5 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
            style={{
              width: `${(timelineIndex / (labels.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
