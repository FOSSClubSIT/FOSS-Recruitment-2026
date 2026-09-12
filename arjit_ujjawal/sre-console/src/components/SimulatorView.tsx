import React, { useState, useEffect } from 'react';
import { SimulationScenario } from '../types';

interface SimulatorViewProps {
  scenarios: SimulationScenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onSimulationComplete?: (result: any) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onSimulationComplete,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0); // 0: Idle, 1: Detected, 2: Diagnosis, 3: Retrieval, 4: Action, 5: Resolved
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    diagnosis?: string;
    mitigation?: string[];
    confidenceScore?: number;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const selectedScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Timer tick for simulation
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleArmSimulation = async () => {
    if (isSimulating) {
      // Reset simulation
      setIsSimulating(false);
      setCurrentStage(0);
      setTimerSeconds(0);
      setAiDiagnosis(null);
      return;
    }

    setIsSimulating(true);
    setCurrentStage(1);
    setTimerSeconds(0);
    setAiDiagnosis(null);
    setIsLoadingAi(true);

    // Fetch AI Diagnosis from backend
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          scenarioDescription: selectedScenario.description,
          serviceName: selectedScenario.targetService,
          metrics: { rps: 8400, errorRate: 3.8, p99Ms: 620 },
        }),
      });
      const data = await res.json();
      setAiDiagnosis(data);
    } catch (err) {
      console.error('Failed to run AI diagnosis:', err);
    } finally {
      setIsLoadingAi(false);
    }

    // Progress timeline stages
    setTimeout(() => setCurrentStage(2), 2500);
    setTimeout(() => setCurrentStage(3), 5000);
    setTimeout(() => setCurrentStage(4), 8000);
    setTimeout(() => {
      setCurrentStage(5);
      if (onSimulationComplete) {
        onSimulationComplete(selectedScenario);
      }
    }, 11000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#ffffff1a] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">Chaos & Injection Lab</span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#ffffff] font-normal mt-1">
            Incident <span className="italic text-[#d4af37] font-light">Simulator</span>
          </h1>
          <p className="text-[#a3a3a3] font-body-md text-sm mt-1 font-light">
            Configure and execute synthetic chaos engineering scenarios and auto-mitigation workflows.
          </p>
        </div>

        <button
          onClick={handleArmSimulation}
          className={`px-6 py-3 rounded font-label-caps text-xs transition-all active:scale-95 flex items-center gap-2 font-bold tracking-wider cursor-pointer shadow-md ${
            isSimulating
              ? 'bg-[#ef4444] text-[#ffffff] hover:bg-[#dc2626] shadow-[#ef444433]'
              : 'bg-[#d4af37] text-[#0a0a0a] hover:bg-[#e2bd46] shadow-[#d4af3733]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isSimulating ? 'stop_circle' : 'play_arrow'}
          </span>
          {isSimulating ? 'HALT SIMULATION' : 'ARM SIMULATION'}
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Configuration (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Scenario Selection */}
          <div className="glass-panel p-6 border border-[#ffffff1a]">
            <h2 className="font-serif text-xl text-[#ffffff] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d4af37] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                target
              </span>
              Target Scenario
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scen) => {
                const isSelected = scen.id === activeScenarioId;
                return (
                  <div
                    key={scen.id}
                    onClick={() => !isSimulating && onSelectScenario(scen.id)}
                    className={`rounded-lg p-5 transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#141414] border-l-4 border-l-[#d4af37] border border-[#d4af3766] shadow-lg shadow-[#d4af370d]'
                        : 'bg-[#0a0a0a] border border-[#ffffff1a] hover:bg-[#141414] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className={`font-label-caps text-[10px] tracking-widest ${
                          isSelected ? 'text-[#d4af37]' : 'text-[#a3a3a3]'
                        }`}
                      >
                        {scen.code}
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#d4af37] text-sm">
                          check_circle
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg text-[#ffffff] mb-1 font-normal">
                      {scen.title}
                    </h3>
                    <p className="text-[#a3a3a3] text-xs font-light mb-4 leading-relaxed">
                      {scen.description}
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-[#0a0a0a] border border-[#ffffff1a] rounded font-code-sm text-[10px] text-[#d4af37]">
                        {scen.databaseOrTech}
                      </span>
                      <span className="px-2 py-0.5 bg-[#0a0a0a] border border-[#ffffff1a] rounded font-code-sm text-[10px] text-[#a3a3a3]">
                        {scen.impactLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Preview */}
          <div className="glass-panel p-6 h-64 relative overflow-hidden flex flex-col border border-[#ffffff1a]">
            <div className="flex justify-between items-center mb-4 z-10">
              <h2 className="font-serif text-xl text-[#ffffff] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stacked_line_chart
                </span>
                Predicted Impact Telemetry
              </h2>
              <span className="font-code-sm text-xs text-[#d4af37] font-semibold">
                T-Minus {formatTime(timerSeconds)}
              </span>
            </div>

            <div className="flex-1 w-full bg-[#0a0a0a] border border-[#ffffff1a] rounded relative flex items-end p-4 gap-2 overflow-hidden">
              {/* Simulated metric bars */}
              <div
                className="w-full bg-[#d4af37] rounded-t transition-all duration-500"
                style={{ height: isSimulating ? '35%' : '15%' }}
              ></div>
              <div
                className="w-full bg-[#d4af37] rounded-t transition-all duration-500"
                style={{ height: isSimulating ? '55%' : '20%' }}
              ></div>
              <div
                className="w-full bg-[#d4af37] rounded-t transition-all duration-500"
                style={{ height: isSimulating ? '75%' : '25%' }}
              ></div>
              <div
                className="w-full bg-[#ef4444] rounded-t transition-all duration-500"
                style={{ height: isSimulating ? '95%' : '18%' }}
              ></div>
              <div
                className="w-full bg-[#ef4444] rounded-t transition-all duration-500"
                style={{ height: isSimulating ? '88%' : '22%' }}
              ></div>
              <div
                className="w-full bg-[#d4af37] rounded-t transition-all duration-500"
                style={{ height: isSimulating ? '45%' : '15%' }}
              ></div>

              {!isSimulating && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50 backdrop-blur-xs">
                  <span className="font-code-sm text-xs text-[#d4af37] bg-[#0a0a0a] px-4 py-2 rounded border border-[#d4af3766] uppercase tracking-wider">
                    Awaiting Simulation Start
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Timeline (4 cols) */}
        <div className="xl:col-span-4 h-full">
          <div className="glass-panel p-6 h-full border-l-4 border-l-[#d4af37] border border-[#ffffff1a] bg-[#141414]/90">
            <h2 className="font-serif text-xl text-[#ffffff] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#d4af37] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                history
              </span>
              Execution Timeline
            </h2>

            <div className="relative pl-6 space-y-7 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-[#ffffff1a]">
              {/* Stage 1 */}
              <div className={`relative ${currentStage >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                <div
                  className={`absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${
                    currentStage >= 1 ? 'bg-[#d4af37] pulse-dot' : 'bg-[#ffffff1a]'
                  }`}
                ></div>
                <div className="font-label-caps text-[10px] text-[#d4af37] mb-0.5 tracking-wider">
                  STAGE 1 • {currentStage >= 1 ? formatTime(timerSeconds) : '--:--:--'}
                </div>
                <h4 className="font-serif text-base text-[#ffffff] mb-1.5 font-normal">Detected</h4>
                <div className="bg-[#0a0a0a] p-3 rounded border border-[#ffffff1a]">
                  <div className="flex justify-between items-center text-xs font-code-sm">
                    <span className="text-[#a3a3a3] text-[11px]">Signal Noise Ratio</span>
                    <span className="text-[#ffffff] font-semibold">
                      {currentStage >= 1 ? '98.4%' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 2 */}
              <div className={`relative ${currentStage >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                <div
                  className={`absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${
                    currentStage >= 2 ? 'bg-[#d4af37] pulse-dot' : 'bg-[#ffffff1a]'
                  }`}
                ></div>
                <div className="font-label-caps text-[10px] text-[#d4af37] mb-0.5 tracking-wider">
                  STAGE 2 • {currentStage >= 2 ? formatTime(timerSeconds) : '--:--:--'}
                </div>
                <h4 className="font-serif text-base text-[#ffffff] mb-1.5 font-normal">Diagnosis</h4>
                <div className="bg-[#0a0a0a] p-3 rounded border border-[#ffffff1a] font-code-sm text-xs text-[#a3a3a3]">
                  {isLoadingAi ? (
                    <span className="text-[#d4af37] animate-pulse">Running AI Root Cause Analysis...</span>
                  ) : aiDiagnosis ? (
                    <div className="space-y-1 text-[11px]">
                      <p className="text-[#f5f5f5]">{aiDiagnosis.diagnosis}</p>
                      {aiDiagnosis.confidenceScore && (
                        <p className="text-[#00ff88] font-bold">Confidence: {aiDiagnosis.confidenceScore}%</p>
                      )}
                    </div>
                  ) : (
                    'Awaiting metric anomalies.'
                  )}
                </div>
              </div>

              {/* Stage 3 */}
              <div className={`relative ${currentStage >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                <div
                  className={`absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${
                    currentStage >= 3 ? 'bg-[#d4af37] pulse-dot' : 'bg-[#ffffff1a]'
                  }`}
                ></div>
                <div className="font-label-caps text-[10px] text-[#d4af37] mb-0.5 tracking-wider">
                  STAGE 3 • {currentStage >= 3 ? formatTime(timerSeconds) : '--:--:--'}
                </div>
                <h4 className="font-serif text-base text-[#ffffff] mb-1.5 flex items-center gap-2 font-normal">
                  Retrieval <span className="material-symbols-outlined text-[14px] text-[#d4af37]">memory</span>
                </h4>
                <div className="bg-[#0a0a0a] p-3 rounded border border-[#ffffff1a] space-y-1.5">
                  <div className="flex justify-between items-center font-code-sm text-[11px]">
                    <span className="text-[#a3a3a3]">RAG Precision</span>
                    <span className="text-[#f5f5f5]">{currentStage >= 3 ? '94.2%' : '--%'}</span>
                  </div>
                  <div className="flex justify-between items-center font-code-sm text-[11px]">
                    <span className="text-[#a3a3a3]">Retrieval Latency</span>
                    <span className="text-[#f5f5f5]">{currentStage >= 3 ? '18ms' : '--ms'}</span>
                  </div>
                </div>
              </div>

              {/* Stage 4 */}
              <div className={`relative ${currentStage >= 4 ? 'opacity-100' : 'opacity-40'}`}>
                <div
                  className={`absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${
                    currentStage >= 4 ? 'bg-[#d4af37] pulse-dot' : 'bg-[#ffffff1a]'
                  }`}
                ></div>
                <div className="font-label-caps text-[10px] text-[#d4af37] mb-0.5 tracking-wider">
                  STAGE 4 • {currentStage >= 4 ? formatTime(timerSeconds) : '--:--:--'}
                </div>
                <h4 className="font-serif text-base text-[#ffffff] mb-1 font-normal">Action</h4>
                {currentStage >= 4 && aiDiagnosis?.mitigation && (
                  <div className="bg-[#0a0a0a] p-2.5 rounded border border-[#ffffff1a] font-code-sm text-[11px] text-[#a3a3a3]">
                    {aiDiagnosis.mitigation[0]}
                  </div>
                )}
              </div>

              {/* Stage 5 */}
              <div className={`relative ${currentStage >= 5 ? 'opacity-100' : 'opacity-40'}`}>
                <div
                  className={`absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#141414] ${
                    currentStage >= 5 ? 'bg-[#00ff88]' : 'bg-[#ffffff1a]'
                  }`}
                ></div>
                <div className="font-label-caps text-[10px] text-[#00ff88] mb-0.5 tracking-wider">
                  STAGE 5 • {currentStage >= 5 ? formatTime(timerSeconds) : '--:--:--'}
                </div>
                <h4 className="font-serif text-base text-[#ffffff] font-normal">
                  {currentStage >= 5 ? 'Resolved & Restored' : 'Resolved'}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
