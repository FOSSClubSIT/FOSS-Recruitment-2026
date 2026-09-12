# Runbook: Redis Single-Threaded Latency & Slowlog Investigation

## Description
Troubleshooting response time spikes caused by long-running synchronous operations (`KEYS`, `FLUSHALL`, heavy Lua scripts) blocking Redis single-threaded execution thread.

## Prerequisites
- `redis-cli` access to primary master node.

## Diagnosis Steps
1. Check Redis slow execution log:
   `redis-cli -h <redis_host> SLOWLOG GET 10`
2. Monitor real-time incoming command stream:
   `redis-cli -h <redis_host> MONITOR` (Execute briefly, max 5 seconds).
3. Check CPU usage per core on Redis server host.

## Recovery Steps
1. Kill long-running client connection running full-scan queries:
   `redis-cli CLIENT KILL TYPE normal`
2. Replace blocking `KEYS` command calls in application code with non-blocking `SCAN` iteration.
3. Add command restriction in `redis.conf` to disable dangerous blocking commands:
   `rename-command KEYS ""`

## Verification Steps
1. Confirm `SLOWLOG GET` shows command execution times under 5ms.
2. Confirm application p99 response times return to normal bounds.

## Related Tags
- redis
- cache
- latency-spike
- single-thread-blocking
- recommendation-cache
