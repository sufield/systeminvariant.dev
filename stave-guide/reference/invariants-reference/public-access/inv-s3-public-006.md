---
title: "No Latent Public Bucket Listing"
sidebar_label: "CTL.S3.PUBLIC.006"
sidebar_position: 6
description: "S3 buckets must not have a latent public listing exposure masked only by Public Access Block."
---

# No Latent Public Bucket Listing

**ID:** `CTL.S3.PUBLIC.006`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 buckets must not have a policy or ACL that would allow public listing if the Public Access Block were removed. This control fires when the bucket `kind` is `bucket` and `latent_public_list` is `true`, meaning directory enumeration is one PAB toggle away.

## Why It Matters

Directory enumeration is often the first step in a targeted attack. When an attacker can list all object keys in a bucket, they can identify high-value files -- database backups, credentials, internal documents -- without guessing paths. A latent listing exposure means this capability is masked only by the Public Access Block. If PAB is removed during an infrastructure change, every object key in the bucket becomes visible. Relying on a single control to prevent enumeration violates defense-in-depth.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.PUBLIC.006",
  "control_name": "No Latent Public Bucket Listing",
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
        "path": "properties.storage.visibility.latent_public_list",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket has a policy or ACL that would allow public listing if the Public Access Block were removed. One configuration change away from exposing all object keys.",
    "action": "Remove the underlying policy statement or ACL entry that grants s3:ListBucket to Principal \"*\" or AllUsers. Do not rely solely on PAB to prevent directory enumeration."
  }
}
```

## Correct Configuration

A safe observation has `latent_public_list` set to `false`:

```json
{
  "properties": {
    "storage": {
      "kind": "bucket",
      "visibility": {
        "latent_public_list": false
      }
    }
  }
}
```

## Related Controls

- [`CTL.S3.PUBLIC.005`](inv-s3-public-005.md) -- The read counterpart: detects latent public read exposure masked only by PAB.
- [`CTL.S3.PUBLIC.LIST.001`](inv-s3-public-list-001.md) -- Detects active (not latent) public bucket listing where PAB is not blocking it.
- [`CTL.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures PAB is enabled; this control catches the case where PAB is the only thing preventing listing.
