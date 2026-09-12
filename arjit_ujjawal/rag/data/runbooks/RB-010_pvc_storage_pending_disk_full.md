# Runbook: Kubernetes PVC Pending & Node Disk Space Cleanup

## Description
Triage procedure for PersistentVolumeClaim provisioning failures (`Pending`) and Node `DiskPressure` cleanups.

## Prerequisites
- `kubectl` cluster-admin permissions.
- SSH access to worker nodes (for emergencies).

## Diagnosis Steps
1. Check PVC status and storage class events:
   `kubectl get pvc -A`
   `kubectl describe pvc <pvc_name> -n <namespace>`
2. Check CSI provisioner logs:
   `kubectl logs -n kube-system deployment/ebs-csi-controller`
3. Check node disk usage:
   `kubectl get nodes -o custom-columns=NAME:.metadata.name,DISKPRESSURE:.status.conditions[?(@.type=="DiskPressure")].status`

## Recovery Steps
1. **Expand PVC Volume**: Increase storage request size in PVC definition (if volume expansion supported).
2. **Drain Node / Rebalance EBS Volumes**: If AWS EBS volume limit per node is hit:
   `kubectl drain <node_name> --ignore-daemonsets --delete-emptydir-data`
3. **Clean Pod Logs**: Truncate container logs on node:
   `find /var/log/pods -name "*.log" -size +1G -exec truncate -s 0 {} +`

## Verification Steps
1. Confirm PVC transitions from `Pending` to `Bound`.
2. Ensure Node `DiskPressure` condition returns to `False`.

## Related Tags
- storage
- pvc
- ebs
- disk-full
- filesystem
- order-fulfillment-db
- log-aggregator
