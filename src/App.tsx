import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
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
import { scenarios, defaultAlerts } from './data/mockData';
import type { ScenarioKey, Alert } from './data/mockData';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('early');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>(defaultAlerts);

  const scenario = scenarios.find(s => s.key === activeScenario) ?? scenarios[0];

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
        <main className="flex-1 overflow-y-auto p-4" style={{ background: '#0a0e1a' }}>
          <Routes>
            <Route path="/" element={
              <Dashboard
                scenario={scenario}
                timelineIndex={timelineIndex}
                onTimelineChange={setTimelineIndex}
                alerts={alerts}
              />
            } />
            <Route path="/monitoring" element={<LiveMonitoring scenario={scenario} />} />
            <Route path="/detection" element={<CycloneDetection scenario={scenario} />} />
            <Route path="/genesis" element={<GenesisPrediction scenario={scenario} />} />
            <Route path="/intensity" element={<IntensityForecast scenario={scenario} />} />
            <Route path="/track" element={
              <TrackPrediction
                scenario={scenario}
                timelineIndex={timelineIndex}
                onTimelineChange={setTimelineIndex}
              />
            } />
            <Route path="/alerts" element={
              <Alerts alerts={scenario.alerts.length > 0 ? scenario.alerts : alerts} onAcknowledge={acknowledgeAlert} />
            } />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/model-performance" element={<ModelPerformance />} />
            <Route path="/system-status" element={<SystemStatus />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
