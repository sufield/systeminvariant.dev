---
title: "No Public S3 Bucket Listing"
sidebar_label: "INV.S3.PUBLIC.LIST.001"
sidebar_position: 7
description: "S3 buckets must not allow anonymous listing of objects."
---

# No Public S3 Bucket Listing

**ID:** `INV.S3.PUBLIC.LIST.001`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 buckets must not allow anonymous listing of objects. This invariant fires when `public_list` is `true`, meaning anyone on the internet can enumerate all object keys in the bucket.

## Why It Matters

Public listing exposes the complete directory structure of a bucket, including every object key. Attackers use listing to map out the contents before downloading specific high-value targets -- database dumps, configuration files with embedded credentials, backups of production systems. Even when individual objects are not sensitive, the key names themselves can reveal internal project names, customer identifiers, or infrastructure details that aid further attacks.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.PUBLIC.LIST.001",
  "invariant_name": "No Public S3 Bucket Listing",
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
        "path": "properties.storage.visibility.public_list",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket allows anonymous listing of objects. Public listing exposes all object keys, enabling targeted data exfiltration.",
    "action": "Remove bucket policy statements that grant s3:ListBucket to Principal \"*\". Remove ACL grants that allow READ to AllUsers. Enable S3 Public Access Block."
  }
}
```

## Correct Configuration

A safe observation has `public_list` set to `false`:

```json
{
  "properties": {
    "storage": {
      "visibility": {
        "public_list": false
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.PUBLIC.LIST.002`](inv-s3-public-list-002.md) -- Allows public listing only when explicitly tagged as intended, for buckets that serve public content by design.
- [`INV.S3.PUBLIC.006`](inv-s3-public-006.md) -- Detects latent public listing masked only by Public Access Block.
- [`INV.S3.PUBLIC.001`](inv-s3-public-001.md) -- General public access check that also covers public listing alongside public read.
