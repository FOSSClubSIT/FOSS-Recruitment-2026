import React, { useState, useEffect } from 'react';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar, NavTab } from './components/SideNavBar';
import { OverviewView } from './components/OverviewView';
import { SimulatorView } from './components/SimulatorView';
import { IncidentHistoryView } from './components/IncidentHistoryView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { TelemetryView } from './components/TelemetryView';
import { LogsView } from './components/LogsView';

import { DeployPatchModal } from './components/DeployPatchModal';
import { RunbookExecutionModal } from './components/RunbookExecutionModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { TopologyModal } from './components/TopologyModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { SupportModal } from './components/SupportModal';

import {
  INITIAL_KPI_METRICS,
  INITIAL_SERVICES,
  INITIAL_AUTONOMOUS_ACTIONS,
  INITIAL_SIMULATION_SCENARIOS,
  INITIAL_INCIDENTS,
  INITIAL_KNOWLEDGE_DOCS,
  INITIAL_SYSTEM_LOGS,
} from './data/mockData';
import { ServiceHealthItem, Incident, KnowledgeDoc } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [systemStatus, setSystemStatus] = useState<'optimal' | 'degraded' | 'simulating'>('degraded');

  // App Data State
  const [services, setServices] = useState<ServiceHealthItem[]>(INITIAL_SERVICES);
  const [autonomousActions, setAutonomousActions] = useState(INITIAL_AUTONOMOUS_ACTIONS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(INITIAL_KNOWLEDGE_DOCS);
  const [logs, setLogs] = useState(INITIAL_SYSTEM_LOGS);

  // Selection States
  const [selectedScenarioId, setSelectedScenarioId] = useState('scen-01');
  const [selectedKnowledgeDocId, setSelectedKnowledgeDocId] = useState('doc-001');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Modal Visibility States
  const [isDeployPatchOpen, setIsDeployPatchOpen] = useState(false);
  const [isRunbookRunnerOpen, setIsRunbookRunnerOpen] = useState(false);
  const [isIncidentDetailOpen, setIsIncidentDetailOpen] = useState(false);
  const [isTopologyOpen, setIsTopologyOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  // Global Keyboard Shortcuts (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Patch Deployment Handler
  const handlePatchDeployed = (serviceName: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.name === serviceName
          ? { ...s, status: 'Stable', errorRate: 0.01, p99LatencyMs: 22 }
          : s
      )
    );
    setSystemStatus('optimal');

    // Add Autonomous Action log
    setAutonomousActions((prev) => [
      {
        id: `act-${Date.now()}`,
        icon: 'rocket_launch',
        title: `Hotfix patch deployed to '${serviceName}'`,
        timeAgo: 'Just now',
        reason: 'Operator-01 manual hotfix patch',
        type: 'scaling',
      },
      ...prev,
    ]);
  };

  // Simulation Completion Handler
  const handleSimulationComplete = (scenario: any) => {
    // Add synthetic incident record
    const newInc: Incident = {
      id: `INC-${Math.floor(8000 + Math.random() * 1000)}`,
      service: scenario.targetService,
      severity: 'P1',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      duration: '03m 45s',
      outcome: 'Resolved',
      summary: `Synthetic Simulation Run: ${scenario.title}`,
      rootCause: `Chaos scenario executed. Metric anomalies analyzed by OpsCenter AI.`,
      mitigationSteps: ['Triggered auto-throttle on ingress gateway.', 'Scaled connection pool.'],
      metricsSnapshot: { rps: 8400, errorRate: 3.8, latencyMs: 620 },
    };
    setIncidents((prev) => [newInc, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] bg-carbon-fiber text-[#ebe1d3] font-sans antialiased flex flex-col selection:bg-[#f6c343] selection:text-[#17130b]">
      {/* Top Header Navigation */}
      <TopNavBar
        systemStatus={systemStatus}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsSupportOpen(true)}
        onOpenNotifications={() => setUnreadNotifications(0)}
        unreadCount={unreadNotifications}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <SideNavBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onDeployPatch={() => setIsDeployPatchOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onLogout={() => {
            alert('SRE Operator session closed.');
          }}
        />

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex overflow-x-auto bg-[#110e06] border-b border-[#4e4635] p-2 gap-2 fixed bottom-0 left-0 right-0 z-40">
          {(['overview', 'telemetry', 'incidents', 'logs', 'knowledge'] as NavTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded font-code-sm text-xs capitalize whitespace-nowrap ${
                activeTab === tab ? 'bg-[#f6c343] text-[#17130b] font-bold' : 'text-[#d2c5ae]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* View Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Primary Overview Dashboard */}
              <OverviewView
                kpiMetrics={INITIAL_KPI_METRICS}
                services={services}
                autonomousActions={autonomousActions}
                onViewTopology={() => setIsTopologyOpen(true)}
                onViewFullLogs={() => setActiveTab('logs')}
                onSelectService={(srv) => {
                  if (srv.status === 'Degraded') {
                    setIsDeployPatchOpen(true);
                  }
                }}
              />

              {/* Embedded Incident Simulator */}
              <div className="pt-6 border-t border-[#2A2A2A]">
                <SimulatorView
                  scenarios={INITIAL_SIMULATION_SCENARIOS}
                  activeScenarioId={selectedScenarioId}
                  onSelectScenario={(id) => setSelectedScenarioId(id)}
                  onSimulationComplete={handleSimulationComplete}
                />
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <TelemetryView services={services} onOpenTopology={() => setIsTopologyOpen(true)} />
          )}

          {activeTab === 'incidents' && (
            <IncidentHistoryView
              incidents={incidents}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                setIsIncidentDetailOpen(true);
              }}
              onOpenFilterModal={() => setIsSearchOpen(true)}
            />
          )}

          {activeTab === 'logs' && <LogsView logs={logs} />}

          {activeTab === 'knowledge' && (
            <KnowledgeBaseView
              docs={knowledgeDocs}
              selectedDocId={selectedKnowledgeDocId}
              onSelectDoc={(id) => setSelectedKnowledgeDocId(id)}
              onExecuteRunbook={(doc) => {
                setSelectedKnowledgeDocId(doc.id);
                setIsRunbookRunnerOpen(true);
              }}
              onEditRunbook={(doc) => {
                alert(`Editing runbook ${doc.code} in SRE Editor.`);
              }}
              onCreateRunbook={() => {
                const newDoc: KnowledgeDoc = {
                  id: `doc-${Date.now()}`,
                  code: 'RB-NEW-001',
                  title: 'RB-NEW-001: Custom Remediation Runbook',
                  lastUpdated: 'Just now by Operator-01',
                  docId: 'new11a',
                  matchScore: 99,
                  source: 'Runbooks',
                  tags: ['Custom', 'SRE'],
                  summary: 'Custom automated remediation procedure for high-availability cluster nodes.',
                  aiRecommendation: 'Review safety constraints before execution.',
                  context: 'Custom runbook created during incident escalation.',
                  prerequisites: ['SSH access to cluster'],
                  codeLanguage: 'Bash',
                  codeSnippet: '# Custom SRE Script\necho "Running system check..."',
                };
                setKnowledgeDocs((prev) => [newDoc, ...prev]);
                setSelectedKnowledgeDocId(newDoc.id);
              }}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <DeployPatchModal
        isOpen={isDeployPatchOpen}
        onClose={() => setIsDeployPatchOpen(false)}
        services={services}
        onPatchDeployed={handlePatchDeployed}
      />

      {isRunbookRunnerOpen && (
        <RunbookExecutionModal
          isOpen={isRunbookRunnerOpen}
          onClose={() => setIsRunbookRunnerOpen(false)}
          doc={knowledgeDocs.find((d) => d.id === selectedKnowledgeDocId) || knowledgeDocs[0]}
        />
      )}

      <IncidentDetailModal
        isOpen={isIncidentDetailOpen}
        onClose={() => setIsIncidentDetailOpen(false)}
        incident={selectedIncident}
      />

      <TopologyModal
        isOpen={isTopologyOpen}
        onClose={() => setIsTopologyOpen(false)}
        services={services}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}

export default App;
