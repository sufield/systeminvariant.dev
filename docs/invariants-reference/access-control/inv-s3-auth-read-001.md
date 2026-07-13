---
title: "No Authenticated-Users Read Access"
sidebar_label: "INV.S3.AUTH.READ.001"
sidebar_position: 4
description: "S3 buckets must not grant read access to all authenticated AWS users."
---

# No Authenticated-Users Read Access

**ID:** `INV.S3.AUTH.READ.001`
**Category:** Access Control
**Severity:** Critical

## What This Checks

S3 buckets must not grant read access to the `AuthenticatedUsers` predefined group. Any bucket where `authenticated_users_read` is true is flagged as unsafe.

## Why It Matters

The `AuthenticatedUsers` group includes every AWS account holder worldwide -- not just users in your organization. Granting read access to this group on a bucket like `acme-patient-records-staging` is nearly as dangerous as making the bucket fully public: any person with a free AWS account can read every object. This misconfiguration is a legacy of S3's original ACL model and is frequently found in older buckets that predate bucket policies. AWS itself recommends against using `AuthenticatedUsers` in any context.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.AUTH.READ.001",
  "invariant_name": "No Authenticated-Users Read Access",
  "resource_id": "acme-patient-records-staging",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.visibility.authenticated_users_read",
        "value": true
      }
    ],
    "first_unsafe_at": "2026-01-03T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 288,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 288 hours (threshold: 0 hours). Unsafe since 2026-01-03T00:00:00Z."
  },
  "mitigation": {
    "description": "Invariant violation detected.",
    "action": "Review the unsafe configuration and remediate."
  }
}
```

## Correct Configuration

A safe bucket does not grant read access to the AuthenticatedUsers group:

```json
{
  "storage": {
    "visibility": {
      "authenticated_users_read": false
    }
  }
}
```

**To remediate:** Remove the ACL grant to `AuthenticatedUsers`. Replace with specific IAM principals or use a bucket policy with explicit account IDs. Enable S3 Public Access Block with `IgnorePublicAcls` set to `true` to neutralize any remaining ACL-based grants.

## Related Invariants

- [`INV.S3.PUBLIC.004`](../public-access/inv-s3-public-004.md) -- No Public Read via ACL (flags `AllUsers` read grants, the fully public equivalent)
- [`INV.S3.ACCESS.001`](./inv-s3-access-001.md) -- No Unauthorized Cross-Account Access (flags external account principals in bucket policies)
- [`INV.S3.CONTROLS.001`](../public-access/inv-s3-controls-001.md) -- Public Access Block Must Be Enabled (PAB can mitigate ACL-based grants)
