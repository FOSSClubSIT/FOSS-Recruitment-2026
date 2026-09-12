# Runbook: Prometheus TSDB Corruption & Alertmanager Deadman Recovery

## Description
Restoring monitoring functionality when Prometheus TSDB Write-Ahead Log (WAL) corruption occurs or Alertmanager routing drops heartbeats.

## Prerequisites
- `kubectl` access to monitoring namespace.
- Direct filesystem access to Prometheus persistent volume.

## Diagnosis Steps
1. Check Prometheus pod container logs:
   `kubectl logs -n monitoring statefulset/prometheus-k8s -c prometheus`
2. Check for WAL corruption error signatures: `corrupt WAL segment`.
3. Check Alertmanager cluster mesh status.

## Recovery Steps
1. **Remove Corrupt WAL Segment**:
   Exec into Prometheus pod or attach debug volume and delete corrupted segment file:
   `rm /prometheus/data/wal/00000XXX`
2. **Restart Prometheus StatefulSet**:
   `kubectl rollout restart statefulset/prometheus-k8s -n monitoring`

## Verification Steps
1. Confirm Prometheus logs report `Server is ready to receive web requests`.
2. Confirm Grafana metrics graph query execution succeeds.

## Related Tags
- monitoring
- prometheus
- tsdb
- alertmanager
- monitoring-prometheus
