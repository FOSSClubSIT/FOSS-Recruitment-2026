# Runbook: VPC Peering & Route Table Network Partition Recovery

## Description
Instructions to diagnose and restore inter-VPC network connectivity drops affecting cross-region or cross-account service communications.

## Prerequisites
- AWS CLI / Cloud Management Console permissions for EC2 VPC & Route Tables.
- Network diagnostic tools (`traceroute`, `nc`, `mpath`).

## Diagnosis Steps
1. Test port connectivity to target private IP:
   `nc -zvw3 10.200.1.15 443`
2. Trace network hops to locate drop point:
   `traceroute -n 10.200.1.15`
3. Inspect VPC Peering Connection status in AWS CLI:
   `aws ec2 describe-vpc-peering-connections --vpc-peering-connection-ids pcx-0a1b2c3d`
4. Inspect route table entries attached to source subnet:
   `aws ec2 describe-route-tables --filters "Name=association.subnet-id,Values=subnet-123456"`

## Recovery Steps
1. **Add Missing Route Entry**: Add destination CIDR routing through VPC peering connection target:
   `aws ec2 create-route --route-table-id rt-prod-private-a --destination-cidr-block 10.200.0.0/16 --vpc-peering-connection-id pcx-0a1b2c3d`
2. **Verify Security Group Rules**: Ensure egress/ingress SG rules permit traffic on target port.

## Verification Steps
1. Verify `nc` / `curl` connection succeeds between subnets.
2. Check CloudWatch `NetworkPacketsDrop` returns to 0.

## Related Tags
- networking
- vpc-peering
- route-table
- network-partition
- payment-processor
