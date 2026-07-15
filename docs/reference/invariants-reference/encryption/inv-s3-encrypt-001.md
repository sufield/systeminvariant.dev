# Encryption at Rest Required

**ID:** `CTL.S3.ENCRYPT.001` **Category:** Encryption **Severity:** High

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

Every S3 bucket must have a default server-side encryption configuration enabled. Stave flags any bucket where `at_rest_enabled` is `false`, meaning objects are stored unencrypted at rest.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Unencrypted storage is the top audit finding in regulated industries. Without encryption at rest, anyone who gains physical or logical access to the underlying storage media can read the raw data. AWS strongly recommends enabling default encryption on all buckets to meet baseline security requirements.

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
      "control_id": "CTL.S3.ENCRYPT.001",
      "resource_id": "arn:aws:s3:::acme-healthcare-patient-records",
      "status": "unsafe",
      "severity": "high",
      "message": "Encryption at Rest Required: S3 buckets must have server-side encryption enabled."
    }
  ]
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `at_rest_enabled` set to `true`:

```
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

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ENCRYPT.002`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-002.md) -- Transport Encryption Required
* [`CTL.S3.ENCRYPT.003`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-003.md) -- PHI Buckets Must Use SSE-KMS with Customer-Managed Key
* [`CTL.S3.ENCRYPT.004`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-004.md) -- Sensitive Data Requires KMS Encryption
