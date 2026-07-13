---
title: "Sensitive Data Requires KMS Encryption"
sidebar_label: "INV.S3.ENCRYPT.004"
sidebar_position: 4
description: "S3 buckets with non-public data classification must use SSE-KMS encryption with a customer-managed key."
---

# Sensitive Data Requires KMS Encryption

**ID:** `INV.S3.ENCRYPT.004`
**Category:** Encryption
**Severity:** Critical

## What This Checks

S3 buckets with any non-public data classification must use SSE-KMS encryption with a customer-managed key, not SSE-S3 (AES256). Stave flags any bucket where a `data-classification` tag is present, the classification is not `public` or `non-sensitive`, and the encryption algorithm is not `aws:kms`. This catches confidential, internal, PII, PCI, and any other classified data that falls short of KMS encryption.

## Why It Matters

SSE-S3 (AES256) uses AWS-managed keys that provide no customer control over key rotation, access policies, or audit trails. For any data the organization has classified as sensitive, relying on AWS-managed keys means there is no way to revoke access by disabling a key, no CloudTrail logging of individual encrypt/decrypt operations, and no ability to enforce key usage policies. HIPAA 45 CFR 164.312(a)(2)(iv) specifically requires encryption mechanisms under the control of the covered entity for protected health information, and similar requirements exist across PCI-DSS and SOC 2 frameworks.

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
      "invariant_id": "INV.S3.ENCRYPT.004",
      "resource_id": "arn:aws:s3:::acme-healthcare-patient-records",
      "status": "unsafe",
      "severity": "critical",
      "message": "Sensitive Data Requires KMS Encryption: S3 buckets with any non-public data classification must use SSE-KMS encryption with a customer-managed key, not SSE-S3 (AES256)."
    }
  ]
}
```

## Correct Configuration

A safe observation has the encryption algorithm set to `aws:kms` with a classified data tag:

```json
{
  "storage": {
    "kind": "bucket",
    "tags": {
      "data-classification": "confidential"
    },
    "encryption": {
      "algorithm": "aws:kms"
    }
  }
}
```

Change the bucket default encryption to SSE-KMS with a customer-managed key. Re-encrypt existing objects by copying them in place with the new encryption settings.

## Related Invariants

- [`INV.S3.ENCRYPT.001`](./inv-s3-encrypt-001.md) -- Encryption at Rest Required
- [`INV.S3.ENCRYPT.002`](./inv-s3-encrypt-002.md) -- Transport Encryption Required
- [`INV.S3.ENCRYPT.003`](./inv-s3-encrypt-003.md) -- PHI Buckets Must Use SSE-KMS with Customer-Managed Key
- [`INV.S3.GOVERNANCE.001`](../lifecycle-governance/inv-s3-governance-001.md) -- Data Classification Tag Required
