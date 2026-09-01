# Runbook: API Gateway 504 Gateway Timeout Triage

## Description
Guide for handling elevated HTTP 504 Gateway Timeout errors at the Ingress API Gateway tier caused by upstream microservice slowness or external dependency stalls.

## Prerequisites
- Access to Envoy / NGINX ingress controller logs and metrics.
- Distributed tracing system (Jaeger / Zipkin / Datadog APM).

## Diagnosis Steps
1. Filter ingress gateway access logs for HTTP 504 status codes:
   `kubectl logs -n ingress-nginx deployment/ingress-nginx-controller --grep=" 504 "`
2. Identify failing upstream upstream host and route:
   Extract `$upstream_addr` and `$request_time` from access logs.
3. Trace latency breakdown in Zipkin/Jaeger to determine whether delay is internal service or 3rd-party vendor.

## Recovery Steps
1. **Enable Circuit Breaker / Fallback**: If 3rd party integration is failing, trip circuit breaker to fail-fast or return cached fallback payload.
2. **Scale Upstream Deployment**: If upstream pods are CPU throttled, scale replica count:
   `kubectl scale deployment/<upstream_service> --replicas=10 -n production`
3. **Adjust Gateway Timeout**: Temporarily increase upstream timeout limit in Ingress annotation if batch processing requires longer window:
   `nginx.ingress.kubernetes.io/proxy-read-timeout: "30"`

## Verification Steps
1. Confirm HTTP 504 error rate drops to < 0.01% on API Gateway dashboard.
2. Verify p99 latency metrics return to baseline service SLO.

## Related Tags
- api-gateway
- http-504
- timeout
- ingress
- checkout-gateway
