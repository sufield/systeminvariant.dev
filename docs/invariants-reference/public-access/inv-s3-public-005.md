---
title: "No Latent Public Read Exposure"
sidebar_label: "INV.S3.PUBLIC.005"
sidebar_position: 5
description: "S3 buckets must not have latent public read exposure masked only by Public Access Block."
---

# No Latent Public Read Exposure

**ID:** `INV.S3.PUBLIC.005`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 buckets must not have latent public read exposure where a public-granting mechanism (bucket policy or ACL) exists but is currently masked only by the S3 Public Access Block. This invariant fires when `latent_public_read` is `true`, meaning removing PAB would immediately expose the bucket to the internet.

## Why It Matters

A bucket with latent public read exposure is one configuration change away from a data breach. If an administrator disables the Public Access Block -- during debugging, migration, or by accident -- the underlying policy or ACL immediately exposes the bucket. Defense-in-depth requires that the underlying access grants themselves be removed rather than relying on a single control layer. Latent exposure is invisible to most compliance scanners that only check effective access.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.PUBLIC.005",
  "invariant_name": "No Latent Public Read Exposure",
  "resource_id": "acme-healthcare-patient-records",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.visibility.latent_public_read",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket has a policy or ACL granting public read, currently masked only by Public Access Block. Removing PAB would immediately expose the bucket.",
    "action": "Remove the underlying public-granting policy statement or ACL entry so the bucket does not depend solely on PAB for protection. Then verify PAB remains enabled as defense-in-depth."
  }
}
```

## Correct Configuration

A safe observation has `latent_public_read` set to `false`, meaning no underlying policy or ACL grants public read access:

```json
{
  "properties": {
    "storage": {
      "visibility": {
        "latent_public_read": false
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.PUBLIC.006`](inv-s3-public-006.md) -- The listing counterpart: detects latent public bucket listing masked only by PAB.
- [`INV.S3.PUBLIC.001`](inv-s3-public-001.md) -- Detects active (not latent) public read access where PAB is not blocking it.
- [`INV.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures PAB is enabled; this invariant catches the case where PAB is enabled but is the only thing standing between the bucket and the internet.
