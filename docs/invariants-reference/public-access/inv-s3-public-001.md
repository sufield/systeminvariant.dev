---
title: "No Public S3 Bucket Read"
sidebar_label: "INV.S3.PUBLIC.001"
sidebar_position: 1
description: "S3 buckets must not allow public read access via policy or ACL."
---

# No Public S3 Bucket Read

**ID:** `INV.S3.PUBLIC.001`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 buckets must not allow anonymous or public read access via policy or ACL grants. This invariant fires when any bucket has `public_read` set to `true`.

## Why It Matters

Public S3 buckets are one of the most common sources of large-scale data breaches. In the 2019 Capital One breach, a misconfigured public S3 bucket exposed over 100 million customer records including Social Security numbers and bank account details. A single bucket with public read access can expose every object stored in it to anyone on the internet.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.PUBLIC.001",
  "invariant_name": "No Public S3 Bucket Read",
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
        "path": "properties.storage.visibility.public_read",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket has public read access enabled via policy or ACL. Anyone on the internet can read objects in this bucket.",
    "action": "Enable S3 Public Access Block (all four settings). Remove any bucket policy statements granting access to Principal \"*\". Remove any ACL grants to AllUsers or AuthenticatedUsers."
  }
}
```

## Correct Configuration

A safe observation has `public_read` set to `false`:

```json
{
  "properties": {
    "storage": {
      "visibility": {
        "public_read": false
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.PUBLIC.002`](inv-s3-public-002.md) -- Stricter variant for buckets tagged with sensitive data classifications (PHI, PII, confidential).
- [`INV.S3.PUBLIC.004`](inv-s3-public-004.md) -- Specifically checks ACL-based public read access to AllUsers or AuthenticatedUsers.
- [`INV.S3.PUBLIC.005`](inv-s3-public-005.md) -- Detects latent public read exposure masked only by Public Access Block.
- [`INV.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures Public Access Block is fully enabled as defense-in-depth.
