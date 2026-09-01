import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [autoMitigation, setAutoMitigation] = useState(true);
  const [geminiModel, setGeminiModel] = useState('gemini-3.6-flash');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#0a0a0a] border border-[#ffffff1a] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-[#ffffff1a] bg-[#141414] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#d4af37]">settings</span>
            <h2 className="font-serif text-lg text-[#ffffff] font-normal">
              Console Preferences & AI Config
            </h2>
          </div>
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-[#f5f5f5] cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 font-code-sm text-xs">
          <div className="flex items-center justify-between bg-[#141414] p-3.5 rounded border border-[#ffffff1a]">
            <div>
              <div className="text-[#f5f5f5] font-bold">Autonomous Remediation</div>
              <div className="text-[#a3a3a3] text-[11px] font-light">Allow OpsCenter AI to execute tier-1 runbooks</div>
            </div>
            <input
              type="checkbox"
              checked={autoMitigation}
              onChange={(e) => setAutoMitigation(e.target.checked)}
              className="w-4 h-4 accent-[#d4af37] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[#a3a3a3] mb-1.5 font-label-caps text-[10px] tracking-wider uppercase">Gemini Model Engine</label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="w-full bg-[#141414] border border-[#ffffff1a] rounded p-2.5 text-[#f5f5f5] focus:border-[#d4af37]"
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fastest SRE Diagnosis)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Architectural Audit)</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-[#ffffff1a] bg-[#141414] flex justify-between items-center">
          {saved && <span className="text-[#00ff88] font-code-sm text-xs">Settings Saved!</span>}
          <button
            onClick={handleSave}
            className="ml-auto px-5 py-2 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-bold font-label-caps text-xs rounded transition-all cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
