---
title: "No Public Read via Policy"
sidebar_label: "CTL.S3.PUBLIC.007"
sidebar_position: 7
description: "S3 bucket policies must not grant public read access via Principal * with read actions."
---

# No Public Read via Policy

**ID:** `CTL.S3.PUBLIC.007`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 bucket policies must not grant public read access. This control fires when `public_read_via_policy` is `true`, meaning the bucket policy contains a statement granting read actions (such as `s3:GetObject`) to `Principal: "*"` or `Principal: {"AWS": "*"}`.

## Why It Matters

A bucket policy granting `s3:GetObject` to `Principal: "*"` allows anyone on the internet to download objects. Unlike ACL-based exposure, policy-based exposure can target specific prefixes or conditions, making it harder to detect with simple checks. Attackers routinely scan for public S3 policies, and a single misconfigured statement can expose an entire bucket's contents. This control detects the specific mechanism -- policy-based read grants -- so teams can remediate the root cause rather than relying solely on Public Access Block.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.PUBLIC.007",
  "control_name": "No Public Read via Policy",
  "resource_id": "acme-public-assets",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.visibility.public_read_via_policy",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket policy grants public read (Principal \"*\" with read action).",
    "action": "Remove or constrain the public policy statement. Use restrictive principals or conditions and keep Public Access Block enabled."
  }
}
```

## Correct Configuration

A safe observation has `public_read_via_policy` set to `false`:

```json
{
  "properties": {
    "storage": {
      "visibility": {
        "public_read_via_policy": false
      }
    }
  }
}
```

## Related Controls

- [`CTL.S3.PUBLIC.008`](inv-s3-public-008.md) -- The listing counterpart: detects public listing granted via bucket policy.
- [`CTL.S3.PUBLIC.001`](inv-s3-public-001.md) -- Broader check for any public read access regardless of mechanism.
- [`CTL.S3.PUBLIC.005`](inv-s3-public-005.md) -- Detects latent public read exposure masked by PAB.
- [`CTL.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures Public Access Block is enabled as defense-in-depth.
