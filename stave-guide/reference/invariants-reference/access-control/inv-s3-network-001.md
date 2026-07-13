---
title: "Public-Principal Policies Must Have Network Conditions"
sidebar_label: "CTL.S3.NETWORK.001"
sidebar_position: 5
description: "S3 bucket policies that grant access to Principal * must include network-scoping conditions."
---

# Public-Principal Policies Must Have Network Conditions

**ID:** `CTL.S3.NETWORK.001`
**Category:** Access Control
**Severity:** High

## What This Checks

S3 bucket policies that grant access to `Principal: "*"` (any AWS principal) must include network-scoping conditions such as `aws:SourceIp`, `aws:SourceVpce`, `aws:SourceVpc`, or `aws:PrincipalOrgID`. Without these conditions, the bucket's effective network scope is `public`.

## Why It Matters

A `Principal: "*"` statement without network conditions means the bucket is accessible from any IP address on the internet. Even when the intent is to allow access from a specific application, omitting network conditions leaves the bucket open to anyone who discovers the bucket name. A bucket like `acme-merchant-settlement-reports` with an unscoped wildcard principal can be enumerated and accessed by any attacker. Adding a `Condition` block with `aws:SourceVpce` or `aws:SourceIp` transforms a globally accessible bucket into one reachable only from your network perimeter.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.NETWORK.001",
  "control_name": "Public-Principal Policies Must Have Network Conditions",
  "resource_id": "acme-merchant-settlement-reports",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.policy.effective_network_scope",
        "value": "public"
      }
    ],
    "first_unsafe_at": "2026-01-06T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 216,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 216 hours (threshold: 0 hours). Unsafe since 2026-01-06T00:00:00Z."
  },
  "mitigation": {
    "description": "Control violation detected.",
    "action": "Review the unsafe configuration and remediate."
  }
}
```

## Correct Configuration

A safe bucket with a wildcard principal includes network-scoping conditions that restrict access:

```json
{
  "storage": {
    "policy": {
      "effective_network_scope": "vpc"
    }
  }
}
```

**To remediate:** Add network-scoping conditions to any bucket policy statement that uses `Principal: "*"`. Use one or more of: `aws:SourceIp` (restrict to known CIDR ranges), `aws:SourceVpce` (restrict to a specific VPC endpoint), `aws:SourceVpc` (restrict to a VPC), or `aws:PrincipalOrgID` (restrict to your AWS Organization).

## Related Controls

- [`CTL.S3.ACCESS.001`](inv-s3-access-001.md) -- No Unauthorized Cross-Account Access (flags named external account principals)
- [`CTL.S3.ACCESS.002`](inv-s3-access-002.md) -- No Wildcard Action Policies (flags `s3:*` action grants, which compound the risk of unscoped principals)
- [`CTL.S3.PUBLIC.001`](../public-access/inv-s3-public-001.md) -- No Public S3 Buckets (flags public read/list access at the visibility level)
