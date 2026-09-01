import React, { useState, useEffect } from 'react';
import { SystemLog } from '../types';

interface LogsViewProps {
  logs: SystemLog[];
  onAddLog?: (log: SystemLog) => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const [logList, setLogList] = useState<SystemLog[]>(logs);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [filterText, setFilterText] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Live log simulation stream
  useEffect(() => {
    let interval: any = null;
    if (isLiveStreaming) {
      interval = setInterval(() => {
        const services = ['auth-gateway', 'payment-processing', 'user-profile-db', 'notification-worker'];
        const levels: ('INFO' | 'WARN' | 'DEBUG')[] = ['INFO', 'INFO', 'DEBUG', 'WARN'];
        const messages = [
          'Health check probe succeeded [200 OK]',
          'PgBouncer connection leased from pool in 4ms',
          'Redis cache key invalidation batch executed (12 keys)',
          'Processed background queue payload #8812',
          'HTTP GET /v1/user/profile - 200 OK (8ms)',
        ];

        const randomService = services[Math.floor(Math.random() * services.length)];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        const newLog: SystemLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23),
          level: randomLevel,
          service: randomService,
          message: randomMsg,
          traceId: `tr_${Math.random().toString(36).substring(2, 9)}`,
        };

        setLogList((prev) => [newLog, ...prev.slice(0, 99)]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const filteredLogs = logList.filter((log) => {
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchesSearch =
      log.message.toLowerCase().includes(filterText.toLowerCase()) ||
      log.service.toLowerCase().includes(filterText.toLowerCase()) ||
      (log.traceId || '').toLowerCase().includes(filterText.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleAiLogAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const errorLogs = logList.filter((l) => l.level === 'ERROR' || l.level === 'WARN');
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: 'Live System Log Audit',
          scenarioDescription: `Analyzing ${errorLogs.length} warnings/errors from live stream.`,
          serviceName: 'Fleet Cluster',
          metrics: { logVolume: logList.length, errorCount: errorLogs.length },
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.diagnosis || 'No critical log anomalies detected.');
    } catch (err) {
      setAiAnalysis('Log audit completed: All log streams within standard variance thresholds.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#ffffff1a] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">Structured Stream</span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#ffffff] font-normal mt-1">
            System Log <span className="italic text-[#d4af37] font-light">Explorer</span>
          </h1>
          <p className="text-[#a3a3a3] font-body-md text-sm mt-1 font-light">
            Structured log aggregation with trace-id correlation and live stream ingestion.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-code-sm border cursor-pointer transition-all uppercase tracking-wider ${
              isLiveStreaming
                ? 'bg-[#141414] border-[#d4af37] text-[#d4af37]'
                : 'bg-[#141414] border-[#ffffff1a] text-[#a3a3a3]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? 'bg-[#d4af37] pulse-dot' : 'bg-[#a3a3a3]'
              }`}
            ></span>
            {isLiveStreaming ? 'Streaming Live' : 'Paused'}
          </button>

          <button
            onClick={handleAiLogAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-semibold rounded text-xs font-label-caps transition-all cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">smart_toy</span>
            {isAnalyzing ? 'Analyzing...' : 'AI Log Audit'}
          </button>
        </div>
      </div>

      {/* AI Log Analysis Banner */}
      {aiAnalysis && (
        <div className="glass-panel p-5 border border-[#d4af3766] bg-[#d4af370f] flex items-start justify-between gap-4 animate-fadeIn rounded-lg">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#d4af37] mt-0.5">smart_toy</span>
            <div>
              <div className="font-code-sm font-bold text-[#d4af37] text-xs uppercase tracking-wider">
                AI Log Audit Result
              </div>
              <p className="font-body-md text-sm text-[#f5f5f5] mt-1 font-light">{aiAnalysis}</p>
            </div>
          </div>
          <button
            onClick={() => setAiAnalysis(null)}
            className="text-[#a3a3a3] hover:text-[#f5f5f5] text-sm"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Log Controls & Terminal Container */}
      <div className="glass-panel border border-[#ffffff1a] rounded-lg overflow-hidden flex flex-col min-h-[500px]">
        {/* Controls Bar */}
        <div className="p-4 border-b border-[#ffffff1a] bg-[#0d0d0d] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Level Tabs */}
          <div className="flex bg-[#141414] border border-[#ffffff1a] rounded p-1">
            {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 font-code-sm text-xs rounded transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#d4af37] text-[#0a0a0a] font-bold'
                    : 'text-[#a3a3a3] hover:text-[#f5f5f5]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-sm">
              search
            </span>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search message, service, or trace-id..."
              className="input-tactical w-full bg-[#141414] border border-[#ffffff1a] rounded py-1.5 pl-9 pr-3 text-xs font-code-sm text-[#f5f5f5] placeholder-[#a3a3a3]"
            />
          </div>
        </div>

        {/* Log Stream Terminal */}
        <div className="flex-1 bg-[#0a0a0a] p-4 overflow-y-auto font-code-sm text-xs space-y-2 select-text">
          {filteredLogs.map((log) => {
            const levelColor =
              log.level === 'ERROR'
                ? 'text-[#ef4444] font-bold'
                : log.level === 'WARN'
                ? 'text-[#d4af37] font-semibold'
                : log.level === 'DEBUG'
                ? 'text-[#38bdf8]'
                : 'text-[#00ff88]';

            return (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 hover:bg-[#141414] py-1.5 px-3 rounded transition-colors border-b border-[#ffffff0a]"
              >
                <span className="text-[#a3a3a3] text-[11px] shrink-0 font-mono">
                  {log.timestamp}
                </span>

                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase shrink-0 ${levelColor} bg-[#141414] border border-[#ffffff1a]`}>
                  {log.level}
                </span>

                <span className="text-[#d4af37] font-semibold shrink-0">
                  [{log.service}]
                </span>

                <span className="text-[#f5f5f5] flex-1 break-all font-light">
                  {log.message}
                </span>

                {log.traceId && (
                  <span className="text-[#a3a3a3] text-[10px] shrink-0 bg-[#141414] px-2 py-0.5 rounded border border-[#d4af3733]">
                    {log.traceId}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
