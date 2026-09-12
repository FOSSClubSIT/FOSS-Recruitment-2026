import { ServiceHealthItem, AutonomousAction, Incident, SimulationScenario, KnowledgeDoc, SystemLog, KpiMetrics } from '../types';

export const INITIAL_KPI_METRICS: KpiMetrics = {
  documentCount: '14.2M',
  documentCountChange: '12% / 24h',
  avgRetrievalMs: 42,
  p99RetrievalMs: 110,
  executionLatencyMs: 8.4,
  systemReadiness: '99.99%',
};

export const INITIAL_SERVICES: ServiceHealthItem[] = [
  {
    id: 'auth-gateway',
    name: 'auth-gateway',
    rps: 1240,
    errorRate: 0.01,
    p99LatencyMs: 45,
    status: 'Stable',
    region: 'Prod-US-East',
  },
  {
    id: 'user-profile-db',
    name: 'user-profile-db',
    rps: 850,
    errorRate: 0.05,
    p99LatencyMs: 12,
    status: 'Stable',
    region: 'Prod-US-East',
  },
  {
    id: 'payment-processing',
    name: 'payment-processing',
    rps: 4120,
    errorRate: 2.4,
    p99LatencyMs: 450,
    status: 'Degraded',
    region: 'Prod-US-East',
  },
  {
    id: 'notification-worker',
    name: 'notification-worker',
    rps: 320,
    errorRate: 0.00,
    p99LatencyMs: 8,
    status: 'Stable',
    region: 'Prod-US-East',
  },
  {
    id: 'redis-cache-cluster',
    name: 'redis-cache-cluster',
    rps: 18900,
    errorRate: 0.02,
    p99LatencyMs: 4,
    status: 'Stable',
    region: 'Prod-US-East',
  },
  {
    id: 'api-rate-limiter',
    name: 'api-rate-limiter',
    rps: 3100,
    errorRate: 0.12,
    p99LatencyMs: 18,
    status: 'Stable',
    region: 'Prod-US-East',
  }
];

export const INITIAL_AUTONOMOUS_ACTIONS: AutonomousAction[] = [
  {
    id: 'act-001',
    icon: 'bolt',
    title: "Auto-scaled 'payment-processing' nodes (+3)",
    timeAgo: '2 mins ago',
    reason: 'Triggered by latency spike',
    type: 'scaling',
  },
  {
    id: 'act-002',
    icon: 'memory',
    title: 'Garbage collection initiated on Cache-04',
    timeAgo: '15 mins ago',
    reason: 'Routine maintenance',
    type: 'maintenance',
  },
  {
    id: 'act-003',
    icon: 'shield_person',
    title: 'Blocked suspicious traffic pattern from IP range',
    timeAgo: '42 mins ago',
    reason: 'Security heuristic match',
    type: 'security',
  },
  {
    id: 'act-004',
    icon: 'autorenew',
    title: 'Failover traffic shifted to EU-West standby node',
    timeAgo: '2 hours ago',
    reason: 'High memory usage threshold reached',
    type: 'failover',
  }
];

export const INITIAL_SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scen-01',
    code: 'SCENARIO-01',
    title: 'Database Connection Pool Exhaustion',
    description: 'Simulates a rapid spike in DB connections exceeding max_pool_size in US-East primary cluster.',
    targetService: 'user-profile-db',
    impactLevel: 'High Impact',
    databaseOrTech: 'PostgreSQL',
  },
  {
    id: 'scen-02',
    code: 'SCENARIO-02',
    title: 'Cache Node Failure (Redis)',
    description: 'Forces a hard restart on 30% of Redis cluster nodes to test thundering herd mitigation.',
    targetService: 'redis-cache-cluster',
    impactLevel: 'Medium Impact',
    databaseOrTech: 'Redis',
  },
  {
    id: 'scen-03',
    code: 'SCENARIO-03',
    title: 'API Gateway Rate Limit Spike',
    description: 'Simulates a 25,000 RPS burst traffic flood on payment endpoints testing auto-throttle.',
    targetService: 'payment-processing',
    impactLevel: 'Critical Impact',
    databaseOrTech: 'Express / Envoy',
  },
  {
    id: 'scen-04',
    code: 'SCENARIO-04',
    title: 'Kafka Consumer Lag Backlog',
    description: 'Injects simulated processing delays on notification queue workers causing backlog build-up.',
    targetService: 'notification-worker',
    impactLevel: 'Medium Impact',
    databaseOrTech: 'Kafka',
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-8992',
    service: 'payment-gateway-us',
    severity: 'P1',
    timestamp: '2023-10-27 14:32:01',
    duration: '22m 14s',
    outcome: 'Resolved',
    summary: 'Payment processing gateway experienced a connection pool deadlock under elevated load.',
    rootCause: 'Connection max_lifetime configuration in PgBouncer was set higher than database TCP keepalive, leading to stale connection accumulation.',
    mitigationSteps: [
      'Restarted PgBouncer connection pooler instances.',
      'Auto-scaled payment-processing instances from 4 to 8 nodes.',
      'Applied hot-fix patch v2.14.3 with reduced pool idle timeouts.'
    ],
    metricsSnapshot: {
      rps: 4120,
      errorRate: 2.4,
      latencyMs: 450,
    }
  },
  {
    id: 'INC-8991',
    service: 'auth-service-eu',
    severity: 'P2',
    timestamp: '2023-10-27 11:15:44',
    duration: '08m 45s',
    outcome: 'Resolved',
    summary: 'Elevated OAuth token verification latency across EU-West region.',
    rootCause: 'Transient cache miss cascade on Redis follower replica node #2 during scheduled snapshotting.',
    mitigationSteps: [
      'Warm-up cache script triggered via SRE Console.',
      'Temporarily doubled Redis replica memory reservation.'
    ],
    metricsSnapshot: {
      rps: 1240,
      errorRate: 0.18,
      latencyMs: 180,
    }
  },
  {
    id: 'INC-8990',
    service: 'user-db-cluster-b',
    severity: 'P3',
    timestamp: '2023-10-26 23:01:12',
    duration: '02m 10s',
    outcome: 'Auto-Resolved',
    summary: 'Automated disk I/O alert triggered on primary database replica node B.',
    rootCause: 'Unindexed query executed during daily reporting ETL job.',
    mitigationSteps: [
      'Query optimizer automatically killed long-running process.',
      'SRE Console created missing compound index on (user_id, created_at).'
    ],
    metricsSnapshot: {
      rps: 850,
      errorRate: 0.05,
      latencyMs: 35,
    }
  },
  {
    id: 'INC-8989',
    service: 'cache-layer-global',
    severity: 'P2',
    timestamp: '2023-10-26 18:45:00',
    duration: '12m 33s',
    outcome: 'Resolved',
    summary: 'Global cache eviction spike following marketing promo launch.',
    rootCause: 'Cache key TTL misconfiguration on popular product catalog items.',
    mitigationSteps: [
      'Updated cache TTL policy to 24h with sliding window.',
      'Flushed stale key index.'
    ],
    metricsSnapshot: {
      rps: 14200,
      errorRate: 0.08,
      latencyMs: 14,
    }
  },
  {
    id: 'INC-8988',
    service: 'notification-worker',
    severity: 'P3',
    timestamp: '2023-10-25 09:12:30',
    duration: '05m 12s',
    outcome: 'Resolved',
    summary: 'Push notification queue delay due to third-party provider APNS throttling.',
    rootCause: 'Rate limit hit on APNS sandbox endpoint.',
    mitigationSteps: [
      'Switched active transport queue to secondary provider fallback.'
    ],
    metricsSnapshot: {
      rps: 320,
      errorRate: 0.00,
      latencyMs: 8,
    }
  }
];

export const INITIAL_KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  {
    id: 'doc-001',
    code: 'RB-DB-004',
    title: 'RB-DB-004: Postgres Vacuum Tuning',
    lastUpdated: '2023-10-24 by Operator-09',
    docId: '88f2a1',
    matchScore: 98,
    source: 'Runbooks',
    tags: ['Postgres', 'P1'],
    summary: 'Procedure for manually triggering an aggressive vacuum on high-transaction Postgres tables to prevent transaction ID wraparound.',
    aiRecommendation: 'Based on recent telemetry, triggering this vacuum may cause a temporary 5-10% spike in I/O wait times. Consider running off-peak or throttling the operation.',
    context: 'This runbook describes the procedure to manually trigger an aggressive `VACUUM` on PostgreSQL tables. It is typically required when auto-vacuum fails to keep up with high transaction rates, leading to a risk of transaction ID wraparound.',
    prerequisites: [
      'Admin access to the primary database node via `psql`.',
      'Current I/O utilization is below 60%.',
      'Approval from the on-call DB Engineer (if during business hours).'
    ],
    codeLanguage: 'Bash / PSQL',
    codeSnippet: `# Step 1: Connect to the primary node
psql -U admin -h db-primary-01.us-east.prod -d main_db

# Step 2: Check current transaction age (Identify risky tables)
SELECT relname, age(relfrozenxid) 
FROM pg_class 
WHERE relkind = 'r'
ORDER BY age(relfrozenxid) DESC LIMIT 5;

# Step 3: Execute targeted VACUUM FREEZE
VACUUM (FREEZE, VERBOSE) transactions_table;`
  },
  {
    id: 'doc-002',
    code: 'PM-2023-11',
    title: 'PM-2023-11: DB Connection Pool Exhaustion',
    lastUpdated: '2023-10-27 by Operator-01',
    docId: '99e3b4',
    matchScore: 84,
    source: 'Post-Mortems',
    tags: ['Incident', 'Resolved'],
    summary: 'Post-mortem detailing the root cause of the connection pool exhaustion incident during the Black Friday load test.',
    aiRecommendation: 'Ensure `max_pool_size` is configured dynamically based on CPU core allocation rather than hardcoded static thresholds.',
    context: 'Detailed post-mortem analysis of the connection pool deadlocks experienced by payment-processing services.',
    prerequisites: [
      'Access to Datadog / Grafana incident dashboards.',
      'Kubernetes cluster config permission.'
    ],
    codeLanguage: 'YAML / K8s',
    codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgbouncer-proxy
spec:
  replicas: 4
  template:
    spec:
      containers:
      - name: pgbouncer
        env:
        - name: MAX_CLIENT_CONN
          value: "5000"
        - name: DEFAULT_POOL_SIZE
          value: "100"`
  },
  {
    id: 'doc-003',
    code: 'Script: Reset PG Bouncer',
    title: 'Script: Reset PG Bouncer',
    lastUpdated: '2023-10-20 by Operator-04',
    docId: '44c1d2',
    matchScore: 65,
    source: 'Scripts',
    tags: ['Script', 'Automation'],
    summary: 'Automated script to gracefully restart PgBouncer instances across the fleet. Use with caution.',
    aiRecommendation: 'Run with `--dry-run` first to verify node draining before executing active connection termination.',
    context: 'Graceful pooler restart sequence script for production database nodes.',
    prerequisites: [
      'SSH access or kubectl exec capability on db-proxy namespace.'
    ],
    codeLanguage: 'Bash',
    codeSnippet: `#!/bin/bash
echo "Initiating graceful draining of PgBouncer pool..."
kubectl rollout restart deployment/pgbouncer-us-east -n database
kubectl rollout status deployment/pgbouncer-us-east -n database --timeout=60s`
  },
  {
    id: 'doc-004',
    code: 'RB-CACHE-002',
    title: 'RB-CACHE-002: Redis Cluster Failover',
    lastUpdated: '2023-10-18 by Operator-02',
    docId: '33a908',
    matchScore: 92,
    source: 'Runbooks',
    tags: ['Redis', 'Failover'],
    summary: 'Standard operating procedure for performing a zero-downtime manual failover of Redis primary node to replica.',
    aiRecommendation: 'Verify replica replication lag (`master_link_down_since_seconds == 0`) before issuing `CLUSTER FAILOVER`.',
    context: 'Used during hardware maintenance or unresolvable memory fragmentation on primary cache node.',
    prerequisites: [
      'redis-cli access to target primary node.'
    ],
    codeLanguage: 'Redis CLI',
    codeSnippet: `# Connect to replica
redis-cli -h redis-node-02.prod -p 6379 CLUSTER FAILOVER TAKEOVER`
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-06 10:06:58.120',
    level: 'INFO',
    service: 'auth-gateway',
    message: 'JWT validation successful for user_id: usr_99421 [200 OK - 12ms]',
    traceId: 'tr_8f92a01',
  },
  {
    id: 'log-002',
    timestamp: '2026-08-06 10:06:59.040',
    level: 'WARN',
    service: 'payment-processing',
    message: 'PgBouncer pool utilization high: 88/100 active connections [US-East-Primary]',
    traceId: 'tr_7b8192c',
  },
  {
    id: 'log-003',
    timestamp: '2026-08-06 10:07:01.350',
    level: 'ERROR',
    service: 'payment-processing',
    message: 'ConnectionTimeoutException: Timed out waiting for connection pool lease after 5000ms',
    traceId: 'tr_44c921a',
  },
  {
    id: 'log-004',
    timestamp: '2026-08-06 10:07:02.100',
    level: 'INFO',
    service: 'ops-orchestrator',
    message: 'Autonomous scale trigger fired: payment-processing horizontal pod autoscaler scaling +3 replicas',
    traceId: 'tr_11a882d',
  },
  {
    id: 'log-005',
    timestamp: '2026-08-06 10:07:03.010',
    level: 'INFO',
    service: 'notification-worker',
    message: 'Processed 320 messaging jobs in batch #991. Zero failures.',
    traceId: 'tr_92d113e',
  },
  {
    id: 'log-006',
    timestamp: '2026-08-06 10:07:04.420',
    level: 'DEBUG',
    service: 'user-profile-db',
    message: 'Healthcheck ping ok. Active connections: 42. Buffer cache hit ratio: 99.8%',
    traceId: 'tr_55a901f',
  }
];
