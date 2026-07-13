---
title: "PHI Buckets Must Use SSE-KMS with Customer-Managed Key"
sidebar_label: "INV.S3.ENCRYPT.003"
sidebar_position: 3
description: "S3 buckets tagged with data-classification=phi must use SSE-KMS encryption with a customer-managed key."
---

# PHI Buckets Must Use SSE-KMS with Customer-Managed Key

**ID:** `INV.S3.ENCRYPT.003`
**Category:** Encryption
**Severity:** Critical

## What This Checks

S3 buckets tagged with `data-classification=phi` must use SSE-KMS encryption with a customer-managed key (CMK), not the default AWS-managed key or SSE-S3. Stave flags any PHI bucket where the encryption algorithm is not `aws:kms` or the `kms_key_id` is empty.

## Why It Matters

HIPAA 45 CFR 164.312(a)(2)(iv) requires covered entities to implement encryption mechanisms to protect electronic protected health information (ePHI). Using SSE-S3 or the default AWS-managed KMS key means the organization has no control over key rotation schedules, key access policies, or encryption audit trails. A customer-managed KMS key gives the organization full control over who can use the key, when keys rotate, and provides CloudTrail logging of every encrypt and decrypt operation -- all required for demonstrating HIPAA compliance during audits.

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
      "invariant_id": "INV.S3.ENCRYPT.003",
      "resource_id": "arn:aws:s3:::acme-healthcare-patient-records",
      "status": "unsafe",
      "severity": "critical",
      "message": "PHI Buckets Must Use SSE-KMS with Customer-Managed Key: S3 buckets tagged with data-classification=phi must use SSE-KMS encryption with a customer-managed key (CMK), not the default AWS-managed key or SSE-S3."
    }
  ]
}
```

## Correct Configuration

A safe observation has the encryption algorithm set to `aws:kms` with a valid customer-managed KMS key ARN:

```json
{
  "storage": {
    "tags": {
      "data-classification": "phi"
    },
    "encryption": {
      "algorithm": "aws:kms",
      "kms_key_id": "arn:aws:kms:us-east-1:123456789012:key/example-key-id"
    }
  }
}
```

Change the bucket default encryption to SSE-KMS and specify a customer-managed KMS key ARN. Ensure the KMS key policy grants access only to authorized principals. Enable KMS key rotation.

## Related Invariants

- [`INV.S3.ENCRYPT.001`](./inv-s3-encrypt-001.md) -- Encryption at Rest Required
- [`INV.S3.ENCRYPT.002`](./inv-s3-encrypt-002.md) -- Transport Encryption Required
- [`INV.S3.ENCRYPT.004`](./inv-s3-encrypt-004.md) -- Sensitive Data Requires KMS Encryption
- [`INV.S3.GOVERNANCE.001`](../lifecycle-governance/inv-s3-governance-001.md) -- Data Classification Tag Required
