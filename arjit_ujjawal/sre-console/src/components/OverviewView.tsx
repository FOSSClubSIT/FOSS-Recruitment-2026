import React from 'react';
import { ServiceHealthItem, AutonomousAction, KpiMetrics } from '../types';

interface OverviewViewProps {
  kpiMetrics: KpiMetrics;
  services: ServiceHealthItem[];
  autonomousActions: AutonomousAction[];
  onViewTopology: () => void;
  onViewFullLogs: () => void;
  onSelectService: (service: ServiceHealthItem) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  kpiMetrics,
  services,
  autonomousActions,
  onViewTopology,
  onViewFullLogs,
  onSelectService,
}) => {
  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-8 animate-fadeIn">
      {/* Overview Header */}
      <div className="flex justify-between items-end border-b border-[#ffffff1a] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">Command Dashboard</span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#ffffff] font-normal mt-1">
            Aethelgard <span className="italic text-[#d4af37] font-light">SRE Orchestrator</span>
          </h1>
          <p className="font-body-md text-sm text-[#a3a3a3] mt-1 font-light">
            Continuous autonomous telemetry, incident dispatching, and runbook orchestration.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#a3a3a3]">Active Node</div>
          <div className="font-serif text-sm text-[#d4af37] font-medium">Autonomous Node 01</div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Document Count */}
        <div className="glass-panel p-5 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between items-center">
            Document Count
            <span className="material-symbols-outlined text-[18px] text-[#d4af37]">description</span>
          </div>
          <div>
            <div className="font-serif text-3xl md:text-4xl text-[#ffffff] font-light">
              {kpiMetrics.documentCount}
            </div>
            <div className="font-code-sm text-xs text-[#00ff88] flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>{' '}
              {kpiMetrics.documentCountChange}
            </div>
          </div>
        </div>

        {/* Avg Retrieval */}
        <div className="glass-panel p-5 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between items-center">
            Avg Retrieval
            <span className="material-symbols-outlined text-[18px] text-[#d4af37]">timer</span>
          </div>
          <div>
            <div className="font-serif text-3xl md:text-4xl text-[#ffffff] font-light">
              {kpiMetrics.avgRetrievalMs}<span className="text-lg text-[#d4af37] font-normal ml-0.5">ms</span>
            </div>
            <div className="font-code-sm text-xs text-[#a3a3a3] flex items-center gap-1 mt-1 font-normal">
              P99: {kpiMetrics.p99RetrievalMs}ms
            </div>
          </div>
        </div>

        {/* Execution Latency */}
        <div className="glass-panel p-5 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between items-center">
            Execution Latency
            <span className="material-symbols-outlined text-[18px] text-[#d4af37]">speed</span>
          </div>
          <div>
            <div className="font-serif text-3xl md:text-4xl text-[#ffffff] font-light">
              {kpiMetrics.executionLatencyMs}<span className="text-lg text-[#d4af37] font-normal ml-0.5">ms</span>
            </div>
            <div className="font-code-sm text-xs text-[#d4af37] flex items-center gap-1 mt-1 font-medium">
              Optimal Range
            </div>
          </div>
        </div>

        {/* System Readiness */}
        <div className="glass-panel p-5 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex justify-between items-center">
            System Readiness
            <span className="material-symbols-outlined text-[18px] text-[#d4af37]">verified_user</span>
          </div>
          <div>
            <div className="font-serif text-3xl md:text-4xl text-[#d4af37] font-light">
              {kpiMetrics.systemReadiness}
            </div>
            <div className="font-code-sm text-xs text-[#00ff88] flex items-center gap-1 mt-1 font-medium">
              All systems nominal
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Health Grid (Spans 2 cols) */}
        <div className="lg:col-span-2 glass-panel flex flex-col border border-[#ffffff1a]">
          <div className="p-5 border-b border-[#ffffff1a] flex justify-between items-center bg-[#0d0d0d] rounded-t-lg">
            <h2 className="font-serif text-lg font-medium text-[#ffffff] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#d4af37]">lan</span>
              Service Health Overview
            </h2>
            <button
              onClick={onViewTopology}
              className="font-code-sm text-xs text-[#d4af37] hover:text-[#f5f5f5] transition-colors flex items-center gap-1 cursor-pointer tracking-wider uppercase"
            >
              View Topology <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="flex-1 p-5 overflow-x-auto">
            <table className="w-full text-left font-code-sm text-xs">
              <thead>
                <tr className="text-[#a3a3a3] font-label-caps border-b border-[#ffffff1a] text-[10px] tracking-[0.2em]">
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold text-right">RPS</th>
                  <th className="pb-3 font-semibold text-right">Error Rate</th>
                  <th className="pb-3 font-semibold text-right">P99 Latency</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => {
                  const isDegraded = service.status === 'Degraded';
                  return (
                    <tr
                      key={service.id}
                      onClick={() => onSelectService(service)}
                      className={`border-b border-[#ffffff0a] transition-all cursor-pointer ${
                        isDegraded
                          ? 'border-l-4 border-l-[#ef4444] bg-[#ef4444]/10 hover:bg-[#ef4444]/20'
                          : 'hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <td className={`py-3.5 ${isDegraded ? 'pl-2' : ''} flex items-center gap-3 text-[#f5f5f5] font-medium`}>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isDegraded ? 'bg-[#ef4444] pulse-dot' : 'bg-[#00ff88]'
                          }`}
                        ></div>
                        {service.name}
                      </td>
                      <td className="py-3.5 text-right text-[#f5f5f5]">
                        {service.rps.toLocaleString()}
                      </td>
                      <td
                        className={`py-3.5 text-right font-bold ${
                          isDegraded ? 'text-[#ef4444]' : 'text-[#f5f5f5]'
                        }`}
                      >
                        {service.errorRate.toFixed(2)}%
                      </td>
                      <td className="py-3.5 text-right text-[#f5f5f5]">
                        {service.p99LatencyMs}ms
                      </td>
                      <td
                        className={`py-3.5 text-right font-medium ${
                          isDegraded ? 'text-[#ef4444]' : 'text-[#a3a3a3]'
                        }`}
                      >
                        {service.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Autonomous Actions Feed */}
        <div className="glass-panel flex flex-col ai-insight border border-[#d4af3744]">
          <div className="p-5 border-b border-[#d4af3733] flex justify-between items-center bg-[#0a0a0a]/60 rounded-t-lg">
            <h2 className="font-serif text-lg font-medium text-[#d4af37] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span> Autonomous Actions
            </h2>
            <span className="w-2 h-2 rounded-full bg-[#d4af37] pulse-dot"></span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 font-code-sm text-xs">
            {autonomousActions.map((action, index) => (
              <React.Fragment key={action.id}>
                {index > 0 && <div className="h-px bg-[#ffffff0a] w-full"></div>}
                <div className="flex gap-3 items-start group">
                  <div className="mt-0.5 text-[#d4af37] bg-[#d4af3710] p-1.5 rounded border border-[#d4af3722]">
                    <span className="material-symbols-outlined text-[16px]">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[#f5f5f5] font-medium leading-snug">{action.title}</div>
                    <div className="text-[#a3a3a3] text-[11px] mt-1 opacity-90">
                      {action.timeAgo} • {action.reason}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="p-4 border-t border-[#d4af3722] text-center bg-[#0a0a0a]/40 rounded-b-lg">
            <button
              onClick={onViewFullLogs}
              className="font-label-caps text-xs text-[#d4af37] hover:text-[#f5f5f5] transition-colors cursor-pointer tracking-[0.2em] uppercase"
            >
              View Full Log →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
