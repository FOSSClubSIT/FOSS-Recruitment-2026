# Runbook: PostgreSQL Transaction Deadlock Cascade Resolution

## Description
Identifying and breaking PostgreSQL application transaction deadlocks blocking critical worker queues.

## Prerequisites
- PostgreSQL DB admin privileges.

## Diagnosis Steps
1. Query PostgreSQL logs for deadlock entries:
   `SELECT query, pid, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE waiting AND query ILIKE '%UPDATE%';`
2. Identify locking and locked transaction pairs using `pg_locks`.

## Recovery Steps
1. Cancel blocking query process:
   `SELECT pg_cancel_backend(<pid>);`
2. Force-kill stubborn backend if cancel times out:
   `SELECT pg_terminate_backend(<pid>);`
3. Enforce standardized table update ordering in application code (e.g. acquire locks in sorted primary key order).

## Verification Steps
1. Confirm no active queries remain in `waiting` state in `pg_stat_activity`.
2. Confirm application queue processing throughput resumes.

## Related Tags
- postgresql
- database
- deadlock
- transaction-lock
- billing-service
