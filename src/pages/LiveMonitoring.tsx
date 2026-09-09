import { useState, useEffect } from 'react';
import { Wind, Activity, TrendingUp, Thermometer, Droplets, Radio, Compass, Eye, Wifi } from 'lucide-react';
import MapPanel from '../components/MapPanel';
import type { Scenario } from '../data/mockData';
import { baseCyclones } from '../data/mockData';
import { connectTelemetryWebSocket } from '../services/api';

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: '#059669' },
  MODERATE: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: '#d97706' },
  HIGH: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#dc2626' },
  EXTREME: { bg: 'rgba(220, 38, 38, 0.2)', text: '#fca5a5', border: '#b91c1c' },
};

export default function LiveMonitoring({ scenario }: { scenario: Scenario }) {
  const [timelineIndex, setTimelineIndex] = useState(0);
  const cy = { ...baseCyclones[0], ...scenario.cyclone };

  const [wsData, setWsData] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const ws = connectTelemetryWebSocket((payload) => {
      setWsData(payload);
      setWsConnected(true);
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Header */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-cyan-400" />
              <h2 className="text-xs font-mono font-bold text-slate-200">
                MODULE 02 // REAL-TIME METEOROLOGICAL OBSERVATION & RADAR SURVEILLANCE
              </h2>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">
              STATION: <strong className="text-slate-200">RSMC NEW DELHI // RADAR NETWORK</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={wsConnected ? 'badge-live flex items-center gap-1' : 'badge-simulated'}>
              <Wifi size={10} />
              {wsConnected ? 'WEBSOCKET TELEMETRY STREAM' : 'RADAR FEED STANDBY'}
            </span>
          </div>
        </div>

        <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>DWR RADAR NODES: <strong className="text-slate-200">Chennai, Machilipatnam, Visakhapatnam, Paradip, Kolkata</strong></span>
            <span>POLARIZATION: <strong className="text-cyan-400">Dual-Pol S-Band</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            RADIAL RESOLUTION: <strong className="text-slate-200">250m // 10-Min Scan</strong>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-3.5">
        {/* Radar Map (8 cols) */}
        <div className="col-span-8 card-panel flex flex-col">
          <div className="card-panel-header">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                REGIONAL RADAR REFLECTIVITY & VORTEX SURVEILLANCE
              </span>
            </div>
            <span className="badge-tag">BAY OF BENGAL BASIN</span>
          </div>

          <div className="relative flex-1 bg-slate-950">
            <MapPanel
              cyclones={baseCyclones}
              track={scenario.track}
              timelineIndex={timelineIndex}
              showUncertainty={true}
              showForecast={true}
              showRiskZones={true}
              height="440px"
            />
          </div>
        </div>

        {/* Telemetry & Systems (4 cols) */}
        <div className="col-span-4 space-y-3 flex flex-col">
          {/* Atmospheric Telemetry */}
          <div className="card-panel">
            <div className="card-panel-header">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                SOUNDING TELEMETRY (14.8°N, 87.2°E)
              </span>
              <span className="badge-tag">SURFACE & 850 HPA</span>
            </div>

            <div className="p-3 space-y-2 bg-slate-950 font-mono text-xs">
              {[
                { icon: Wind, label: '10-m Surface Wind', value: `${cy.windSpeed} km/h`, sub: 'Peak gusts 42 km/h', color: '#38bdf8' },
                { icon: Activity, label: 'Central Pressure', value: `${cy.pressure} hPa`, sub: 'Tendency: -3.2 hPa / 6h', color: '#60a5fa' },
                { icon: Thermometer, label: 'Sea Surface Temp', value: '29.1°C', sub: '+1.3°C climatological anomaly', color: '#f59e0b' },
                { icon: TrendingUp, label: 'Vertical Wind Shear', value: '12.4 m/s', sub: '200-850 hPa layer (Moderate)', color: '#94a3b8' },
                { icon: Droplets, label: 'Relative Humidity', value: '82%', sub: 'Mid-tropospheric (500 hPa)', color: '#34d399' },
              ].map(m => (
                <div key={m.label} className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <m.icon size={14} style={{ color: m.color }} />
                    <div>
                      <div className="text-[11px] text-slate-200 font-semibold">{m.label}</div>
                      <div className="text-[9px] text-slate-400">{m.sub}</div>
                    </div>
                  </div>
                  <div className="text-right font-bold" style={{ color: m.color }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Systems */}
          <div className="card-panel flex-1">
            <div className="card-panel-header">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                MONITORED BASIN SYSTEMS
              </span>
              <span className="badge-tag">2 ACTIVE</span>
            </div>

            <div className="p-2.5 space-y-2 bg-slate-950 font-mono text-xs">
              {baseCyclones.map(cy2 => {
                const rStyle = riskColors[cy2.riskLevel] ?? riskColors.MODERATE;
                return (
                  <div
                    key={cy2.id}
                    className="p-2.5 rounded border flex items-center justify-between"
                    style={{ background: rStyle.bg, borderColor: rStyle.border }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{cy2.id}</span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                          style={{ background: `${rStyle.border}30`, color: rStyle.text }}
                        >
                          {cy2.riskLevel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {cy2.basin} • {cy2.lat}°N, {cy2.lon}°E
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-xs">{cy2.windSpeed} km/h</div>
                      <div className="text-[10px] text-slate-400">{cy2.pressure} hPa</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Observation Telemetry Table */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              SYNOPTIC TELEMETRY STREAM (LAST 5 OBSERVATION PASSES)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            SIMULATED SENSOR INGESTION LOG
          </span>
        </div>

        <div className="overflow-x-auto bg-slate-950">
          <table className="data-table font-mono">
            <thead>
              <tr>
                <th>TIMESTAMP (IST)</th>
                <th>COORDINATES</th>
                <th>WIND SPEED</th>
                <th>PRESSURE</th>
                <th>CLASSIFICATION</th>
                <th>PRIMARY SENSOR</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['08:30 IST', '14.8°N, 87.2°E', '32 km/h', '1004 hPa', 'Low Pressure Area', 'INSAT-3D TIR-1'],
                ['08:00 IST', '14.6°N, 87.4°E', '32 km/h', '1004 hPa', 'Low Pressure Area', 'INSAT-3D / GFS'],
                ['07:30 IST', '14.4°N, 87.7°E', '30 km/h', '1005 hPa', 'Low Pressure Area', 'DWR Paradip'],
                ['07:00 IST', '14.2°N, 88.0°E', '28 km/h', '1005 hPa', 'Low Pressure Area', 'MOSDAC / ScatSat'],
                ['06:30 IST', '14.0°N, 88.3°E', '28 km/h', '1006 hPa', 'Low Pressure Area', 'INSAT-3D TIR-1'],
              ].map((row, i) => (
                <tr key={i}>
                  <td className="text-cyan-400 font-bold">{row[0]}</td>
                  <td className="text-slate-200">{row[1]}</td>
                  <td className="text-amber-400 font-bold">{row[2]}</td>
                  <td className="text-blue-400 font-bold">{row[3]}</td>
                  <td className="text-slate-300">{row[4]}</td>
                  <td className="text-slate-400">{row[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
