---
title: "Compliance-Tagged Buckets Must Have Object Lock Enabled"
sidebar_label: "INV.S3.LOCK.001"
sidebar_position: 6
description: "Buckets tagged with a compliance framework must have S3 Object Lock enabled for WORM protection."
---

# Compliance-Tagged Buckets Must Have Object Lock Enabled

**ID:** `INV.S3.LOCK.001`
**Category:** Lifecycle and Governance
**Severity:** Critical

## What This Checks

S3 buckets tagged with any compliance framework (such as `hipaa`, `soc2`, `gdpr`, or `pci-dss`) must have S3 Object Lock enabled. This invariant fires when a compliance-tagged bucket has `object_lock.enabled` set to `false`.

## Why It Matters

Regulatory frameworks including HIPAA, SOC 2, GDPR, and PCI-DSS require immutable storage for audit logs, compliance records, and protected data. S3 Object Lock provides Write Once Read Many (WORM) protection, preventing objects from being deleted or overwritten for a specified retention period. Without Object Lock, a compromised credential, a malicious insider, or even an accidental script can modify or destroy records that regulations require to be preserved in their original form. Auditors expect immutability controls on compliance-scoped storage.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.LOCK.001",
  "invariant_name": "Compliance-Tagged Buckets Must Have Object Lock Enabled",
  "resource_id": "acme-healthcare-patient-records",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.tags.compliance",
        "value": "hipaa"
      },
      {
        "path": "properties.storage.object_lock.enabled",
        "value": false
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Compliance-tagged bucket does not have S3 Object Lock enabled. Objects can be deleted or overwritten without WORM protection.",
    "action": "Enable S3 Object Lock on the bucket. Note: Object Lock can only be enabled at bucket creation. If the bucket already exists, create a new bucket with Object Lock enabled and migrate objects. Set a default retention period appropriate for your compliance framework."
  }
}
```

## Correct Configuration

A safe observation has `object_lock.enabled` set to `true`:

```json
{
  "properties": {
    "storage": {
      "kind": "bucket",
      "tags": {
        "compliance": "hipaa"
      },
      "object_lock": {
        "enabled": true
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.LOCK.002`](inv-s3-lock-002.md) -- Requires COMPLIANCE mode (not GOVERNANCE) for PHI buckets with Object Lock.
- [`INV.S3.LOCK.003`](inv-s3-lock-003.md) -- Enforces minimum retention period on Object Lock for PHI buckets.
- [`INV.S3.VERSION.001`](inv-s3-version-001.md) -- Versioning is a prerequisite for Object Lock.
- [`INV.S3.GOVERNANCE.001`](inv-s3-governance-001.md) -- The `compliance` tag that gates this invariant works alongside the `data-classification` tag.
