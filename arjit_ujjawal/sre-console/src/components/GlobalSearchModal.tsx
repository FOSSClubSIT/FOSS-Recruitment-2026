import React, { useState } from 'react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Incident INC-8992 (P1 Deadlock)', tab: 'incidents', icon: 'warning' },
    { label: 'Runbook RB-DB-004 (Postgres Vacuum)', tab: 'knowledge', icon: 'menu_book' },
    { label: 'payment-processing Service Health', tab: 'overview', icon: 'lan' },
    { label: 'Incident Chaos Simulator', tab: 'overview', icon: 'play_arrow' },
    { label: 'Live Trace Terminal Logs', tab: 'logs', icon: 'terminal' },
  ];

  const filtered = quickLinks.filter((q) =>
    q.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-[#ffffff1a] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-[#ffffff1a] bg-[#141414] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#d4af37]">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents, services, runbooks, logs..."
            className="w-full bg-transparent border-none text-[#f5f5f5] font-code-sm text-sm focus:outline-none placeholder-[#a3a3a3]"
          />
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {filtered.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                onNavigateTab(item.tab);
                onClose();
              }}
              className="p-3 rounded-lg border border-[#ffffff1a] bg-[#141414] hover:bg-[#1f1f1f] hover:border-[#d4af37] transition-all cursor-pointer flex items-center gap-3 font-code-sm text-xs text-[#f5f5f5]"
            >
              <span className="material-symbols-outlined text-[#d4af37] text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
