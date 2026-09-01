# Runbook: Log Pipeline Backpressure & Buffer Overflow Remediation

## Description
Handling log collector (Vector / Fluentbit) buffer backpressure caused by ingester or Elasticsearch cluster bottlenecks.

## Prerequisites
- Access to Vector / Fluentbit metrics endpoints.
- Elasticsearch cluster health metrics.

## Diagnosis Steps
1. Check Vector log buffer usage:
   `curl -s http://vector.logging:8686/metrics | grep vector_buffer_byte_size`
2. Inspect Fluentbit log tailing position:
   `kubectl logs -n logging daemonset/fluent-bit`

## Recovery Steps
1. **Enable Disk-Backed Buffering**: Switch buffer type from `memory` to `disk` with fallback limit in Vector configuration.
2. **Scale Ingestion Pipeline**: Increase elasticsearch batch size or add ingester nodes.

## Verification Steps
1. Verify log ingestion lag in Kibana drops back to < 5 seconds.
2. Confirm Vector memory usage drops below 70%.

## Related Tags
- monitoring
- logging
- fluentbit
- vector-backpressure
- telemetry-pipeline
