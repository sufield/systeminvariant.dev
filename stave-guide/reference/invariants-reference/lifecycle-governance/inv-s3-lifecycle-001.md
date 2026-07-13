---
title: "Retention-Tagged Buckets Must Have Lifecycle Rules"
sidebar_label: "CTL.S3.LIFECYCLE.001"
sidebar_position: 2
description: "S3 buckets tagged with data-retention must have at least one enabled lifecycle rule."
---

# Retention-Tagged Buckets Must Have Lifecycle Rules

**ID:** `CTL.S3.LIFECYCLE.001`
**Category:** Lifecycle and Governance
**Severity:** Medium

## What This Checks

S3 buckets that carry a `data-retention` tag must have at least one enabled lifecycle rule configured. This control fires when a bucket declares a retention period via tag but has no lifecycle rules to enforce it.

## Why It Matters

A `data-retention` tag documents an intent to manage data lifecycle, but without lifecycle rules the intent is never enforced. Data persists indefinitely, increasing storage costs and expanding the exposure surface. For regulated data, HIPAA requires defined retention policies for protected health information, audit logs, and billing records. A tag without a corresponding lifecycle rule creates a compliance gap -- the policy exists on paper but not in infrastructure.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.LIFECYCLE.001",
  "control_name": "Retention-Tagged Buckets Must Have Lifecycle Rules",
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
        "path": "properties.storage.tags.data-retention",
        "value": "7-years"
      },
      {
        "path": "properties.storage.lifecycle.rules_configured",
        "value": false
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket tagged with data-retention has no lifecycle rules configured. Data persists indefinitely, violating retention policy requirements.",
    "action": "Add S3 lifecycle rules to manage object expiration and transitions. Configure rules matching the retention period specified in the data-retention tag. Use lifecycle transitions to move data to cheaper storage classes before expiration."
  }
}
```

## Correct Configuration

A safe observation has a `data-retention` tag and lifecycle rules configured:

```json
{
  "properties": {
    "storage": {
      "tags": {
        "data-retention": "7-years"
      },
      "lifecycle": {
        "rules_configured": true
      }
    }
  }
}
```

## Related Controls

- [`CTL.S3.LIFECYCLE.002`](inv-s3-lifecycle-002.md) -- Enforces that PHI buckets do not expire data before the 2190-day HIPAA minimum.
- [`CTL.S3.GOVERNANCE.001`](inv-s3-governance-001.md) -- Requires the `data-classification` tag that often accompanies retention tagging.
- [`CTL.S3.VERSION.001`](inv-s3-version-001.md) -- Versioning complements lifecycle rules by preserving previous versions before expiration.
