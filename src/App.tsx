import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import CycloneDetection from './pages/CycloneDetection';
import GenesisPrediction from './pages/GenesisPrediction';
import IntensityForecast from './pages/IntensityForecast';
import TrackPrediction from './pages/TrackPrediction';
import Alerts from './pages/Alerts';
import DataSources from './pages/DataSources';
import ModelPerformance from './pages/ModelPerformance';
import SystemStatus from './pages/SystemStatus';
import { scenarios } from './data/mockData';
import type { ScenarioKey, Alert, Scenario } from './data/mockData';
import { fetchLiveScenario } from './api/cycloneApi';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('early');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [liveScenario, setLiveScenario] = useState<Scenario | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchLiveScenario(controller.signal)
      .then(data => {
        setLiveScenario(data);
        setApiError(null);
      })
      .catch(error => {
        if (error?.name !== 'AbortError') {
          setApiError(error instanceof Error ? error.message : 'Live API unavailable');
        }
      });
    return () => controller.abort();
  }, []);

  const scenario = liveScenario ?? scenarios.find(s => s.key === activeScenario) ?? scenarios[0];

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0e1a' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          activeScenario={activeScenario}
          onScenarioChange={setActiveScenario}
        />
        {apiError && !liveScenario && (
          <div className="mx-4 mt-3 rounded border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs font-mono text-amber-300">
            LIVE API UNAVAILABLE. Showing local demo data only. Start the backend at http://localhost:8000 to use real observations.
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4" style={{ background: '#0a0e1a' }}>
          <Routes>
            <Route path="/" element={<Dashboard scenario={scenario} timelineIndex={timelineIndex} onTimelineChange={setTimelineIndex} alerts={alerts} />} />
            <Route path="/monitoring" element={<LiveMonitoring scenario={scenario} />} />
            <Route path="/detection" element={<CycloneDetection scenario={scenario} />} />
            <Route path="/genesis" element={<GenesisPrediction scenario={scenario} />} />
            <Route path="/intensity" element={<IntensityForecast scenario={scenario} />} />
            <Route path="/track" element={<TrackPrediction scenario={scenario} timelineIndex={timelineIndex} onTimelineChange={setTimelineIndex} />} />
            <Route path="/alerts" element={<Alerts alerts={scenario.alerts.length > 0 ? scenario.alerts : alerts} onAcknowledge={acknowledgeAlert} />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/model-performance" element={<ModelPerformance />} />
            <Route path="/system-status" element={<SystemStatus />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
