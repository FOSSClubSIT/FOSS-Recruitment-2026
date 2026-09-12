import React from 'react';
import { ServiceHealthItem } from '../types';

interface TopologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceHealthItem[];
}

export const TopologyModal: React.FC<TopologyModalProps> = ({ isOpen, onClose, services }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-[#ffffff1a] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#ffffff1a] bg-[#141414] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#d4af37]">hub</span>
            <div>
              <h2 className="font-serif text-lg text-[#ffffff] font-normal">
                Microservice Dependency Topology
              </h2>
              <p className="font-code-sm text-xs text-[#a3a3a3]">
                Live ingress traffic flow and downstream DB connections
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content: Visual Topology Map */}
        <div className="p-8 bg-[#0a0a0a] overflow-y-auto flex flex-col items-center justify-center min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl items-center">
            {/* Edge Ingress */}
            <div className="p-4 bg-[#141414] border border-[#d4af37] rounded-xl text-center space-y-2 relative shadow-lg shadow-[#d4af3710]">
              <span className="font-label-caps text-[10px] text-[#d4af37] tracking-wider uppercase font-semibold">INGRESS EDGE</span>
              <h4 className="font-serif text-sm text-[#ffffff]">Envoy Gateway</h4>
              <p className="font-code-sm text-xs text-[#a3a3a3]">28,630 RPS Total</p>
            </div>

            {/* Microservice Layer */}
            <div className="flex flex-col gap-4">
              {services.slice(0, 4).map((srv) => (
                <div
                  key={srv.id}
                  className={`p-3 bg-[#141414] border rounded-lg flex justify-between items-center font-code-sm text-xs ${
                    srv.status === 'Degraded'
                      ? 'border-[#ef4444] text-[#ef4444]'
                      : 'border-[#ffffff1a] text-[#f5f5f5]'
                  }`}
                >
                  <span className="font-bold">{srv.name}</span>
                  <span>{srv.p99LatencyMs}ms</span>
                </div>
              ))}
            </div>

            {/* Persistence Layer */}
            <div className="p-4 bg-[#141414] border border-[#ffffff1a] rounded-xl text-center space-y-2 shadow-lg">
              <span className="font-label-caps text-[10px] text-[#00ff88] tracking-wider uppercase font-semibold">DATABASE CLUSTER</span>
              <h4 className="font-serif text-sm text-[#ffffff]">PostgreSQL Main</h4>
              <p className="font-code-sm text-xs text-[#a3a3a3]">Spanner Replication Active</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ffffff1a] bg-[#141414] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-bold font-label-caps text-xs rounded transition-all cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
          >
            Close Topology
          </button>
        </div>
      </div>
    </div>
  );
};
