---
title: "No Public List via Policy"
sidebar_label: "INV.S3.PUBLIC.008"
sidebar_position: 8
description: "S3 bucket policies must not grant anonymous object listing via Principal * with list actions."
---

# No Public List via Policy

**ID:** `INV.S3.PUBLIC.008`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 bucket policies must not grant anonymous object listing. This invariant fires when `public_list_via_policy` is `true`, meaning the bucket policy contains a statement granting list actions (such as `s3:ListBucket`) to `Principal: "*"` or `Principal: {"AWS": "*"}`.

## Why It Matters

Public listing allows anyone to enumerate every object key in the bucket. Attackers use listing to discover sensitive file names, directory structures, backup files, and configuration artifacts before downloading them. Even when individual objects are not publicly readable, listing reveals naming patterns and internal organization. Combined with other access vectors, listing is the first step in a targeted data exfiltration attack.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.PUBLIC.008",
  "invariant_name": "No Public List via Policy",
  "resource_id": "acme-internal-reports",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.visibility.public_list_via_policy",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket policy grants public listing (Principal \"*\" with list action).",
    "action": "Remove or constrain policy statements allowing s3:ListBucket to anonymous principals."
  }
}
```

## Correct Configuration

A safe observation has `public_list_via_policy` set to `false`:

```json
{
  "properties": {
    "storage": {
      "visibility": {
        "public_list_via_policy": false
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.PUBLIC.007`](inv-s3-public-007.md) -- The read counterpart: detects public read granted via bucket policy.
- [`INV.S3.PUBLIC.LIST.001`](inv-s3-public-list-001.md) -- Broader check for any public listing regardless of mechanism.
- [`INV.S3.PUBLIC.006`](inv-s3-public-006.md) -- Detects latent public listing masked by PAB.
- [`INV.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures Public Access Block is enabled as defense-in-depth.
