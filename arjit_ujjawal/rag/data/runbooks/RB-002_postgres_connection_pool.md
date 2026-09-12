# Runbook: PostgreSQL Connection Pool Exhaustion Mitigation

## Description
Remediation procedures for handling PostgreSQL client connection exhaustion (`FATAL: sorry, too many clients already`) and PgBouncer pool saturation.

## Prerequisites
- Superuser access to PostgreSQL database (`psql`).
- SSH/kubectl access to PgBouncer proxy instances.

## Diagnosis Steps
1. Check active database connection count vs `max_connections`:
   `SELECT count(*), state, usename, client_addr FROM pg_stat_activity GROUP BY state, usename, client_addr;`
2. Identify long-running idle transactions:
   `SELECT pid, now() - xact_start AS duration, query FROM pg_stat_activity WHERE state = 'idle in transaction' ORDER BY duration DESC;`
3. Inspect PgBouncer pool statistics:
   `psql -h <pgbouncer_host> -p 6432 -U pgbouncer pgbouncer -c "SHOW POOLS;"`

## Recovery Steps
1. **Terminate Rogue Connections**: Cancel hung backend connections holding pool slots:
   `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND now() - xact_start > interval '5 minutes';`
2. **Adjust PgBouncer Capacity**: Dynamically increase max client connections in PgBouncer config and reload:
   `RELOAD;` (in pgbouncer admin console).
3. **Scale API Replicas / Restart Leaking Workers**: Restart microservice pods leaking unclosed connections.

## Verification Steps
1. Validate active connection count drops below 70% of pool capacity:
   `SELECT count(*) FROM pg_stat_activity;`
2. Confirm client requests no longer throw HTTP 503 or DB connection timeout errors.

## Related Tags
- postgresql
- database
- connection-pool
- pgbouncer
- user-profile-api
