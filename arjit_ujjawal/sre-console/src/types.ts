export type SeverityLevel = 'P1' | 'P2' | 'P3';
export type IncidentOutcome = 'Resolved' | 'Auto-Resolved' | 'Investigating' | 'Degraded';
export type ServiceStatus = 'Stable' | 'Degraded' | 'Critical' | 'Maintenance';

export interface ServiceHealthItem {
  id: string;
  name: string;
  rps: number;
  errorRate: number; // e.g., 0.01 for 0.01%, 2.4 for 2.4%
  p99LatencyMs: number;
  status: ServiceStatus;
  region: string;
}

export interface AutonomousAction {
  id: string;
  icon: string;
  title: string;
  timeAgo: string;
  reason: string;
  type: 'scaling' | 'maintenance' | 'security' | 'failover';
}

export interface Incident {
  id: string;
  service: string;
  severity: SeverityLevel;
  timestamp: string;
  duration: string;
  outcome: IncidentOutcome;
  summary?: string;
  rootCause?: string;
  mitigationSteps?: string[];
  metricsSnapshot?: {
    rps: number;
    errorRate: number;
    latencyMs: number;
  };
}

export interface SimulationScenario {
  id: string;
  code: string;
  title: string;
  description: string;
  targetService: string;
  impactLevel: 'High Impact' | 'Medium Impact' | 'Critical Impact' | 'Low Impact';
  databaseOrTech: string;
}

export interface TimelineStage {
  stage: number;
  name: string;
  timeCode: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: Record<string, string | number>;
  logOutput?: string;
}

export interface KnowledgeDoc {
  id: string;
  code: string;
  title: string;
  lastUpdated: string;
  updatedBy?: string;
  docId: string;
  matchScore: number;
  source: 'Runbooks' | 'Post-Mortems' | 'Scripts';
  tags: string[];
  summary: string;
  aiRecommendation: string;
  context: string;
  prerequisites: string[];
  codeLanguage: string;
  codeSnippet: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
  traceId?: string;
}

export interface KpiMetrics {
  documentCount: string;
  documentCountChange: string;
  avgRetrievalMs: number;
  p99RetrievalMs: number;
  executionLatencyMs: number;
  systemReadiness: string;
}
