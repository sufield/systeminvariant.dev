---
title: "No Authenticated-Users Write Access"
sidebar_label: "CTL.S3.AUTH.WRITE.001"
sidebar_position: 5
description: "S3 buckets must not grant write or delete access to all authenticated AWS users."
---

# No Authenticated-Users Write Access

**ID:** `CTL.S3.AUTH.WRITE.001`
**Category:** Access Control
**Severity:** Critical

## What This Checks

S3 buckets must not grant write or delete access to the `AuthenticatedUsers` predefined group. Any bucket where `authenticated_users_write` is true is flagged as unsafe.

## Why It Matters

The `AuthenticatedUsers` group includes every AWS account holder worldwide -- not just users in your organization. Granting write access to this group means any person with a free AWS account can upload, overwrite, or delete objects. On a bucket like `acme-platform-user-uploads`, this enables data injection (uploading malicious files that the application serves to other users), ransomware (overwriting legitimate files), and supply chain poisoning (replacing build artifacts or dependencies). Bug bounty researchers actively scan for this misconfiguration because the exploitation path is straightforward: a single `aws s3 cp` command from any AWS account.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.AUTH.WRITE.001",
  "control_name": "No Authenticated-Users Write Access",
  "resource_id": "acme-platform-user-uploads",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.visibility.authenticated_users_write",
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
    "description": "Bucket grants write access to the AuthenticatedUsers group. Any AWS account holder worldwide can upload or overwrite objects.",
    "action": "Remove the ACL grant or policy statement granting write access to AuthenticatedUsers. Replace with specific IAM principals or use bucket policy with explicit account IDs. Enable S3 Public Access Block with BlockPublicAcls and IgnorePublicAcls set to true."
  }
}
```

## Correct Configuration

A safe bucket does not grant write access to the AuthenticatedUsers group:

```json
{
  "storage": {
    "visibility": {
      "authenticated_users_write": false
    }
  }
}
```

**To remediate:** Remove the ACL grant to `AuthenticatedUsers` for write permissions. Replace with specific IAM principals or use a bucket policy with explicit account IDs. Enable S3 Public Access Block with `IgnorePublicAcls` set to `true` to neutralize any remaining ACL-based grants.

## Related Controls

- [`CTL.S3.AUTH.READ.001`](inv-s3-auth-read-001.md) -- No Authenticated-Users Read Access (flags `AuthenticatedUsers` read grants, the read equivalent)
- [`CTL.S3.ACL.WRITE.001`](../public-access/inv-s3-acl-write-001.md) -- No Public Write via ACL (flags `AllUsers` write grants, the fully public equivalent)
- [`CTL.S3.ACL.ESCALATION.001`](../acl-escalation/inv-s3-acl-escalation-001.md) -- No Public ACL Modification (flags ACL modification, a more severe escalation)
- [`CTL.S3.CONTROLS.001`](../public-access/inv-s3-controls-001.md) -- Public Access Block Must Be Enabled (PAB can mitigate ACL-based grants)
