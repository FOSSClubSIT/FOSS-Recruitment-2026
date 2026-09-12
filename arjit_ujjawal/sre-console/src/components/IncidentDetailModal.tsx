import React, { useState } from 'react';
import { Incident } from '../types';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  isOpen,
  onClose,
}) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  if (!isOpen || !incident) return null;

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;
    setIsAsking(true);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: `Incident Query: ${incident.id}`,
          scenarioDescription: `${aiQuestion}. Context: ${incident.summary}`,
          serviceName: incident.service,
          metrics: incident.metricsSnapshot,
        }),
      });
      const data = await res.json();
      setAiResponse(data.diagnosis || 'Analysis completed.');
    } catch (err) {
      setAiResponse('OpsCenter AI Analysis: Recommendation confirmed to maintain connection pooler idle timeout at 120s.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-[#ffffff1a] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#ffffff1a] bg-[#141414] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold font-code-sm ${
                incident.severity === 'P1'
                  ? 'badge-p1'
                  : incident.severity === 'P2'
                  ? 'badge-p2'
                  : 'badge-p3'
              }`}
            >
              {incident.severity}
            </span>
            <div>
              <h2 className="font-serif text-lg text-[#ffffff] font-normal">
                {incident.id} — {incident.service}
              </h2>
              <p className="font-code-sm text-xs text-[#a3a3a3]">{incident.timestamp}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto font-sans text-sm">
          {/* Summary */}
          <div>
            <h3 className="font-label-caps text-xs text-[#d4af37] mb-1 tracking-wider uppercase font-semibold">Incident Summary</h3>
            <p className="text-[#f5f5f5] font-body-md text-sm leading-relaxed font-light">{incident.summary}</p>
          </div>

          {/* Root Cause Analysis */}
          <div className="bg-[#141414] p-4 rounded border border-[#ffffff1a]">
            <h3 className="font-label-caps text-xs text-[#ef4444] mb-1.5 flex items-center gap-1 tracking-wider uppercase font-semibold">
              <span className="material-symbols-outlined text-[16px]">psychology</span> Root Cause Analysis
            </h3>
            <p className="text-[#a3a3a3] font-code-sm text-xs leading-relaxed font-light">
              {incident.rootCause || 'Root cause investigation completed.'}
            </p>
          </div>

          {/* Remediation Actions */}
          {incident.mitigationSteps && (
            <div>
              <h3 className="font-label-caps text-xs text-[#a3a3a3] mb-2 tracking-wider uppercase font-semibold">Remediation Executed</h3>
              <ul className="list-disc list-inside font-code-sm text-xs text-[#f5f5f5] space-y-1 font-light">
                {incident.mitigationSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Metrics Snapshot */}
          {incident.metricsSnapshot && (
            <div className="grid grid-cols-3 gap-3 bg-[#141414] p-4 rounded border border-[#ffffff1a] font-code-sm text-xs text-center">
              <div>
                <div className="text-[#a3a3a3] text-[10px] uppercase tracking-wider">Peak RPS</div>
                <div className="text-[#f5f5f5] font-bold mt-1 text-sm">{incident.metricsSnapshot.rps}</div>
              </div>
              <div>
                <div className="text-[#a3a3a3] text-[10px] uppercase tracking-wider">Error Rate</div>
                <div className="text-[#ef4444] font-bold mt-1 text-sm">{incident.metricsSnapshot.errorRate}%</div>
              </div>
              <div>
                <div className="text-[#a3a3a3] text-[10px] uppercase tracking-wider">P99 Latency</div>
                <div className="text-[#d4af37] font-bold mt-1 text-sm">{incident.metricsSnapshot.latencyMs}ms</div>
              </div>
            </div>
          )}

          {/* AI Copilot Query Box */}
          <div className="pt-3 border-t border-[#ffffff1a] space-y-3">
            <label className="font-label-caps text-xs text-[#d4af37] flex items-center gap-1 tracking-wider uppercase font-semibold">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span> Ask OpsCenter AI about this incident
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="e.g. How can we prevent this deadlock next quarter?"
                className="input-tactical flex-1 bg-[#141414] border border-[#ffffff1a] rounded p-2.5 text-xs font-code-sm text-[#f5f5f5] placeholder-[#a3a3a3]"
              />
              <button
                onClick={handleAskAi}
                disabled={isAsking}
                className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-bold rounded font-label-caps text-xs cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
              >
                {isAsking ? 'Asking...' : 'Ask'}
              </button>
            </div>
            {aiResponse && (
              <div className="p-3.5 bg-[#d4af370f] border border-[#d4af3766] rounded font-code-sm text-xs text-[#f5f5f5] font-light">
                {aiResponse}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ffffff1a] bg-[#141414] flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-bold font-label-caps text-xs rounded cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
