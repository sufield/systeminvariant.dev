---
title: "HIPAA Compliance"
sidebar_label: "HIPAA Compliance"
sidebar_position: 2
description: "Evaluate S3 configurations against HIPAA Security Rule requirements using Stave's built-in HIPAA profile."
---

# HIPAA Compliance

Stave includes two complementary approaches to HIPAA compliance:

1. **HIPAA Pack** (`stave apply --profile hipaa`) — evaluates 11
   declarative YAML controls against S3 observations using the standard
   evaluation pipeline with duration-aware violation tracking.
2. **HIPAA Profile** (`stave evaluate --profile hipaa`) — runs
   programmatic Go invariants with compound risk detection, acknowledged
   exceptions, and structured compliance reporting.

Both approaches map to the same HIPAA Security Rule technical safeguards
but serve different workflows.

## Quick Start

### Using the HIPAA Pack (Standard Pipeline)

```bash
# Evaluate with the HIPAA pack (subset of S3 controls)
stave apply \
  --controls controls/s3 \
  --observations ./observations \
  --max-unsafe 0s \
  --eval-time 2026-01-15T00:00:00Z
```

The HIPAA pack selects 28 controls from the IAM and S3 catalogs that map to
HIPAA technical safeguards. Use `--max-unsafe 0s` for zero tolerance
on PHI exposure.

### Using the HIPAA Profile (Compliance Reporting)

```bash
# Evaluate with structured compliance reporting
stave evaluate --snapshot observations/snap.json --profile hipaa

# JSON output for automation
stave evaluate --snapshot snap.json --profile hipaa --format json --output report.json
```

Exit codes:
- `0` — all CRITICAL invariants pass
- `1` — one or more CRITICAL invariants fail
- `2` — input or configuration error

## HIPAA Technical Safeguards Mapping

### Access Control (45 CFR 164.312(a)(1))

| Control | Priority | What It Checks |
|---------|----------|----------------|
| ACCESS.001 | CRITICAL | Block Public Access fully enabled at bucket level |
| ACCESS.002 | HIGH | No wildcard `s3:*` actions in Allow statements |
| ACCESS.003 | HIGH | VPC endpoint or IP restriction for transmission security |
| ACCESS.009 | MEDIUM | Presigned URL restriction for PHI buckets |

### Encryption (45 CFR 164.312(a)(2)(iv), 164.312(e))

| Control | Priority | What It Checks |
|---------|----------|----------------|
| CONTROLS.001.STRICT | CRITICAL | SSE-KMS with customer-managed key (CMK) |
| CONTROLS.004 | CRITICAL | Deny non-TLS access via bucket policy |
| CONTROLS.002 | MEDIUM | Versioning enabled for data integrity |

### Audit Controls (45 CFR 164.312(b))

| Control | Priority | What It Checks |
|---------|----------|----------------|
| AUDIT.001 | CRITICAL | Server access logging enabled with target bucket |
| AUDIT.002 | HIGH | Object-level logging for PHI access audit trail |

### Governance & Retention

| Control | Priority | What It Checks |
|---------|----------|----------------|
| GOVERNANCE.001 | HIGH | ACLs disabled (BucketOwnerEnforced) |
| RETENTION.002 | HIGH | Object Lock enabled with 6-year minimum retention |

## Compound Risk Detection

The HIPAA profile detects dangerous combinations of control results:

| Compound Risk | Triggers | Severity | What It Means |
|---------------|----------|----------|---------------|
| COMPOUND.001 | ACCESS.001 + ACCESS.002 both fail | CRITICAL | Public access AND broad IAM policy — S3+IAM lateral movement |
| COMPOUND.002 | CONTROLS.001 passes, ACCESS.001 fails | HIGH | Encryption without access control — encrypting data anyone can read |
| COMPOUND.003 | ACCESS.003 passes, ACCESS.006 fails | HIGH | VPC endpoint exists but no endpoint policy — false network isolation |

## Acknowledged Exceptions

When a control cannot be remediated immediately, declare an exception
in `stave.yaml` next to the snapshot:

```yaml
exceptions:
  - control_id: CONTROLS.001.STRICT
    bucket: legacy-archive-bucket
    rationale: "Legacy system migration in progress — CMK migration scheduled for Q3"
    acknowledged_by: security-team@example.com
    acknowledged_date: "2026-01-15"
    requires_passing:
      - CONTROLS.001    # Base encryption must still be enabled
      - AUDIT.001       # Logging must be active during exception period
```

The exception is valid only if all compensating controls in
`requires_passing` are passing. Otherwise the finding remains with a
note that the compensating control is not met.

## S3 Control Mapping (Standard Pipeline)

The standard `stave apply` pipeline uses YAML-based controls from the
S3 catalog. These map to HIPAA requirements:

| Stave Control | HIPAA Safeguard | What It Checks |
|---------------|-----------------|----------------|
| `CTL.S3.PUBLIC.001` | Access Control | No public read or list access |
| `CTL.S3.CONTROLS.001` | Access Control | Public Access Block fully enabled |
| `CTL.S3.ENCRYPT.001` | Encryption at Rest | Server-side encryption enabled |
| `CTL.S3.ENCRYPT.002` | Encryption in Transit | HTTPS enforced via bucket policy |
| `CTL.S3.ENCRYPT.003` | PHI Encryption | PHI buckets use SSE-KMS with CMK |
| `CTL.S3.LOG.001` | Audit Controls | Server access logging enabled |
| `CTL.S3.VERSION.001` | Integrity | Versioning enabled |
| `CTL.S3.LOCK.001` | Retention | Object Lock on compliance-tagged buckets |
| `CTL.S3.LOCK.003` | Retention | 6-year minimum retention for PHI |

## Report Output

### Text Report

```
HIPAA Security Rule — S3 Configuration Report
Profile: hipaa (HIPAA Security Rule)

--- CRITICAL ---
[FAIL] CONTROLS.001.STRICT  CMK encryption required  §164.312(a)(2)(iv)
       Bucket: prod-phi-data
       Finding: SSE uses aws:kms but key is AWS-managed (alias/aws/s3)
       Fix: Switch to customer-managed KMS key for breach-response revocation

--- COMPOUND RISKS ---
[RISK] COMPOUND.001  Public access + overly broad IAM policy  CRITICAL
       ACCESS.001 failed AND ACCESS.002 failed

Summary: 2 CRITICAL, 1 HIGH, 0 MEDIUM — FAIL
```

### JSON Report

```bash
stave evaluate --snapshot snap.json --profile hipaa --format json | jq '.summary'
```

Returns structured JSON with `results`, `compound_findings`,
`acknowledged`, and `counts` sections.

## Limitations

- Stave evaluates **technical controls only**. A BAA with AWS is a
  contractual prerequisite for HIPAA compliance that Stave cannot verify.
- Controls that read CloudTrail or VPC endpoint data (AUDIT.002,
  ACCESS.006) require extractors that call `aws cloudtrail
  get-event-selectors` and `aws ec2 describe-vpc-endpoints`
  respectively. If these observation fields are absent, the controls
  fail with a message about what data is needed.
- Some HIPAA obligations (log review processes, malware scanning, minimum
  necessary access) are process or multi-service requirements that cannot
  be proven from S3 bucket configuration alone.

<!-- NOTE: The CFR section mappings are based on standard HIPAA-to-S3 technical control mappings. Verify against your organization's compliance framework for official audit documentation. -->
