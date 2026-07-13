---
title: "Public Access Block Must Be Enabled"
sidebar_label: "INV.S3.CONTROLS.001"
sidebar_position: 11
description: "S3 buckets must have the public access block fully enabled with all four settings."
---

# Public Access Block Must Be Enabled

**ID:** `INV.S3.CONTROLS.001`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 buckets must have the S3 Public Access Block fully enabled with all four settings active. This invariant fires when the bucket `kind` is `bucket` and `public_access_fully_blocked` is `false`, meaning at least one of the four PAB settings is disabled.

## Why It Matters

The S3 Public Access Block is the primary safety net against accidental public exposure from policy or ACL changes. Without all four settings enabled -- BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets -- a single misconfigured bucket policy or ACL grant can immediately expose data to the internet. This invariant detects the enabling condition for public access rather than the exposure itself. It catches buckets that are one policy change away from being public, even if they are not currently exposed.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.CONTROLS.001",
  "invariant_name": "Public Access Block Must Be Enabled",
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
        "path": "properties.storage.kind",
        "value": "bucket"
      },
      {
        "path": "properties.storage.controls.public_access_fully_blocked",
        "value": false
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Public Access Block is not fully enabled. The bucket has no safety net against accidental public exposure from policy or ACL changes.",
    "action": "Enable all four Public Access Block settings on the bucket: BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets."
  }
}
```

## Correct Configuration

A safe observation has `public_access_fully_blocked` set to `true`:

```json
{
  "properties": {
    "storage": {
      "kind": "bucket",
      "controls": {
        "public_access_fully_blocked": true
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.PUBLIC.005`](inv-s3-public-005.md) -- Detects latent public read exposure masked by PAB; this invariant ensures PAB is the first line of defense.
- [`INV.S3.PUBLIC.006`](inv-s3-public-006.md) -- Detects latent public listing masked by PAB.
- [`INV.S3.PUBLIC.001`](inv-s3-public-001.md) -- Detects active public read access; without PAB enabled, policy mistakes become immediate exposures.
- [`INV.S3.ACL.WRITE.001`](inv-s3-acl-write-001.md) -- ACL-based write access that PAB's BlockPublicAcls and IgnorePublicAcls settings would block.
