---
title: "S3 Signed Upload Must Bind To Exact Object Key"
sidebar_label: "INV.S3.WRITE.SCOPE.001"
sidebar_position: 7
description: "Signed upload policies must restrict write permission to a single exact object key, not a prefix."
---

# S3 Signed Upload Must Bind To Exact Object Key

**ID:** `INV.S3.WRITE.SCOPE.001`
**Category:** Access Control
**Severity:** High

## What This Checks

Signed upload policies must restrict write permission to a single exact object key. Prefix-wide permissions (e.g., `starts-with $key files/`) are flagged as unsafe because they enable arbitrary overwrite and cross-tenant tampering.

## Why It Matters

Presigned S3 upload URLs are commonly used to let end users upload files directly to S3 without routing through your application server. When the upload policy uses a `starts-with` condition instead of an `eq` condition on the object key, the user can write to any key under that prefix. On a bucket like `acme-insurance-document-uploads`, a prefix-scoped policy meant for `claims/2026/doc-abc123.pdf` actually allows writing to `claims/2026/doc-anything.pdf` -- or overwriting another customer's claim document. Binding each signed upload to an exact key generated server-side eliminates this class of overwrite vulnerability entirely.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.WRITE.SCOPE.001",
  "invariant_name": "S3 Signed Upload Must Bind To Exact Object Key",
  "resource_id": "upload-api-acme-insurance-document-uploads",
  "resource_type": "s3_upload_policy",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "s3_upload.allowed_key_mode",
        "value": "prefix"
      },
      {
        "path": "s3_upload.operation",
        "value": "write"
      },
      {
        "path": "type",
        "value": "s3_upload_policy"
      }
    ],
    "first_unsafe_at": "2026-01-07T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 192,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 192 hours (threshold: 0 hours). Unsafe since 2026-01-07T00:00:00Z."
  },
  "mitigation": {
    "description": "Invariant violation detected.",
    "action": "Review the unsafe configuration and remediate."
  }
}
```

## Correct Configuration

A safe upload policy binds each signed upload to an exact object key:

```json
{
  "s3_upload": {
    "operation": "write",
    "allowed_key_mode": "exact"
  }
}
```

**To remediate:** Change the signed upload policy to use an exact key condition (`eq` instead of `starts-with`) that binds each upload to a specific object path. Generate unique object keys server-side using a UUID or content-addressable hash so that clients cannot control the destination key.

## Related Invariants

- [`INV.S3.TENANT.ISOLATION.001`](./inv-s3-tenant-isolation-001.md) -- Shared-Bucket Tenant Isolation Must Enforce Prefix (flags missing prefix enforcement on shared buckets, which compounds prefix-scoped upload risks)
- [`INV.S3.ACCESS.003`](./inv-s3-access-003.md) -- No External Write Access (flags external write grants at the bucket policy level)
- [`INV.S3.ACCESS.002`](./inv-s3-access-002.md) -- No Wildcard Action Policies (flags `s3:*` grants that implicitly include write operations)
