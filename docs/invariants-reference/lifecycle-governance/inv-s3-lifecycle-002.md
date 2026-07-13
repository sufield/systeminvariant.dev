---
title: "PHI Buckets Must Not Expire Data Before Minimum Retention"
sidebar_label: "INV.S3.LIFECYCLE.002"
sidebar_position: 3
description: "PHI buckets must not have lifecycle expiration before 2190 days (6 years HIPAA minimum)."
---

# PHI Buckets Must Not Expire Data Before Minimum Retention

**ID:** `INV.S3.LIFECYCLE.002`
**Category:** Lifecycle and Governance
**Severity:** Critical

## What This Checks

S3 buckets tagged with `data-classification=phi` must not have lifecycle expiration rules that delete objects before 2190 days (6 years). This invariant fires when a PHI bucket has an expiration rule with `min_expiration_days` below that threshold.

## Why It Matters

HIPAA requires medical records, audit logs, and billing records to be retained for a minimum of 6 years (2190 days). A lifecycle expiration rule set to a shorter period will permanently delete protected health information before the regulatory retention period has elapsed. Unlike accidental deletion of a single object, a misconfigured lifecycle rule silently and automatically destroys data across the entire bucket on a schedule. The violation may not be discovered until an audit or legal discovery request reveals the data no longer exists.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.LIFECYCLE.002",
  "invariant_name": "PHI Buckets Must Not Expire Data Before Minimum Retention",
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
        "path": "properties.storage.tags.data-classification",
        "value": "phi"
      },
      {
        "path": "properties.storage.lifecycle.has_expiration",
        "value": true
      },
      {
        "path": "properties.storage.lifecycle.min_expiration_days",
        "value": 365
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "PHI bucket has a lifecycle expiration rule that deletes data before the HIPAA minimum retention period of 6 years (2190 days).",
    "action": "Increase the lifecycle expiration period to at least 2190 days. If the current rule is for storage class transition, ensure the expiration rule is separate and meets the minimum retention period."
  }
}
```

## Correct Configuration

A safe observation has `min_expiration_days` at or above 2190:

```json
{
  "properties": {
    "storage": {
      "tags": {
        "data-classification": "phi"
      },
      "lifecycle": {
        "has_expiration": true,
        "min_expiration_days": 2190
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.LIFECYCLE.001`](inv-s3-lifecycle-001.md) -- Ensures retention-tagged buckets have lifecycle rules at all; this invariant checks the rules are long enough.
- [`INV.S3.LOCK.003`](inv-s3-lock-003.md) -- Enforces the same 2190-day minimum on Object Lock retention for PHI buckets.
- [`INV.S3.LOCK.002`](inv-s3-lock-002.md) -- Requires COMPLIANCE mode Object Lock for PHI, complementing lifecycle retention with WORM protection.
- [`INV.S3.GOVERNANCE.001`](inv-s3-governance-001.md) -- Requires the `data-classification` tag that gates this invariant.
