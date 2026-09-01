import React, { useState } from 'react';
import { Incident } from '../types';

interface IncidentHistoryViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenFilterModal: () => void;
}

export const IncidentHistoryView: React.FC<IncidentHistoryViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenFilterModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Service', 'Severity', 'Timestamp (UTC)', 'Duration', 'Outcome', 'Summary'];
    const rows = filteredIncidents.map((i) => [
      i.id,
      i.service,
      i.severity,
      i.timestamp,
      i.duration,
      i.outcome,
      `"${(i.summary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sre_incident_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#ffffff1a] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-semibold">Incident Archives</span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#ffffff] font-normal mt-1">
            Incident <span className="italic text-[#d4af37] font-light">History & Anomalies</span>
          </h1>
          <p className="text-[#a3a3a3] mt-1 text-sm font-light">
            Querying past 30 days of resolved and active infrastructure anomalies.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenFilterModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#ffffff1a] hover:border-[#d4af3766] rounded text-xs font-code-sm hover:text-[#d4af37] transition-all text-[#f5f5f5] cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-semibold rounded text-xs font-code-sm transition-all cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards (Bento style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 flex flex-col justify-between group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex items-center justify-between">
            <span>TOTAL INCIDENTS</span>
            <span className="material-symbols-outlined text-[16px] text-[#d4af37]">calendar_today</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl mt-3 text-[#ffffff] font-light">142</div>
        </div>

        <div className="glass-panel p-5 flex flex-col justify-between group hover:border-[#ef444444] transition-all">
          <div className="text-[#ffb4ab] font-label-caps text-[10px] tracking-[0.2em] flex items-center justify-between">
            <span>P1 SEV</span>
            <span className="material-symbols-outlined text-[16px] text-[#ef4444]">priority_high</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl mt-3 text-[#ef4444] font-medium">3</div>
        </div>

        <div className="glass-panel p-5 flex flex-col justify-between group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex items-center justify-between">
            <span>MTTR</span>
            <span className="material-symbols-outlined text-[16px] text-[#d4af37]">timer</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl mt-3 text-[#ffffff] font-light">14m 22s</div>
        </div>

        <div className="glass-panel p-5 flex flex-col justify-between group hover:border-[#d4af3744] transition-all">
          <div className="text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em] flex items-center justify-between">
            <span>RESOLUTION RATE</span>
            <span className="material-symbols-outlined text-[16px] text-[#00ff88]">check_circle</span>
          </div>
          <div className="font-serif text-3xl md:text-4xl mt-3 text-[#d4af37] font-light">
            98.5%
          </div>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="glass-panel border border-[#ffffff1a] rounded-lg overflow-hidden flex flex-col flex-1 min-h-[400px]">
        {/* Table Controls */}
        <div className="p-4 border-b border-[#ffffff1a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0d0d]">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter ID or Service..."
              className="input-tactical w-full bg-[#141414] border border-[#ffffff1a] rounded py-1.5 pl-9 pr-3 text-xs font-code-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-colors h-9"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-code-sm text-[#a3a3a3] w-full sm:w-auto justify-between sm:justify-end">
            {/* Quick Severity Buttons */}
            <div className="flex bg-[#141414] border border-[#ffffff1a] rounded p-1">
              {['ALL', 'P1', 'P2', 'P3'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-0.5 text-[10px] rounded font-label-caps cursor-pointer transition-all ${
                    severityFilter === sev
                      ? 'bg-[#d4af37] text-[#0a0a0a] font-bold'
                      : 'text-[#a3a3a3] hover:text-[#f5f5f5]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <span className="text-[11px]">Showing 1-{filteredIncidents.length} of 142</span>
            <div className="flex border border-[#ffffff1a] rounded overflow-hidden h-8">
              <button className="px-2 hover:bg-[#1f1f1f] border-r border-[#ffffff1a] flex items-center justify-center cursor-pointer text-[#a3a3a3]">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="px-2 hover:bg-[#1f1f1f] flex items-center justify-center cursor-pointer text-[#a3a3a3]">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-[#ffffff1a] text-[#a3a3a3] font-label-caps text-[10px] tracking-[0.2em]">
                <th className="py-3 px-4 font-semibold tracking-wider cursor-pointer hover:text-[#f5f5f5] transition-colors w-28">
                  ID <span className="material-symbols-outlined text-[10px] align-middle">arrow_downward</span>
                </th>
                <th className="py-3 px-4 font-semibold tracking-wider">SERVICE</th>
                <th className="py-3 px-4 font-semibold tracking-wider">SEVERITY</th>
                <th className="py-3 px-4 font-semibold tracking-wider">TIMESTAMP (UTC)</th>
                <th className="py-3 px-4 font-semibold tracking-wider">DURATION</th>
                <th className="py-3 px-4 font-semibold tracking-wider">OUTCOME</th>
                <th className="py-3 px-4 font-semibold tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="font-code-sm text-xs text-[#f5f5f5]">
              {filteredIncidents.map((inc) => {
                const isP1 = inc.severity === 'P1';
                return (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`border-b border-[#ffffff0a] transition-colors cursor-pointer hover:bg-[#1f1f1f] ${
                      isP1 ? 'border-l-4 border-l-[#ef4444] bg-[#ef4444]/10' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-[#d4af37] font-medium">{inc.id}</td>
                    <td className="py-3.5 px-4 text-[#f5f5f5]">{inc.service}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`border rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          inc.severity === 'P1'
                            ? 'badge-p1'
                            : inc.severity === 'P2'
                            ? 'badge-p2'
                            : 'badge-p3'
                        }`}
                      >
                        {inc.severity === 'P1' && (
                          <span className="material-symbols-outlined text-[10px]">priority_high</span>
                        )}
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#a3a3a3]">{inc.timestamp}</td>
                    <td className="py-3.5 px-4 text-[#f5f5f5]">{inc.duration}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#f5f5f5] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-[#00ff88]">
                          check_circle
                        </span>
                        {inc.outcome}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(inc);
                        }}
                        className="text-[#a3a3a3] hover:text-[#d4af37] transition-colors p-1 cursor-pointer"
                        title="View Incident Post-Mortem"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-auto p-3 bg-[#0d0d0d] border-t border-[#ffffff1a] text-[10px] font-code-sm text-[#a3a3a3] flex justify-between items-center px-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span> Database Connection Stable
          </span>
          <span>Last refreshed: Just now</span>
        </div>
      </div>
    </div>
  );
};
