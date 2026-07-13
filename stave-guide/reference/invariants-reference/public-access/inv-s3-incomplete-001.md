---
title: "Complete Data Required for Safety Assessment"
sidebar_label: "CTL.S3.INCOMPLETE.001"
sidebar_position: 12
description: "S3 bucket safety cannot be proven when policy or ACL data is missing from the snapshot."
---

# Complete Data Required for Safety Assessment

**ID:** `CTL.S3.INCOMPLETE.001`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 bucket safety cannot be proven when policy or ACL data is missing from the observation snapshot. This control fires when `safety_provable` is `false`, meaning the collector was unable to read the bucket's policy, ACL, or public access status -- so Stave cannot determine whether the bucket is safe or unsafe.

## Why It Matters

A bucket whose safety cannot be assessed is effectively unsafe from a compliance perspective. If the observation collector lacks the IAM permissions to read bucket policies and ACLs, the resulting snapshot contains gaps that prevent any safety determination. This control treats incomplete data as a violation rather than silently skipping the bucket. The most common cause is a collector IAM role that is missing `s3:GetBucketPolicy`, `s3:GetBucketAcl`, or `s3:GetBucketPolicyStatus` permissions. Fixing the collector permissions resolves the violation without requiring any change to the bucket itself.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.INCOMPLETE.001",
  "control_name": "Complete Data Required for Safety Assessment",
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
        "path": "safety_provable",
        "value": false
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket safety cannot be assessed because policy or ACL data is missing from the observation snapshot. The bucket may be safe but cannot be proven so.",
    "action": "Re-run the observation collector with full permissions to read bucket policies and ACLs. Ensure the collector IAM role has s3:GetBucketPolicy, s3:GetBucketAcl, and s3:GetBucketPolicyStatus permissions."
  }
}
```

## Correct Configuration

A safe observation has `safety_provable` set to `true`, meaning the collector successfully read all required bucket metadata:

```json
{
  "properties": {
    "safety_provable": true
  }
}
```

## Related Controls

- [`CTL.S3.PUBLIC.001`](inv-s3-public-001.md) -- Cannot produce a meaningful result when safety is not provable; this control catches the gap.
- [`CTL.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Requires complete data to verify that Public Access Block is enabled.
- [`CTL.S3.PUBLIC.005`](inv-s3-public-005.md) -- Latent exposure detection depends on complete policy and ACL data being available.
