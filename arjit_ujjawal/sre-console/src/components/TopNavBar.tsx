import React, { useState } from 'react';

interface TopNavBarProps {
  systemStatus: 'optimal' | 'degraded' | 'simulating';
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  systemStatus,
  onOpenSearch,
  onOpenSettings,
  onOpenHelp,
  onOpenNotifications,
  unreadCount,
}) => {
  return (
    <header className="bg-[#0d0d0d] text-[#f5f5f5] font-sans text-base docked full-width top-0 border-b border-[#ffffff1a] flex justify-between items-center w-full px-4 md:px-8 h-20 shrink-0 z-40 sticky top-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#d4af37] to-[#8c7424] rounded-sm rotate-45 flex items-center justify-center shadow-lg shadow-[#d4af3722]">
            <div className="w-4 h-4 bg-[#0a0a0a] -rotate-45 flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] text-[#d4af37]">terminal</span>
            </div>
          </div>
          <span className="font-serif text-xl md:text-2xl text-[#d4af37] font-semibold tracking-wider uppercase">
            Aethelgard <span className="text-xs font-sans text-[#a3a3a3] tracking-widest font-normal uppercase ml-1 opacity-70">SRE Console</span>
          </span>
        </div>
        <div className="h-5 w-px bg-[#ffffff1a] hidden md:block"></div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded border border-[#d4af3733] bg-[#141414]">
          <span
            className={`pulse-dot w-2 h-2 rounded-full ${
              systemStatus === 'optimal'
                ? 'bg-[#00ff88]'
                : systemStatus === 'degraded'
                ? 'bg-[#ef4444]'
                : 'bg-[#d4af37]'
            }`}
          ></span>
          <span className="font-code-sm text-[10px] text-[#a3a3a3] uppercase tracking-[0.15em] font-semibold">
            {systemStatus === 'optimal'
              ? 'System Optimal'
              : systemStatus === 'degraded'
              ? 'Degraded State'
              : 'Simulation Active'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex bg-[#141414] hover:bg-[#1f1f1f] rounded px-4 py-2 border border-[#ffffff1a] hover:border-[#d4af3766] items-center gap-3 transition-all text-left group cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-[#a3a3a3] group-hover:text-[#d4af37]">
            search
          </span>
          <span className="font-code-sm text-xs text-[#a3a3a3] group-hover:text-[#f5f5f5] w-40 truncate">
            Search resources...
          </span>
          <span className="font-code-sm text-[10px] text-[#d4af37] bg-[#0a0a0a] rounded px-2 py-0.5 border border-[#d4af3733]">
            ⌘K
          </span>
        </button>

        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded hover:bg-[#1f1f1f] border border-transparent hover:border-[#ffffff1a] transition-all text-[#a3a3a3] hover:text-[#d4af37] cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d4af37] pulse-dot"></span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded hover:bg-[#1f1f1f] border border-transparent hover:border-[#ffffff1a] transition-all text-[#a3a3a3] hover:text-[#d4af37] cursor-pointer"
            title="Console Settings"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>

          {/* Help */}
          <button
            onClick={onOpenHelp}
            className="p-2.5 rounded hover:bg-[#1f1f1f] border border-transparent hover:border-[#ffffff1a] transition-all text-[#a3a3a3] hover:text-[#d4af37] cursor-pointer"
            title="Help & Documentation"
          >
            <span className="material-symbols-outlined text-xl">help</span>
          </button>

          {/* Operator Tier Badge & Avatar */}
          <div className="hidden lg:flex flex-col items-end mr-1 text-right">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#d4af37] font-semibold opacity-90">
              Verified Tier
            </span>
            <span className="text-xs text-[#f5f5f5] font-medium tracking-wide">
              Platinum Elite
            </span>
          </div>

          {/* Operator Avatar */}
          <div
            className="w-10 h-10 rounded-full overflow-hidden border border-[#d4af3744] shrink-0 bg-[#141414] p-0.5 cursor-pointer"
            title="Operator-01 (Prod-US-East)"
          >
            <img
              alt="SRE operator profile"
              className="w-full h-full object-cover rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI4Oh25oMMaRLoBh7n8bpPPqD08iFjV9vrZ26TJZUdz9isA56jn2RcUPfObGjQP6hH3WzJoV_73CDywDEfTlcVDM1cyaMBxjPs1hMcblJsbHWScFq2Xz1J7TTgT1GPhcBvlbV6N6gAXhjtq_AkZooxvPfnc-IAciwblbv16xf1zXt_QYSAn1fzHw9m-04vkZcSE40pWxGzU8qD9IqRJHxvfJ4Z-OKPTWs0hK4XVp3oveGogUe0kHtk5w"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
