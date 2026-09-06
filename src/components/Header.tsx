import { RefreshCw, ChevronDown, Radio, Clock } from 'lucide-react';
import { useState } from 'react';
import { scenarios } from '../data/mockData';
import type { ScenarioKey } from '../data/mockData';

interface HeaderProps {
  sidebarOpen: boolean;
  activeScenario: ScenarioKey;
  onScenarioChange: (key: ScenarioKey) => void;
}

export default function Header({ activeScenario, onScenarioChange }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const activeScen = scenarios.find(s => s.key === activeScenario);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
      style={{ background: '#070c18', borderColor: '#16233b', zIndex: 30 }}
    >
      {/* Left: Agency branding & Prototype disclaimer */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            CYCLONE AI
          </span>
          <span className="text-[10px] text-slate-500 font-mono">|</span>
          <span className="text-[11px] text-slate-400 font-medium">
            RSMC Early Warning Division
          </span>
        </div>
        <span className="badge-prototype">
          SIH 2026 • SIMULATED PROTOTYPE
        </span>
      </div>

      {/* Center: Scenario switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-1 rounded border text-xs transition-all hover:border-slate-600"
          style={{ background: '#0b1222', borderColor: '#16233b', color: '#cbd5e1' }}
          title="Select test meteorological scenario"
        >
          <Radio size={11} className="text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wide">
            TEST SCENARIO:
          </span>
          <span className="font-medium text-slate-200 max-w-64 truncate">
            {activeScen?.label}
          </span>
          <ChevronDown size={12} className="text-slate-400 ml-0.5" />
        </button>

        {dropdownOpen && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 rounded-md border py-1 z-50 w-80 shadow-2xl"
            style={{ background: '#090f1f', borderColor: '#1e2d4a' }}
          >
            <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Select Demonstration Dataset
            </div>
            {scenarios.map(s => (
              <button
                key={s.key}
                onClick={() => { onScenarioChange(s.key); setDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/60 transition-colors flex flex-col gap-0.5"
                style={{
                  background: s.key === activeScenario ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                  borderLeft: s.key === activeScenario ? '3px solid #06b6d4' : '3px solid transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${s.key === activeScenario ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {s.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {s.key === 'early' ? 'LOW' : s.key === 'rapid' ? 'MOD' : s.key === 'coastal' ? 'HIGH' : 'EXTREME'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {s.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Telemetry sync & Operational clock */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock size={12} className="text-slate-500" />
          <span className="text-slate-300">03:00 UTC</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-semibold">08:30 IST</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
          <span className="status-dot status-dot-green"></span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400">
            SYSTEM ONLINE
          </span>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Force Telemetry Sync"
        >
          <RefreshCw size={13} className={spinning ? 'animate-spin text-cyan-400' : ''} />
        </button>
      </div>
    </header>
  );
}
