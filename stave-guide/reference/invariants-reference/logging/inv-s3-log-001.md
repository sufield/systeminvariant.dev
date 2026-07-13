---
title: "Access Logging Required"
sidebar_label: "CTL.S3.LOG.001"
sidebar_position: 1
description: "S3 buckets must have server access logging enabled."
---

# Access Logging Required

**ID:** `CTL.S3.LOG.001`
**Category:** Logging
**Severity:** Medium

## What This Checks

S3 buckets must have server access logging enabled to provide an audit trail and visibility into data access patterns. The control flags any bucket where `logging.enabled` is `false`.

## Why It Matters

Server access logging is a foundational control for detecting unauthorized access, investigating security incidents, and meeting regulatory audit requirements. Without access logs, there is no record of who accessed what data and when, making forensic analysis impossible after a breach. For organizations handling protected health information, HIPAA audit control requirements under 45 CFR 164.312(b) mandate mechanisms to record and examine activity in systems that contain or use electronic PHI.

## What A Violation Looks Like

```bash
$ stave apply \
    --controls controls/s3 \
    --observations ./observations \
    --max-unsafe 0s \
    --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "schema": "out.v0.1",
  "summary": {
    "total_findings": 1,
    "unsafe_count": 1,
    "safe_count": 0
  },
  "findings": [
    {
      "control_id": "CTL.S3.LOG.001",
      "resource_id": "acme-healthcare-audit-logs",
      "status": "unsafe",
      "type": "unsafe_state",
      "severity": "medium",
      "message": "Bucket does not have server access logging enabled. There is no audit trail for data access patterns.",
      "mitigation": "Enable S3 server access logging and specify a target bucket for log delivery. Ensure the target bucket has appropriate access controls and is in the same region."
    }
  ]
}
```

## Correct Configuration

An observation with logging enabled satisfies this control:

```json
{
  "schema": "obs.v0.1",
  "source_type": "aws.s3.bucket",
  "resource_id": "acme-healthcare-audit-logs",
  "observed_at": "2026-01-15T00:00:00Z",
  "properties": {
    "storage": {
      "kind": "bucket",
      "logging": {
        "enabled": true,
        "target_bucket": "acme-central-logging",
        "target_prefix": "s3-access-logs/acme-healthcare-audit-logs/"
      }
    }
  }
}
```

## Related Controls

- [`CTL.S3.GOVERNANCE.001`](../lifecycle-governance/inv-s3-governance-001) -- Data Classification Tag Required. Buckets without a `data-classification` tag silently bypass sensitivity-gated checks. Logging and classification together ensure that access to sensitive buckets is both tracked and categorizable.
