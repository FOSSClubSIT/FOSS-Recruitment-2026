import React from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-[#ffffff1a] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-[#ffffff1a] bg-[#141414] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#d4af37]">support_agent</span>
            <h2 className="font-serif text-lg text-[#ffffff] font-normal">
              Operator Escalation & Support
            </h2>
          </div>
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 font-code-sm text-xs text-[#a3a3a3]">
          <div className="bg-[#141414] p-4 rounded border border-[#ffffff1a] space-y-2">
            <div className="text-[#d4af37] font-bold uppercase tracking-wider">On-Call Tier-3 Escalation Hotline</div>
            <p className="text-[#f5f5f5]">PagerDuty Service Key: pd-sre-prod-primary-01</p>
            <p>Slack Channel: #ops-incident-warroom</p>
          </div>

          <div className="bg-[#141414] p-4 rounded border border-[#ffffff1a] space-y-2">
            <div className="text-[#f5f5f5] font-bold uppercase tracking-wider">Keyboard Shortcuts</div>
            <p><code className="text-[#d4af37]">⌘ + K</code> — Global Resource Search</p>
            <p><code className="text-[#d4af37]">Esc</code> — Close Modal / Terminal</p>
          </div>
        </div>

        <div className="p-4 border-t border-[#ffffff1a] bg-[#141414] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-bold font-label-caps text-xs rounded transition-all cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
