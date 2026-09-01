# Runbook: Redis Memory Exhaustion & Eviction Policy Management

## Description
Guide for resolving Redis `maxmemory` limit exhaustion, key eviction cascades, and `OOM command not allowed` exceptions.

## Prerequisites
- Redis CLI (`redis-cli`) access to affected cluster or standalone node.
- Read access to Redis memory telemetry (`INFO memory`).

## Diagnosis Steps
1. Inspect current Redis memory usage and eviction statistics:
   `redis-cli -h <redis_host> INFO memory`
2. Check configured maxmemory policy and hit/miss ratio:
   `redis-cli -h <redis_host> CONFIG GET maxmemory-policy`
3. Check eviction counters:
   `redis-cli -h <redis_host> INFO stats | grep evicted_keys`

## Recovery Steps
1. **Live Policy Change**: If policy is set to `noeviction`, dynamically switch policy to `allkeys-lru`:
   `redis-cli -h <redis_host> CONFIG SET maxmemory-policy allkeys-lru`
2. **Purge Expired/Unneeded Cache Keys**: Perform batch deletion of stale temporary cache prefixes using `redis-cli --scan`.
3. **Scale Memory Allocation**: Vertically scale Redis cluster node instance memory or scale out shard count.

## Verification Steps
1. Verify Redis accepts write operations without `OOM command not allowed` errors.
2. Ensure cache hit ratio recovers above 90% target threshold.

## Related Tags
- redis
- cache
- memory-exhaustion
- eviction-policy
- session-store
