import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, ScanSearch, Zap, TrendingUp,
  Navigation, Bell, Database, BarChart3, Server,
  Compass, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', tag: 'OVERVIEW' },
  { to: '/monitoring', icon: Activity, label: 'Live Monitoring', tag: 'RADAR' },
  { to: '/detection', icon: ScanSearch, label: 'Cyclone Detection', tag: 'AI-CNN' },
  { to: '/genesis', icon: Zap, label: 'Genesis Prediction', tag: '+48H' },
  { to: '/intensity', icon: TrendingUp, label: 'Intensity Forecast', tag: 'WIND' },
  { to: '/track', icon: Navigation, label: 'Track Prediction', tag: 'CONE' },
  { to: '/alerts', icon: Bell, label: 'Alert Management', tag: 'CAP-IN' },
  { to: '/data-sources', icon: Database, label: 'Data Ingestion', tag: 'INSAT' },
  { to: '/model-performance', icon: BarChart3, label: 'Model Metrics', tag: 'EVAL' },
  { to: '/system-status', icon: Server, label: 'Pipeline Nodes', tag: 'SYSTEM' },
];

export default function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <aside
      className="flex flex-col transition-all duration-200 border-r flex-shrink-0 relative select-none"
      style={{
        width: open ? '216px' : '56px',
        background: '#070c18',
        borderColor: '#16233b',
        zIndex: 25,
      }}
    >
      {/* Station branding */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="flex items-center justify-center w-8 h-8 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex-shrink-0"
          >
            <Compass size={17} className="animate-spin-slow" />
          </div>
          {open && (
            <div className="min-w-0">
              <div className="text-[12px] font-black font-mono tracking-wider text-slate-100 uppercase truncate">
                CYCLONE<span className="text-cyan-400">AI</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 truncate tracking-tight">
                MET-RADAR v2.4
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={open ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Module Navigation */}
      <nav className="flex-1 overflow-y-auto py-2.5 px-2 space-y-1">
        {open && (
          <div className="px-2 pb-1 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            Operations Modules
          </div>
        )}
        {navItems.map(({ to, icon: Icon, label, tag }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link group ${isActive ? 'active' : ''}`
            }
            title={!open ? label : undefined}
          >
            <Icon size={15} className="flex-shrink-0 text-slate-400 group-hover:text-slate-200 group-[.active]:text-cyan-400" />
            {open && (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="truncate text-xs">{label}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900/80 text-slate-500 group-[.active]:text-cyan-400 group-[.active]:bg-cyan-950/60 border border-transparent group-[.active]:border-cyan-800/40">
                  {tag}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Telemetry Footer */}
      <div className="border-t border-slate-800/80 p-2.5 bg-slate-950/40">
        {open ? (
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="status-dot status-dot-green"></span>
                <span>AI INFERENCE</span>
              </span>
              <span className="text-emerald-400 font-semibold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="status-dot status-dot-green"></span>
                <span>RADAR FEED</span>
              </span>
              <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
            </div>
            <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800/60">
              RSMC BAY OF BENGAL
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <span className="status-dot status-dot-green" title="AI Inference Online"></span>
            <span className="status-dot status-dot-green" title="Radar Feed Synchronized"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
