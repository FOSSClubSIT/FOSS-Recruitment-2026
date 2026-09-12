import React, { useState, useEffect } from 'react';
import { KnowledgeDoc } from '../types';

interface RunbookExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: KnowledgeDoc;
}

export const RunbookExecutionModal: React.FC<RunbookExecutionModalProps> = ({
  isOpen,
  onClose,
  doc,
}) => {
  const [executionState, setExecutionState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setExecutionState('idle');
      setTerminalLogs([
        `[10:07:10 UTC] Initializing SRE Runbook Orchestrator...`,
        `[10:07:11 UTC] Target Runbook: ${doc.title} (${doc.code})`,
        `[10:07:11 UTC] Verifying cluster prerequisites: ${doc.prerequisites[0] || 'OK'}`,
        `[10:07:12 UTC] Ready for operator execution trigger.`,
      ]);
      setCurrentStep(0);
    }
  }, [isOpen, doc]);

  if (!isOpen) return null;

  const handleStartExecution = () => {
    setExecutionState('running');
    setTerminalLogs((prev) => [...prev, `[10:07:15 UTC] STARTING EXECUTION SEQUENCE...`]);

    setTimeout(() => {
      setCurrentStep(1);
      setTerminalLogs((prev) => [
        ...prev,
        `[10:07:16 UTC] STEP 1/2: Validating active connection metrics on primary database node...`,
        `[10:07:17 UTC] OK: active_connections = 42 (below safety threshold 80)`,
      ]);
    }, 1500);

    setTimeout(() => {
      setCurrentStep(2);
      setTerminalLogs((prev) => [
        ...prev,
        `[10:07:19 UTC] STEP 2/2: Executing procedure commands...`,
        `[10:07:20 UTC] Command output: VACUUM FREEZE completed in 1.42s`,
      ]);
    }, 3500);

    setTimeout(() => {
      setExecutionState('completed');
      setTerminalLogs((prev) => [
        ...prev,
        `[10:07:22 UTC] SUCCESS: Runbook ${doc.code} completed with zero errors!`,
      ]);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-[#ffffff1a] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#ffffff1a] bg-[#141414] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d4af371f] text-[#d4af37] rounded border border-[#d4af3766]">
              <span className="material-symbols-outlined">terminal</span>
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#ffffff] font-normal">
                Runbook Interactive Runner: {doc.code}
              </h2>
              <p className="font-code-sm text-xs text-[#a3a3a3]">{doc.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-sans flex-1 overflow-y-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between bg-[#141414] p-3 rounded border border-[#ffffff1a] font-code-sm text-xs">
            <span className="text-[#a3a3a3] uppercase tracking-wider">Status:</span>
            <span
              className={`font-bold uppercase tracking-wider ${
                executionState === 'completed'
                  ? 'text-[#00ff88]'
                  : executionState === 'running'
                  ? 'text-[#d4af37] pulse-dot'
                  : 'text-[#a3a3a3]'
              }`}
            >
              {executionState === 'idle'
                ? 'Awaiting Operator Trigger'
                : executionState === 'running'
                ? `Running Step ${currentStep}...`
                : 'Execution Completed'}
            </span>
          </div>

          {/* Terminal View */}
          <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#ffffff1a] font-code-sm text-xs text-[#00ff88] space-y-1.5 min-h-[220px] max-h-[300px] overflow-y-auto leading-relaxed shadow-inner">
            {terminalLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ffffff1a] bg-[#141414] flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#a3a3a3] hover:text-[#f5f5f5] font-label-caps text-xs cursor-pointer uppercase tracking-wider"
          >
            Close
          </button>
          <button
            onClick={handleStartExecution}
            disabled={executionState !== 'idle'}
            className={`px-5 py-2 font-bold font-label-caps text-xs rounded transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider ${
              executionState === 'idle'
                ? 'bg-[#d4af37] text-[#0a0a0a] hover:bg-[#e2bd46] shadow-md shadow-[#d4af371a]'
                : 'bg-[#141414] border border-[#ffffff1a] text-[#a3a3a3] cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            {executionState === 'idle'
              ? 'Execute Runbook'
              : executionState === 'running'
              ? 'Executing...'
              : 'Completed'}
          </button>
        </div>
      </div>
    </div>
  );
};
