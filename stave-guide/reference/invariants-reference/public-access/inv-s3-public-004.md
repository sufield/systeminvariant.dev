---
title: "No Public Read via ACL"
sidebar_label: "CTL.S3.PUBLIC.004"
sidebar_position: 4
description: "S3 bucket ACLs must not grant read access to AllUsers or AuthenticatedUsers for PHI data."
---

# No Public Read via ACL

**ID:** `CTL.S3.PUBLIC.004`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 bucket ACLs must not grant read access to AllUsers or AuthenticatedUsers. This control fires when `public_read_via_acl` is `true`, specifically targeting ACL-based public exposure as distinct from policy-based exposure.

## Why It Matters

Bucket ACLs are a legacy access control mechanism that predates bucket policies and is easy to misconfigure. ACL grants to the `AllUsers` group expose every object in the bucket to the internet, while grants to `AuthenticatedUsers` expose them to any AWS account holder -- effectively the same as public. ACLs are particularly dangerous because they are less visible than bucket policies in most AWS console views and are frequently overlooked during security reviews.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.PUBLIC.004",
  "control_name": "No Public Read via ACL",
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
        "path": "properties.storage.visibility.public_read_via_acl",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket ACL grants read access to AllUsers or AuthenticatedUsers. Any anonymous or authenticated AWS user can read objects.",
    "action": "Replace the bucket ACL with \"BucketOwnerFullControl\" or remove the public read grant. Enable S3 Public Access Block with IgnorePublicAcls set to true."
  }
}
```

## Correct Configuration

A safe observation has `public_read_via_acl` set to `false`:

```json
{
  "properties": {
    "storage": {
      "visibility": {
        "public_read_via_acl": false
      }
    }
  }
}
```

## Related Controls

- [`CTL.S3.PUBLIC.001`](inv-s3-public-001.md) -- General check for public read access via any mechanism (policy or ACL).
- [`CTL.S3.ACL.WRITE.001`](inv-s3-acl-write-001.md) -- Checks for public write access via ACL, the write counterpart to this control.
- [`CTL.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures IgnorePublicAcls is enabled, which overrides ACL-based public grants.
