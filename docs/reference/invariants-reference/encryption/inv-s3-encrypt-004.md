# Sensitive Data Requires KMS Encryption

**ID:** `CTL.S3.ENCRYPT.004` **Category:** Encryption **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets with any non-public data classification must use SSE-KMS encryption with a customer-managed key, not SSE-S3 (AES256). Stave flags any bucket where a `data-classification` tag is present, the classification is not `public` or `non-sensitive`, and the encryption algorithm is not `aws:kms`. This catches confidential, internal, PII, PCI, and any other classified data that falls short of KMS encryption.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

SSE-S3 (AES256) uses AWS-managed keys that provide no customer control over key rotation, access policies, or audit trails. For any data the organization has classified as sensitive, relying on AWS-managed keys means there is no way to revoke access by disabling a key, no CloudTrail logging of individual encrypt/decrypt operations, and no ability to enforce key usage policies. HIPAA 45 CFR 164.312(a)(2)(iv) specifically requires encryption mechanisms under the control of the covered entity for protected health information, and similar requirements exist across PCI-DSS and SOC 2 frameworks.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "dsl_version": "out.v0.1",
  "summary": {
    "total_findings": 1,
    "unsafe_count": 1,
    "safe_count": 0
  },
  "findings": [
    {
      "control_id": "CTL.S3.ENCRYPT.004",
      "resource_id": "arn:aws:s3:::acme-healthcare-patient-records",
      "status": "unsafe",
      "severity": "critical",
      "message": "Sensitive Data Requires KMS Encryption: S3 buckets with any non-public data classification must use SSE-KMS encryption with a customer-managed key, not SSE-S3 (AES256)."
    }
  ]
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has the encryption algorithm set to `aws:kms` with a classified data tag:

```
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

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ENCRYPT.001`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-001.md) -- Encryption at Rest Required
* [`CTL.S3.ENCRYPT.002`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-002.md) -- Transport Encryption Required
* [`CTL.S3.ENCRYPT.003`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-003.md) -- PHI Buckets Must Use SSE-KMS with Customer-Managed Key
* [`CTL.S3.GOVERNANCE.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-governance-001.md) -- Data Classification Tag Required
