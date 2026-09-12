# Runbook: CoreDNS & ExternalDNS Resolution Failure Remediation

## Description
Resolving internal Kubernetes DNS resolution failures, CoreDNS upstream timeouts, and ExternalDNS TTL caching issues.

## Prerequisites
- `kubectl` permissions in `kube-system` namespace.
- Access to external DNS provider (Route53 / Cloudflare).

## Diagnosis Steps
1. Test DNS resolution inside a temporary debug pod:
   `kubectl run -it --rm debug --image=busybox -- nslookup inventory-db.internal`
2. Inspect CoreDNS deployment logs:
   `kubectl logs -n kube-system -l k8s-app=kube-dns --tail=100`
3. Check CoreDNS metrics: `coredns_dns_request_duration_seconds_bucket` and dropped query count.

## Recovery Steps
1. **Scale CoreDNS Replicas**: Scale deployment to meet query demand:
   `kubectl scale deployment coredns -n kube-system --replicas=8`
2. **Restart CoreDNS Pods**:
   `kubectl rollout restart deployment coredns -n kube-system`
3. **Flush Upstream Cache**: For ExternalDNS TTL drift, trigger cache purge on CDN/DNS provider.

## Verification Steps
1. Confirm `nslookup` resolves internal `.cluster.local` names in < 5ms.
2. Confirm application DNS lookup error rates drop to zero.

## Related Tags
- dns
- coredns
- external-dns
- name-resolution
- kube-dns
- ttl-drift
- inventory-api
- customer-portal-dns
