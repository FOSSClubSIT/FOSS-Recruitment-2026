# Runbook: HashiCorp Vault Token Expiry & Authentication Recovery

## Description
Procedures for resolving authentication service outages resulting from expired HashiCorp Vault client tokens or sidecar renewal failures.

## Prerequisites
- Vault CLI access with administrative token or recovery keys.
- `kubectl` access to identity service namespace.

## Diagnosis Steps
1. Check Vault status and seal state:
   `vault status`
2. Inspect application container sidecar logs:
   `kubectl logs -n auth <pod_name> -c vault-agent`
3. Verify token lookup details:
   `vault token lookup`

## Recovery Steps
1. **Re-authenticate Vault Agent**: Force token refresh via Kubernetes auth engine:
   `kubectl exec -it <pod_name> -n auth -c vault-agent -- vault login -method=kubernetes role=auth-service`
2. **Restart Microservice Pods**: Restart pods to reload valid secret leases from memory:
   `kubectl rollout restart deployment/identity-provider -n auth`

## Verification Steps
1. Confirm application authentication requests respond with HTTP 200 OK.
2. Confirm `vault-agent` logs report `token successfully renewed`.

## Related Tags
- authentication
- jwt
- hashicorp-vault
- token-expired
- identity-provider
