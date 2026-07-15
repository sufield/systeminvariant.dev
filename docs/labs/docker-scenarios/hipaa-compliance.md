# HIPAA Multi-Violation

PHI (Protected Health Information) bucket with multiple HIPAA compliance failures: no encryption at rest, no transport encryption, no KMS key management, no access logging, no versioning, no object lock, and no Public Access Block.

## Background[​](#background "Direct link to Background")

HIPAA requires technical safeguards for electronic PHI including encryption, audit logging, integrity controls, and access controls. A single S3 bucket tagged for PHI data can accumulate many compliance violations simultaneously. Stave evaluates all applicable controls and reports each gap independently, giving compliance teams a clear remediation checklist.

## Bucket[​](#bucket "Direct link to Bucket")

`patient-records-east` — PHI bucket tagged with `data-classification: phi` and `compliance: hipaa`. Every security control is missing or disabled.

## Triggered Controls[​](#triggered-controls "Direct link to Triggered Controls")

| Control               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `CTL.S3.ENCRYPT.001`  | Encryption at Rest Required                            |
| `CTL.S3.ENCRYPT.002`  | Transport Encryption Required                          |
| `CTL.S3.ENCRYPT.003`  | PHI Buckets Must Use SSE-KMS with Customer-Managed Key |
| `CTL.S3.ENCRYPT.004`  | Sensitive Data Requires KMS Encryption                 |
| `CTL.S3.LOG.001`      | Access Logging Required                                |
| `CTL.S3.VERSION.001`  | Versioning Required                                    |
| `CTL.S3.LOCK.001`     | Compliance-Tagged Buckets Must Have Object Lock        |
| `CTL.S3.CONTROLS.001` | Public Access Block Must Be Enabled                    |

## Expected Findings[​](#expected-findings "Direct link to Expected Findings")

8 violations on 1 resource.
