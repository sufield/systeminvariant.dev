---
title: "No FULL_CONTROL ACL Grants to Public"
sidebar_label: "INV.S3.ACL.FULLCONTROL.001"
sidebar_position: 3
description: "S3 bucket ACLs must not grant FULL_CONTROL to AllUsers or AuthenticatedUsers."
---

# No FULL_CONTROL ACL Grants to Public

**ID:** `INV.S3.ACL.FULLCONTROL.001`
**Category:** ACL Privilege Escalation
**Severity:** Critical

## What This Checks

S3 bucket ACLs must not grant `FULL_CONTROL` to `AllUsers` or `AuthenticatedUsers`. Any bucket where `acl.has_full_control_public` or `acl.has_full_control_authenticated` is true is flagged as unsafe.

## Why It Matters

`FULL_CONTROL` is the worst-case ACL misconfiguration. The grantee can read, write, and delete objects and modify the ACL itself. A bucket with `FULL_CONTROL` granted to `AllUsers` would trigger several individual visibility flags (`public_read`, `public_write`, `public_acl_writable`), but the observation model tracks the grant type directly so Stave can distinguish "read+write via separate grants" from "FULL_CONTROL" -- the latter is worse because it inherently includes ACL modification capability that cannot be revoked without changing the ACL. Bug bounty reports consistently show this as the most damaging S3 ACL misconfiguration.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.ACL.FULLCONTROL.001",
  "invariant_name": "No FULL_CONTROL ACL Grants to Public",
  "resource_id": "acme-shared-workspace",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.acl.has_full_control_public",
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
    "description": "Bucket ACL grants FULL_CONTROL to AllUsers or AuthenticatedUsers. This grants complete control including object read/write/delete and ACL modification.",
    "action": "Replace the bucket ACL with \"BucketOwnerFullControl\" or remove the FULL_CONTROL grant to public groups. Enable S3 Public Access Block with BlockPublicAcls and IgnorePublicAcls set to true."
  }
}
```

## Correct Configuration

A safe bucket does not grant FULL_CONTROL to public or authenticated users:

```json
{
  "storage": {
    "acl": {
      "has_full_control_public": false,
      "has_full_control_authenticated": false
    }
  }
}
```

**To remediate:** Replace the bucket ACL with `BucketOwnerFullControl` or remove the `FULL_CONTROL` grant to `AllUsers`/`AuthenticatedUsers`. Enable S3 Public Access Block with `BlockPublicAcls` and `IgnorePublicAcls` set to `true`.

## Related Invariants

- [`INV.S3.ACL.ESCALATION.001`](./inv-s3-acl-escalation-001.md) -- No Public ACL Modification (FULL_CONTROL implies WRITE_ACP)
- [`INV.S3.ACL.RECON.001`](./inv-s3-acl-recon-001.md) -- No Public ACL Readability (FULL_CONTROL implies READ_ACP)
- [`INV.S3.PUBLIC.004`](../public-access/inv-s3-public-004.md) -- No Public Read via ACL (FULL_CONTROL implies READ)
- [`INV.S3.ACL.WRITE.001`](../public-access/inv-s3-acl-write-001.md) -- No Public Write via ACL (FULL_CONTROL implies WRITE)
