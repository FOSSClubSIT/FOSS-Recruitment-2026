# Runbook: Failed Canary Rollout Triage & Rollback

## Description
Handling automated deployment failures and metric anomaly rollbacks during Argo Rollouts or Flagger canary releases.

## Prerequisites
- `kubectl-argo-rollouts` CLI plugin installed.
- Access to Prometheus canary metric analysis dashboard.

## Diagnosis Steps
1. Check current rollout status:
   `kubectl argo rollouts get rollout <rollout_name> -n <namespace>`
2. View analysis run metrics failure reasons:
   `kubectl get analysisrun -n <namespace> --sort-by='.metadata.creationTimestamp'`
3. Inspect logs of canary pods:
   `kubectl logs -n <namespace> -l rollouts-pod-template-hash=<canary_hash>`

## Recovery Steps
1. **Manual Abort / Rollback**: If automated abort has not fired, force rollback immediately:
   `kubectl argo rollouts undo <rollout_name> -n <namespace>`
2. **Promote Stable Revision**: Ensure traffic is 100% pointed back to stable revision pods.

## Verification Steps
1. Confirm rollout step shows `Phase: Degraded` or `Phase: Healthy (Rolled Back)`.
2. Confirm 100% of ingress traffic is routed to stable deployment pods.

## Related Tags
- deployments
- canary-rollout
- argo-rollouts
- helm
- notification-service
