---
title: "Encryption at Rest Required"
sidebar_label: "INV.S3.ENCRYPT.001"
sidebar_position: 1
description: "S3 buckets must have server-side encryption enabled."
---

# Encryption at Rest Required

**ID:** `INV.S3.ENCRYPT.001`
**Category:** Encryption
**Severity:** High

## What This Checks

Every S3 bucket must have a default server-side encryption configuration enabled. Stave flags any bucket where `at_rest_enabled` is `false`, meaning objects are stored unencrypted at rest.

## Why It Matters

Unencrypted storage is the top audit finding in regulated industries. Without encryption at rest, anyone who gains physical or logical access to the underlying storage media can read the raw data. AWS strongly recommends enabling default encryption on all buckets to meet baseline security requirements.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "dsl_version": "out.v0.1",
  "summary": {
    "total_findings": 1,
    "unsafe_count": 1,
    "safe_count": 0
  },
  "findings": [
    {
      "invariant_id": "INV.S3.ENCRYPT.001",
      "resource_id": "arn:aws:s3:::acme-healthcare-patient-records",
      "status": "unsafe",
      "severity": "high",
      "message": "Encryption at Rest Required: S3 buckets must have server-side encryption enabled."
    }
  ]
}
```

## Correct Configuration

A safe observation has `at_rest_enabled` set to `true`:

```json
{
  "storage": {
    "kind": "bucket",
    "encryption": {
      "at_rest_enabled": true
    }
  }
}
```

Enable default bucket encryption using SSE-S3 (AES256) or SSE-KMS. Use `aws s3api put-bucket-encryption` to set the default encryption configuration. For sensitive data, use SSE-KMS with a customer-managed key.

## Related Invariants

- [`INV.S3.ENCRYPT.002`](./inv-s3-encrypt-002.md) -- Transport Encryption Required
- [`INV.S3.ENCRYPT.003`](./inv-s3-encrypt-003.md) -- PHI Buckets Must Use SSE-KMS with Customer-Managed Key
- [`INV.S3.ENCRYPT.004`](./inv-s3-encrypt-004.md) -- Sensitive Data Requires KMS Encryption
