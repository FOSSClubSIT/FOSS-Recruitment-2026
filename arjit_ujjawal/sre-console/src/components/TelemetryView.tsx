import React, { useState, useEffect } from 'react';
import { ServiceHealthItem } from '../types';

interface TelemetryViewProps {
  services: ServiceHealthItem[];
  onOpenTopology: () => void;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ services, onOpenTopology }) => {
  const [region, setRegion] = useState('Prod-US-East');
  const [dataPoints, setDataPoints] = useState<number[]>([42, 45, 48, 52, 60, 85, 92, 70, 65, 50, 48, 45]);

  // Live tick effect to simulate active telemetry streams
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const nextVal = Math.floor(40 + Math.random() * 45);
        return [...prev.slice(1), nextVal];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#ffffff1a] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">Observability Matrix</span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#ffffff] font-normal mt-1">
            Telemetry & <span className="italic text-[#d4af37] font-light">Metrics</span> Stream
          </h1>
          <p className="text-[#a3a3a3] font-body-md text-sm mt-1 font-light">
            Real-time multi-region worker node metrics, memory saturation, and CPU load dynamics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#141414] border border-[#ffffff1a] rounded p-1">
            {['Prod-US-East', 'Prod-EU-West', 'Prod-AP-South'].map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1 font-code-sm text-xs rounded transition-all cursor-pointer ${
                  region === r
                    ? 'bg-[#d4af37] text-[#0a0a0a] font-bold shadow-sm'
                    : 'text-[#a3a3a3] hover:text-[#f5f5f5]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenTopology}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-semibold rounded text-xs font-label-caps transition-all cursor-pointer shadow-md shadow-[#d4af371a] tracking-wider uppercase"
          >
            <span className="material-symbols-outlined text-sm">hub</span>
            Topology Map
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: CPU Load */}
        <div className="glass-panel p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between">
            <span>CLUSTER CPU LOAD</span>
            <span className="text-[#00ff88]">NORMAL</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl text-[#ffffff] font-light">
            {dataPoints[dataPoints.length - 1]}%
          </div>
          <div className="h-12 w-full flex items-end gap-1 mt-2">
            {dataPoints.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-[#8c7424] to-[#d4af37] rounded-t transition-all duration-300"
                style={{ height: `${val}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Metric 2: Memory Saturation */}
        <div className="glass-panel p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between">
            <span>MEMORY SATURATION</span>
            <span className="text-[#d4af37]">64.2 GB / 128 GB</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl text-[#ffffff] font-light">50.1%</div>
          <div className="w-full bg-[#0a0a0a] h-2.5 rounded overflow-hidden mt-4 border border-[#ffffff1a]">
            <div className="bg-gradient-to-r from-[#8c7424] to-[#d4af37] h-full rounded" style={{ width: '50.1%' }}></div>
          </div>
        </div>

        {/* Metric 3: Total RPS */}
        <div className="glass-panel p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between">
            <span>AGGREGATE RPS</span>
            <span className="text-[#00ff88]">↑ 8% vs Avg</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl text-[#ffffff] font-light">28,630</div>
          <div className="font-code-sm text-xs text-[#a3a3a3] mt-2">
            Peak: 34,200 RPS @ 10:04 UTC
          </div>
        </div>

        {/* Metric 4: P99 Latency */}
        <div className="glass-panel p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-[#ef444444] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between">
            <span>P99 LATENCY</span>
            <span className="text-[#ef4444]">SPIKE DETECTED</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl text-[#ef4444] font-light">450ms</div>
          <div className="font-code-sm text-xs text-[#a3a3a3] mt-2">
            Target Service: payment-processing
          </div>
        </div>
      </div>

      {/* Regional Node Matrix */}
      <div className="glass-panel p-6 border border-[#ffffff1a]">
        <h2 className="font-serif text-xl text-[#ffffff] mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#d4af37] text-lg">memory</span> Active Node Fleet Health ({region})
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-code-sm text-xs">
          {Array.from({ length: 12 }).map((_, i) => {
            const isAlerting = i === 4;
            return (
              <div
                key={i}
                className={`p-3.5 rounded border flex flex-col gap-1.5 transition-all ${
                  isAlerting
                    ? 'bg-[#ef4444]/15 border-[#ef4444] text-[#ffb4ab]'
                    : 'bg-[#0a0a0a] border-[#ffffff1a] text-[#f5f5f5] hover:border-[#d4af3766]'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-[#a3a3a3] tracking-wider uppercase">
                  <span>NODE-{String(i + 1).padStart(2, '0')}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAlerting ? 'bg-[#ef4444] pulse-dot' : 'bg-[#00ff88]'
                    }`}
                  ></span>
                </div>
                <div className="font-bold text-sm tracking-tight">
                  {isAlerting ? '94.2% CPU' : `${Math.floor(20 + i * 4)}% CPU`}
                </div>
                <div className="text-[10px] text-[#a3a3a3] opacity-80 uppercase tracking-wider">
                  {isAlerting ? 'Degraded' : 'Nominal'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
