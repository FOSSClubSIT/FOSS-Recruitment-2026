import React, { useState } from 'react';
import { KnowledgeDoc } from '../types';

interface KnowledgeBaseViewProps {
  docs: KnowledgeDoc[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onExecuteRunbook: (doc: KnowledgeDoc) => void;
  onEditRunbook: (doc: KnowledgeDoc) => void;
  onCreateRunbook: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  docs,
  selectedDocId,
  onSelectDoc,
  onExecuteRunbook,
  onEditRunbook,
  onCreateRunbook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeSourceFilter === 'All' || doc.source === activeSourceFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCopyCode = () => {
    if (selectedDoc) {
      navigator.clipboard.writeText(selectedDoc.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-grow flex flex-col lg:flex-row p-0 md:p-2 gap-6 overflow-hidden h-[calc(100vh-100px)] animate-fadeIn">
      {/* Left Column: Search & Results (1/3 width on desktop) */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full shrink-0">
        {/* Semantic Search Bar */}
        <div className="relative w-full bg-[#141414] border border-[#ffffff1a] rounded-xl focus-within:border-[#d4af37] transition-all p-1 flex items-center shadow-sm">
          <span className="material-symbols-outlined text-[#a3a3a3] ml-3 mr-2">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Query runbooks, logs, or post-mortems..."
            className="w-full bg-transparent border-none text-[#f5f5f5] placeholder-[#a3a3a3] focus:ring-0 font-body-md py-2 text-sm focus:outline-none"
          />
          <div className="hidden sm:flex items-center justify-center bg-[#0a0a0a] rounded px-2 py-1 mr-2 border border-[#ffffff1a]">
            <span className="font-code-sm text-[11px] text-[#a3a3a3]">⌘K</span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          {['All', 'Runbooks', 'Post-Mortems', 'Scripts'].map((src) => (
            <button
              key={src}
              onClick={() => setActiveSourceFilter(src)}
              className={`font-code-sm text-[11px] px-2.5 py-1 border rounded transition-all cursor-pointer flex items-center gap-1 ${
                activeSourceFilter === src
                  ? 'border-[#d4af37] bg-[#d4af371f] text-[#d4af37] font-semibold'
                  : 'border-[#ffffff1a] text-[#a3a3a3] hover:text-[#f5f5f5] bg-[#141414]'
              }`}
            >
              {src}
            </button>
          ))}
          <button
            onClick={onCreateRunbook}
            className="ml-auto font-label-caps text-[10px] text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer tracking-wider uppercase"
          >
            <span className="material-symbols-outlined text-[14px]">add</span> New Runbook
          </button>
        </div>

        {/* Results List */}
        <div className="flex-grow overflow-y-auto flex flex-col gap-3 pr-1">
          {filteredDocs.map((doc) => {
            const isSelected = doc.id === selectedDoc.id;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`border rounded-xl p-4 cursor-pointer relative transition-all ${
                  isSelected
                    ? 'bg-[#141414] border-[#d4af3799] shadow-lg shadow-[#d4af370d]'
                    : 'bg-[#0a0a0a] border-[#ffffff1a] hover:bg-[#141414]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 h-full w-1 bg-[#d4af37] rounded-l-xl"></div>
                )}
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isSelected ? 'text-[#d4af37]' : 'text-[#a3a3a3]'
                      }`}
                    >
                      {doc.source === 'Runbooks'
                        ? 'menu_book'
                        : doc.source === 'Post-Mortems'
                        ? 'description'
                        : 'terminal'}
                    </span>
                    <h3
                      className={`font-serif text-sm font-normal ${
                        isSelected ? 'text-[#d4af37]' : 'text-[#f5f5f5]'
                      }`}
                    >
                      {doc.title}
                    </h3>
                  </div>
                  <span
                    className={`font-code-sm text-[11px] font-bold ${
                      doc.matchScore > 90 ? 'text-[#d4af37]' : 'text-[#38bdf8]'
                    }`}
                  >
                    {doc.matchScore}% Match
                  </span>
                </div>

                <p className="font-body-md text-xs text-[#a3a3a3] pl-2 mb-3 line-clamp-2 leading-relaxed font-light">
                  {doc.summary}
                </p>

                <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 mb-2.5 ml-2 mr-2 border border-[#ffffff0a]">
                  <div
                    className="bg-gradient-to-r from-[#8c7424] to-[#d4af37] h-1.5 rounded-full"
                    style={{ width: `${doc.matchScore}%` }}
                  ></div>
                </div>

                <div className="flex gap-2 pl-2 mt-2">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-code-sm text-[10px] border border-[#ffffff1a] px-2 py-0.5 rounded text-[#a3a3a3] bg-[#141414]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Document Preview (Observation Deck) */}
      <div className="hidden lg:flex flex-col flex-grow bg-[#0a0a0a] border border-[#ffffff1a] rounded-xl overflow-hidden h-full shadow-lg">
        {/* Doc Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#ffffff1a] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0a0a0a] rounded border border-[#ffffff1a]">
              <span className="material-symbols-outlined text-[#d4af37]">menu_book</span>
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#ffffff] font-normal">
                {selectedDoc.title}
              </h2>
              <div className="font-code-sm text-[11px] text-[#a3a3a3] mt-0.5">
                Last updated: {selectedDoc.lastUpdated} • ID: {selectedDoc.docId}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEditRunbook(selectedDoc)}
              className="px-3.5 py-1.5 border border-[#ffffff1a] rounded font-label-caps text-xs hover:bg-[#1f1f1f] transition-all text-[#f5f5f5] cursor-pointer uppercase tracking-wider"
            >
              Edit
            </button>
            <button
              onClick={() => onExecuteRunbook(selectedDoc)}
              className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#e2bd46] text-[#0a0a0a] font-semibold rounded font-label-caps text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-[#d4af371a] uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span> Execute
            </button>
          </div>
        </div>

        {/* Doc Body */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
          {/* AI Insight Banner */}
          <div className="border border-[#d4af3766] bg-[#d4af370f] rounded-lg p-4 flex gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#d4af37] to-transparent"></div>
            <span className="material-symbols-outlined text-[#d4af37] mt-0.5">smart_toy</span>
            <div>
              <h4 className="font-code-sm font-bold text-[#d4af37] mb-1 uppercase tracking-wider">AI Recommendation</h4>
              <p className="font-body-md text-sm text-[#f5f5f5] leading-relaxed font-light">
                {selectedDoc.aiRecommendation}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-base text-[#ffffff] mb-2 font-normal">
              Context
            </h3>
            <p className="font-body-md text-sm text-[#a3a3a3] leading-relaxed font-light">
              {selectedDoc.context}
            </p>
          </div>

          <div>
            <h3 className="font-serif text-base text-[#ffffff] mb-2 font-normal">
              Prerequisites
            </h3>
            <ul className="list-disc list-inside font-body-md text-sm text-[#a3a3a3] space-y-1 font-light">
              {selectedDoc.prerequisites.map((pre, idx) => (
                <li key={idx}>{pre}</li>
              ))}
            </ul>
          </div>

          {/* Code Block */}
          <div>
            <h3 className="font-serif text-base text-[#ffffff] mb-2 font-normal">
              Execution Steps
            </h3>
            <div className="bg-[#0a0a0a] border border-[#ffffff1a] rounded-lg overflow-hidden shadow-inner">
              <div className="flex justify-between items-center bg-[#141414] px-4 py-2 border-b border-[#ffffff1a]">
                <span className="font-code-sm text-[11px] text-[#d4af37]">
                  {selectedDoc.codeLanguage}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-[#a3a3a3] hover:text-[#d4af37] transition-colors flex items-center gap-1 cursor-pointer text-xs font-code-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 font-code-sm text-xs md:text-sm text-[#f5f5f5] whitespace-pre overflow-x-auto leading-relaxed">
                {selectedDoc.codeSnippet}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
