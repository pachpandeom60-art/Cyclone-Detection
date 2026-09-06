import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { TrackPoint, Cyclone } from '../data/mockData';
import indiaBoundaryGeoJSON from '../data/india-soi-boundary.json';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapPanelProps {
  cyclones: Cyclone[];
  track: TrackPoint[];
  timelineIndex: number;
  showUncertainty: boolean;
  showRiskZones: boolean;
  showForecast: boolean;
  height?: string;
}

const riskColors: Record<string, string> = {
  LOW: '#10b981',
  MODERATE: '#f59e0b',
  HIGH: '#ef4444',
  EXTREME: '#dc2626',
};

// Distinct Line of Control (LOC) and Line of Actual Control (LAC) operational monitoring lines
const LOC_LAC_DATA: [number, number][][] = [
  // Line of Control (LOC) in Jammu & Kashmir
  [
    [32.88, 74.45], [33.15, 74.20], [33.40, 74.10], [33.72, 74.15],
    [34.10, 74.05], [34.35, 73.95], [34.65, 74.30], [34.85, 74.80],
    [34.90, 75.30], [35.00, 76.00], [35.15, 76.85] // Near Point NJ9842
  ],
  // Line of Actual Control (LAC) in Ladakh
  [
    [35.50, 77.80], [35.25, 78.10], [34.80, 78.35], [34.30, 78.60],
    [33.90, 78.85], [33.50, 79.10], [32.80, 79.00]
  ]
];

export default function MapPanel({
  cyclones,
  track,
  timelineIndex,
  showUncertainty,
  showForecast,
  showRiskZones,
  height = '400px',
}: MapPanelProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [18, 83],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    // Neutral Geographic Basemap (Esri World Imagery / Physical Geography)
    // Completely devoid of baked-in political borders or contradictory country labels.
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        className: 'meteorological-base-tile',
      }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous dynamic layers
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    const add = (layer: L.Layer) => {
      layer.addTo(map);
      layersRef.current.push(layer);
    };

    // 1. Authoritative Survey of India (SOI) Composite Boundary Layer
    // Strictly portrays India's sovereign territory with J&K, Ladakh, and Arunachal Pradesh
    const indiaLayer = L.geoJSON(indiaBoundaryGeoJSON as unknown as GeoJSON.GeoJsonObject, {
      style: {
        color: '#38bdf8', // Clear, thin high-contrast cyan outline
        weight: 1.8,
        opacity: 0.95,
        fillColor: '#0284c7', // Subtle distinguished landmass highlight
        fillOpacity: 0.12,
      },
    }).bindTooltip('Republic of India (Survey of India Boundary Convention)', {
      sticky: true,
      className: 'soi-tooltip',
    });
    add(indiaLayer);

    // 2. Visually distinct Line of Control / Line of Actual Control operational lines
    LOC_LAC_DATA.forEach((coords, idx) => {
      const line = L.polyline(coords, {
        color: '#94a3b8',
        weight: 1.2,
        dashArray: '3, 4',
        opacity: 0.7,
      }).bindTooltip(idx === 0 ? 'Line of Control (LOC)' : 'Line of Actual Control (LAC)', {
        sticky: true,
        className: 'soi-tooltip',
      });
      add(line);
    });

    const visibleTrack = showForecast ? track : track.slice(0, 1);
    const currentPoint = track[timelineIndex] ?? track[0];

    // 3. Coastal Risk Zones
    if (showRiskZones) {
      const coastalRisks = [
        { lat: 17.7, lon: 83.3, name: 'Visakhapatnam Sector', risk: 'HIGH' },
        { lat: 19.9, lon: 86.1, name: 'Puri Coastal Sector', risk: 'MODERATE' },
        { lat: 13.1, lon: 80.3, name: 'Chennai Coastal Sector', risk: 'LOW' },
      ];
      coastalRisks.forEach(r => {
        add(L.circle([r.lat, r.lon], {
          radius: 100000,
          color: riskColors[r.risk],
          fillColor: riskColors[r.risk],
          fillOpacity: 0.08,
          weight: 1.2,
          dashArray: '5, 4',
        }).bindPopup(`
          <div style="font-family:monospace;padding:2px">
            <div style="font-weight:700;color:#f1f5f9;font-size:12px">${r.name}</div>
            <div style="color:${riskColors[r.risk]};font-size:11px;font-weight:600;margin-top:2px">THREAT LEVEL: ${r.risk}</div>
            <div style="color:#94a3b8;font-size:10px;margin-top:2px">Coastal Surge & Vulnerability Sector</div>
          </div>
        `));
      });
    }

    // 4. Uncertainty Cone (LSTM 90% Ensemble Envelope)
    if (showUncertainty && track.length > 1) {
      const upperPoints: [number, number][] = [];
      const lowerPoints: [number, number][] = [];
      track.forEach(pt => {
        const latOffset = (pt.uncertainty / 111000) * 0.85;
        const lonOffset = (pt.uncertainty / (111000 * Math.cos(pt.lat * Math.PI / 180))) * 0.85;
        upperPoints.push([pt.lat + latOffset, pt.lon + lonOffset]);
        lowerPoints.push([pt.lat - latOffset, pt.lon - lonOffset]);
      });
      const conePoints: [number, number][] = [...upperPoints, ...lowerPoints.reverse()];
      add(L.polygon(conePoints, {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.12,
        weight: 1.2,
        dashArray: '4, 3',
      }));
    }

    // 5. Forecast Trajectory Polyline
    if (visibleTrack.length > 1) {
      const trackCoords: [number, number][] = visibleTrack.map(pt => [pt.lat, pt.lon]);
      add(L.polyline(trackCoords, {
        color: '#22d3ee',
        weight: 2.5,
        opacity: 0.95,
        dashArray: showForecast ? '6, 4' : undefined,
      }));
    }

    // 6. Forecast Waypoints
    if (showForecast) {
      visibleTrack.forEach((pt, i) => {
        if (i === 0) return;
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:10px;height:10px;border-radius:50%;
            background:#22d3ee;
            border:2px solid #060a14;
            box-shadow:0 0 6px #06b6d4;
          "></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        add(L.marker([pt.lat, pt.lon], { icon }).bindPopup(`
          <div style="font-family:monospace;padding:2px">
            <div style="font-weight:700;color:#22d3ee;font-size:12px">${pt.time}</div>
            <div style="color:#f1f5f9;font-size:11px;margin-top:2px">${pt.lat}°N, ${pt.lon}°E</div>
            <div style="color:#94a3b8;font-size:10px">Wind: ${pt.windSpeed} km/h | Pressure: ${pt.pressure} hPa</div>
            <div style="color:#f59e0b;font-size:10px;margin-top:2px">${pt.intensity}</div>
            ${pt.uncertainty > 0 ? `<div style="color:#64748b;font-size:9px;margin-top:2px">Uncertainty: ±${pt.uncertainty} km</div>` : ''}
          </div>
        `));
      });
    }

    // 7. Active Cyclones & Disturbance Centers
    cyclones.forEach(cy => {
      const color = riskColors[cy.riskLevel] ?? '#22d3ee';
      const isActive = cy.lat === currentPoint?.lat || track[0]?.lat === cy.lat;
      const size = isActive ? 26 : 18;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:${size}px;height:${size}px">
            ${isActive ? `<div style="
              position:absolute;inset:0;border-radius:50%;
              background:${color};opacity:0.35;
              animation:ping-slow 2s ease-out infinite;
            "></div>` : ''}
            <div style="
              position:absolute;inset:0;
              border-radius:50%;
              background:${color};
              border:2px solid #060a14;
              display:flex;align-items:center;justify-content:center;
              font-size:${isActive ? 13 : 9}px;
              box-shadow:0 0 ${isActive ? 16 : 8}px ${color};
            ">🌀</div>
          </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      add(L.marker([cy.lat, cy.lon], { icon }).bindPopup(`
        <div style="font-family:monospace;padding:2px;min-width:210px">
          <div style="font-weight:800;color:#22d3ee;font-size:13px">${cy.id}</div>
          <div style="color:#f1f5f9;font-size:11px;margin:3px 0">${cy.name}</div>
          <table style="width:100%;font-size:10px;color:#94a3b8;border-collapse:collapse">
            <tr><td>Location:</td><td style="color:#f1f5f9;text-align:right">${cy.lat}°N, ${cy.lon}°E</td></tr>
            <tr><td>Wind:</td><td style="color:#f59e0b;text-align:right;font-weight:700">${cy.windSpeed} km/h</td></tr>
            <tr><td>Pressure:</td><td style="color:#38bdf8;text-align:right;font-weight:700">${cy.pressure} hPa</td></tr>
            <tr><td>Genesis Prob:</td><td style="color:${color};text-align:right;font-weight:700">${cy.genesisProbability}%</td></tr>
            <tr><td>Risk Tier:</td><td style="color:${color};text-align:right;font-weight:700">${cy.riskLevel}</td></tr>
          </table>
          <div style="color:#64748b;font-size:9px;margin-top:5px;border-top:1px solid #1e293b;padding-top:3px">
            SIMULATED TELEMETRY
          </div>
        </div>
      `));
    });

    // 8. Selected Timestep Position Marker
    if (currentPoint) {
      const currentIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:22px;height:22px;border-radius:50%;
          background:#ef4444;
          border:3px solid #ffffff;
          box-shadow:0 0 20px #ef4444;
          display:flex;align-items:center;justify-content:center;
          font-size:10px;color:white;font-weight:bold;
        ">●</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      add(L.marker([currentPoint.lat, currentPoint.lon], { icon: currentIcon })
        .bindPopup(`
          <div style="font-family:monospace;padding:2px">
            <div style="color:#ef4444;font-weight:700;font-size:12px">Position Fix (${currentPoint.time})</div>
            <div style="color:#f1f5f9;font-size:11px">${currentPoint.lat}°N, ${currentPoint.lon}°E</div>
            <div style="color:#94a3b8;font-size:10px">Wind: ${currentPoint.windSpeed} km/h | ${currentPoint.intensity}</div>
          </div>
        `));
    }

  }, [cyclones, track, timelineIndex, showUncertainty, showForecast, showRiskZones]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height, borderRadius: '0.5rem' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

      {/* Authoritative Boundary Badge */}
      <div className="absolute bottom-2 left-2 z-[400] pointer-events-none">
        <div className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[9px] font-mono text-slate-400 flex items-center gap-1.5 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>SURVEY OF INDIA (SOI) BOUNDARY COMPLIANT</span>
        </div>
      </div>
    </div>
  );
}
