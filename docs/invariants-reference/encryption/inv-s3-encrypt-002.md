---
title: "Transport Encryption Required"
sidebar_label: "INV.S3.ENCRYPT.002"
sidebar_position: 2
description: "S3 buckets must enforce HTTPS via a deny policy on aws:SecureTransport=false."
---

# Transport Encryption Required

**ID:** `INV.S3.ENCRYPT.002`
**Category:** Encryption
**Severity:** High

## What This Checks

Every S3 bucket must enforce HTTPS for all API calls by including a bucket policy that denies requests when `aws:SecureTransport` is `false`. Stave flags any bucket where `in_transit_enforced` is `false`.

## Why It Matters

Without a transport encryption policy, S3 accepts requests over plain HTTP. Data transferred in cleartext is vulnerable to interception, man-in-the-middle attacks, and passive eavesdropping on the network path. Enforcing HTTPS ensures that credentials, headers, and object data are encrypted during transit between clients and AWS.

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
      "invariant_id": "INV.S3.ENCRYPT.002",
      "resource_id": "arn:aws:s3:::acme-healthcare-patient-records",
      "status": "unsafe",
      "severity": "high",
      "message": "Transport Encryption Required: S3 buckets must enforce HTTPS via a deny policy on aws:SecureTransport=false."
    }
  ]
}
```

## Correct Configuration

A safe observation has `in_transit_enforced` set to `true`:

```json
{
  "storage": {
    "kind": "bucket",
    "encryption": {
      "in_transit_enforced": true
    }
  }
}
```

Add a bucket policy statement that denies all actions when `aws:SecureTransport` is `false`. This forces all API calls to use HTTPS.

## Related Invariants

- [`INV.S3.ENCRYPT.001`](./inv-s3-encrypt-001.md) -- Encryption at Rest Required
- [`INV.S3.ENCRYPT.003`](./inv-s3-encrypt-003.md) -- PHI Buckets Must Use SSE-KMS with Customer-Managed Key
- [`INV.S3.ENCRYPT.004`](./inv-s3-encrypt-004.md) -- Sensitive Data Requires KMS Encryption
