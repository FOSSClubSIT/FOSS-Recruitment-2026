# Runbook: Cloud Infrastructure Edge Cases (Rate Limits, IOPS Throttling, STS IAM)

## Description
Multi-domain runbook covering Envoy API rate limit misconfigurations, AWS EBS IOPS burst depletion, and STS AssumeRole token permission drifts.

## Prerequisites
- Access to AWS Console / AWS CLI.
- Access to Envoy proxy configuration files.

## Diagnosis Steps
1. **Rate Limits**: Inspect Envoy metric `ratelimit.over_limit` and verify `X-Forwarded-For` header client IP parsing.
2. **EBS IOPS**: Check AWS CloudWatch metric `BurstBalance` for storage volume.
3. **AWS IAM STS**: Inspect application logs for `AccessDenied: Not authorized to perform sts:AssumeRoleWithWebIdentity`.

## Recovery Steps
1. **Rate Limit Hotfix**: Update Envoy config `use_remote_address: true` to evaluate actual client IPs instead of shared proxy IPs.
2. **EBS IOPS Migration**: Modify EBS volume type live from `gp2` to `gp3` with baseline 3000 IOPS in AWS CLI:
   `aws ec2 modify-volume --volume-id vol-1234567890abcdef0 --volume-type gp3 --iops 3000 --throughput 125`
3. **IAM Trust Policy Sync**: Update IAM role trust policy JSON with correct OIDC sub and audience `sts.amazonaws.com`.

## Verification Steps
1. Confirm legitimate user HTTP 429 errors cease.
2. Confirm EBS await read/write latency drops below 5ms.
3. Confirm S3 / AWS API calls succeed without `AccessDenied`.

## Related Tags
- api-gateway
- rate-limit
- envoy
- cascading-failure
- storage
- ebs
- iops-throttling
- volume-performance
- authentication
- iam
- aws-sts
- permission-denied
- public-api-gateway
- elastic-search-node
- s3-exporter-service
