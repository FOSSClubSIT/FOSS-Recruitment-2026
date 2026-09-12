# Runbook: PostgreSQL Read Replica Lag Remediation

## Description
Procedures to diagnose and resolve high WAL replication lag between PostgreSQL primary node and read replicas.

## Prerequisites
- Access to PostgreSQL primary and standby nodes.
- Grafana dashboard access for `pg_replication_lag_bytes` and network I/O.

## Diagnosis Steps
1. Measure current replication lag on primary database node:
   `SELECT client_addr, replay_lag, write_lag, flush_lag FROM pg_stat_replication;`
2. Measure standby WAL receive/replay delay:
   `SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;`
3. Check for blocking heavy read queries on standby node causing conflict:
   `SELECT pid, query, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE waiting;`

## Recovery Steps
1. Cancel conflicting long-running analytical queries on read replica:
   `SELECT pg_cancel_backend(pid);`
2. Adjust standby conflict delay timeout parameter in `postgresql.conf`:
   `max_standby_streaming_delay = 30s`
3. If WAL lag is unrecoverable, re-sync standby node from primary snapshot using `pg_basebackup`.

## Verification Steps
1. Ensure `pg_replication_lag_bytes` returns to < 100MB.
2. Confirm analytics workers and read queries receive up-to-date data.

## Related Tags
- postgresql
- database
- read-replica
- replication-lag
- analytics-worker
