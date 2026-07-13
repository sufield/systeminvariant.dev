---
title: "No External Write Access"
sidebar_label: "INV.S3.ACCESS.003"
sidebar_position: 3
description: "S3 buckets must not grant write or delete permissions to external AWS accounts."
---

# No External Write Access

**ID:** `INV.S3.ACCESS.003`
**Category:** Access Control
**Severity:** Critical

## What This Checks

S3 buckets must not grant write or delete permissions to external AWS accounts. While cross-account read access may be acceptable for analytics or auditing, write access from external accounts creates data integrity and supply chain risks.

## Why It Matters

External write access is the highest-severity form of cross-account oversharing. An external account with `s3:PutObject` on `acme-firmware-releases` can inject tampered artifacts into your build pipeline. An external account with `s3:DeleteObject` can destroy audit logs or backups. An external account with `s3:PutBucketPolicy` can grant itself additional permissions, escalating a scoped grant into full bucket takeover. These are not theoretical risks -- supply chain attacks via writable S3 buckets have been documented in public breach disclosures.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.ACCESS.003",
  "invariant_name": "No External Write Access",
  "resource_id": "acme-firmware-releases",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.access.has_external_write",
        "value": true
      },
      {
        "path": "properties.storage.kind",
        "value": "bucket"
      }
    ],
    "first_unsafe_at": "2026-01-05T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 240,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 240 hours (threshold: 0 hours). Unsafe since 2026-01-05T00:00:00Z."
  },
  "mitigation": {
    "description": "Invariant violation detected.",
    "action": "Review the unsafe configuration and remediate."
  }
}
```

## Correct Configuration

A safe bucket does not grant write or delete actions to external accounts:

```json
{
  "storage": {
    "kind": "bucket",
    "access": {
      "has_external_write": false
    }
  }
}
```

**To remediate:** Remove bucket policy statements granting `s3:PutObject`, `s3:DeleteObject`, or `s3:PutBucketPolicy` to external accounts. If cross-account write is genuinely required, restrict to specific account IDs with condition keys such as `aws:PrincipalOrgID` and scope the grant to a narrow resource prefix.

## Related Invariants

- [`INV.S3.ACCESS.001`](./inv-s3-access-001.md) -- No Unauthorized Cross-Account Access (flags any cross-account access, including read)
- [`INV.S3.WRITE.SCOPE.001`](./inv-s3-write-scope-001.md) -- S3 Signed Upload Must Bind To Exact Object Key (flags overly broad write scope in signed upload policies)
- [`INV.S3.TENANT.ISOLATION.001`](./inv-s3-tenant-isolation-001.md) -- Shared-Bucket Tenant Isolation Must Enforce Prefix (flags missing prefix enforcement on shared buckets)
