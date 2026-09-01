import React from 'react';

export type NavTab = 'overview' | 'telemetry' | 'incidents' | 'logs' | 'knowledge';

interface SideNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onDeployPatch: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onTabChange,
  onDeployPatch,
  onOpenSupport,
  onLogout,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: 'dashboard' },
    { id: 'telemetry' as NavTab, label: 'Telemetry', icon: 'monitoring' },
    { id: 'incidents' as NavTab, label: 'Incidents', icon: 'warning' },
    { id: 'logs' as NavTab, label: 'Logs', icon: 'terminal' },
    { id: 'knowledge' as NavTab, label: 'Knowledge', icon: 'menu_book' },
  ];

  return (
    <aside className="bg-[#0d0d0d] text-[#f5f5f5] font-code-sm text-xs docked left-0 h-full w-64 border-r border-[#ffffff1a] flex flex-col py-6 shrink-0 hidden md:flex z-30 select-none">
      {/* Operator Admin Box */}
      <div className="px-4 mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded bg-[#141414] border border-[#ffffff0a]">
          <img
            alt="Console Admin"
            className="w-10 h-10 rounded border border-[#d4af3744] object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYy7JJCKqpXrtYcMooGUtJovaE9s_CHGj0pvvFCPOjiO38L5DSeVwfWjKnuellE0ce-3Z5zZUKZg4aXWNARbhB7U6wTEVW-onySxTu-YQUbpHMw9mNWDSNYHw8EBDpgyB4gJBgBsM0_rfUDq3T8fSd9OH9MhO1ijlMjrDyW09J_vZ7zXWqUxrB1FYP_K40bExhzfl0M7VQQxRP7m0CFLoHXVFBtHHs03lDzXYjSAkpQX9flEbvs6kQjA"
          />
          <div>
            <div className="text-[#f5f5f5] font-sans font-semibold text-sm leading-tight">
              Operator-01
            </div>
            <div className="text-[#d4af37] font-code-sm text-[10px] tracking-wider uppercase opacity-90 mt-0.5">
              Prod-US-East
            </div>
          </div>
        </div>

        {/* Deploy Patch Primary Action */}
        <button
          onClick={onDeployPatch}
          className="w-full py-2.5 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-sans font-semibold rounded tracking-wider uppercase text-xs transition-all mt-1 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#d4af371a] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          Deploy Patch
        </button>
      </div>

      {/* Primary Navigation Menu */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        <div className="px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[#a3a3a3] font-semibold opacity-60 mb-1">
          Tactical Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-2.5 rounded flex items-center gap-3 transition-all cursor-pointer font-code-sm text-xs ${
                isActive
                  ? 'text-[#d4af37] bg-[#141414] border-l-2 border-[#d4af37] font-bold shadow-sm'
                  : 'text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-[#141414]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Support & Logout */}
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#ffffff1a] mx-4">
        <button
          onClick={onOpenSupport}
          className="text-[#a3a3a3] hover:text-[#d4af37] hover:bg-[#141414] px-3 py-2 flex items-center gap-3 transition-colors rounded text-xs cursor-pointer text-left w-full"
        >
          <span className="material-symbols-outlined text-[18px]">support_agent</span>
          <span>Support</span>
        </button>
        <button
          onClick={onLogout}
          className="text-[#a3a3a3] hover:text-[#ef4444] hover:bg-[#141414] px-3 py-2 flex items-center gap-3 transition-colors rounded text-xs cursor-pointer text-left w-full"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
