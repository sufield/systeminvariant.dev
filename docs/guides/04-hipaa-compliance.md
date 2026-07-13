---
title: "HIPAA Compliance"
sidebar_label: "HIPAA Compliance"
sidebar_position: 4
description: "How Stave's S3 invariants map to HIPAA technical safeguard requirements."
---

# HIPAA Compliance

Stave ships with S3 invariants that directly address HIPAA Security Rule technical safeguard requirements for protected health information (PHI) stored in AWS S3.

## HIPAA Technical Safeguards Mapping

### Access Control (45 CFR 164.312(a)(1))

HIPAA requires implementing technical policies to allow access only to authorized persons.

| Stave Invariant | HIPAA Requirement | What It Checks |
|----------------|-------------------|----------------|
| `INV.S3.PUBLIC.001` | Prevent unauthorized access | No public read or list access on any bucket |
| `INV.S3.PUBLIC.002` | PHI access restricted | No public access on PHI/PII/confidential buckets |
| `INV.S3.PUBLIC.003` | No unauthorized modification | No public write access |
| `INV.S3.ACL.WRITE.001` | No unauthorized modification | No public write via ACL |
| `INV.S3.AUTH.READ.001` | Restrict to authorized users | No authenticated-users (all AWS accounts) read access |
| `INV.S3.CONTROLS.001` | Defense-in-depth access control | Public Access Block must be fully enabled |
| `INV.S3.ACCESS.001` | Limit access to authorized accounts | No unauthorized cross-account access |
| `INV.S3.ACCESS.003` | Limit write to authorized accounts | No external write access |

### Encryption (45 CFR 164.312(a)(2)(iv), 164.312(e)(1))

HIPAA requires encryption for PHI at rest and in transit.

| Stave Invariant | HIPAA Requirement | What It Checks |
|----------------|-------------------|----------------|
| `INV.S3.ENCRYPT.001` | Encryption at rest | All buckets have server-side encryption |
| `INV.S3.ENCRYPT.002` | Encryption in transit | HTTPS enforced via bucket policy |
| `INV.S3.ENCRYPT.003` | PHI encryption with CMK | PHI buckets use SSE-KMS with customer-managed keys |
| `INV.S3.ENCRYPT.004` | Sensitive data encryption | Non-public classified data uses SSE-KMS |

### Audit Controls (45 CFR 164.312(b))

HIPAA requires mechanisms to record and examine activity in systems containing PHI.

| Stave Invariant | HIPAA Requirement | What It Checks |
|----------------|-------------------|----------------|
| `INV.S3.LOG.001` | Activity logging | S3 server access logging enabled |
| `INV.S3.GOVERNANCE.001` | Data classification | All buckets have a `data-classification` tag |

### Integrity Controls (45 CFR 164.312(c)(1))

HIPAA requires mechanisms to protect PHI from improper alteration or destruction.

| Stave Invariant | HIPAA Requirement | What It Checks |
|----------------|-------------------|----------------|
| `INV.S3.VERSION.001` | Protection against deletion | Versioning enabled for recovery |
| `INV.S3.VERSION.002` | Tamper protection for backups | MFA delete on backup buckets |
| `INV.S3.LOCK.001` | Immutable compliance records | Object Lock on compliance-tagged buckets |
| `INV.S3.LOCK.002` | WORM for PHI | COMPLIANCE mode (not GOVERNANCE) for PHI |
| `INV.S3.LOCK.003` | Minimum retention period | 2190-day (6-year) retention for PHI |

### Data Retention (45 CFR 164.530(j))

HIPAA requires retaining documentation for 6 years from the date of creation or the date it was last in effect.

| Stave Invariant | HIPAA Requirement | What It Checks |
|----------------|-------------------|----------------|
| `INV.S3.LIFECYCLE.001` | Retention rules exist | Retention-tagged buckets have lifecycle rules |
| `INV.S3.LIFECYCLE.002` | Minimum retention period | PHI not expired before 2190 days (6 years) |
| `INV.S3.LOCK.003` | WORM retention period | Object Lock retention meets 6-year minimum |

## Running the HIPAA Profile

Evaluate your S3 observations against all S3 invariants:

```bash
stave apply \
  --invariants invariants/s3 \
  --observations ./observations \
  --max-unsafe 0s
```

Using `--max-unsafe 0s` means any violation is flagged immediately, which is appropriate for PHI data where there is zero tolerance for exposure.

For the healthcare-specific evaluation pipeline:

```bash
# Extract only health-scoped buckets
stave ingest --profile mvp1-s3 --input ./aws-snapshot --out observations.json

# Evaluate against built-in invariants
stave apply --profile mvp1-s3 --input observations.json
```

The `extract` and `apply` commands with `--profile mvp1-s3` default to healthcare scope — they only include buckets tagged with `DataDomain=health` or `containsPHI=true`.

## Generating Remediation Artifacts

For violations involving public access, generate Terraform remediation:

```bash
stave enforce --in ./results/evaluation.json --out ./results --mode pab
```

This produces a Terraform file at `./results/enforcement/aws/pab.tf` with `aws_s3_bucket_public_access_block` resources for each violating bucket.

For an organization-wide Service Control Policy:

```bash
stave enforce --in ./results/evaluation.json --out ./results --mode scp
```

<!-- NOTE: The specific CFR section mappings above are based on standard HIPAA-to-S3 technical control mappings. Verify against your organization's compliance framework for official audit documentation. -->
