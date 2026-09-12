# Runbook: Kubernetes Pod CrashLoopBackOff & OOMKilled Triage

## Description
Standard operating procedure for diagnosing and remediating Kubernetes pods stuck in `CrashLoopBackOff` or terminated due to `OOMKilled` (Exit Code 137) events in production namespaces.

## Prerequisites
- Administrative access to Kubernetes cluster via `kubectl`.
- Read access to cluster monitoring tools (Grafana, Prometheus, Loki).
- Helm / Argo CD access for deployment rollbacks.

## Diagnosis Steps
1. Identify affected pod status:
   `kubectl get pods -n <namespace> -o wide --field-selector status.phase!=Running`
2. Fetch logs from previous crashed instance:
   `kubectl logs -n <namespace> <pod_name> --previous --tail=200`
3. Inspect pod failure reason and termination code:
   `kubectl describe pod <pod_name> -n <namespace>`
4. Check node-level memory pressure or OOM killer events:
   `kubectl get events -n <namespace> --sort-by='.metadata.creationTimestamp'`

## Recovery Steps
1. **OOMKilled Error**: If `Reason: OOMKilled` (Exit Code 137) is observed, increase container memory limits in the Helm values or Deployment manifest:
   `kubectl set resources deployment/<deployment_name> -n <namespace> --limits=memory=4Gi --requests=memory=2Gi`
2. **Missing Secret/ConfigMap**: If application panics on missing environment variables or secrets, verify Secret key bindings:
   `kubectl get secret <secret_name> -n <namespace> -o yaml`
3. **Rollback Deployment**: If code crash introduced in recent release, initiate immediate rollback:
   `kubectl rollout undo deployment/<deployment_name> -n <namespace>`

## Verification Steps
1. Confirm pods reach `1/1 Ready` status and `Running` phase:
   `kubectl get deployment <deployment_name> -n <namespace>`
2. Monitor crash loop counter to ensure restarts have ceased:
   `kubectl get pods -n <namespace> -l app=<app_label> -watch`
3. Verify application health check endpoints (`/healthz`, `/livez`) respond with HTTP 200.

## Related Tags
- kubernetes
- crashloopbackoff
- pod-failure
- oomkilled
- deployment
- auth-service
- search-indexer
