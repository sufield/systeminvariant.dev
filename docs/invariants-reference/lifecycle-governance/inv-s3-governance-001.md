---
title: "Data Classification Tag Required"
sidebar_label: "INV.S3.GOVERNANCE.001"
sidebar_position: 1
description: "S3 buckets must have a data-classification tag to enable sensitivity-gated safety checks."
---

# Data Classification Tag Required

**ID:** `INV.S3.GOVERNANCE.001`
**Category:** Lifecycle and Governance
**Severity:** High

## What This Checks

S3 buckets must have a `data-classification` tag. Without this tag, all sensitivity-gated invariants for PHI, PII, confidential data, backup integrity, and compliance retention silently pass because the conditions that trigger them can never match.

## Why It Matters

The data-classification tag is the foundation of Stave's sensitivity-aware invariant evaluation. When this tag is missing, a bucket containing protected health information or personally identifiable information bypasses every invariant that checks for encryption requirements, retention minimums, Object Lock modes, and public-access restrictions scoped to sensitive data. This creates a false sense of safety -- the bucket appears compliant because no violations fire, when in reality the bucket was never evaluated against the rules that matter most.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.GOVERNANCE.001",
  "invariant_name": "Data Classification Tag Required",
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
        "value": null,
        "condition": "missing"
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket is missing the data-classification tag. Without this tag, sensitivity-gated invariants cannot evaluate and the bucket silently passes all data-protection checks.",
    "action": "Add a data-classification tag to the bucket with an appropriate value (e.g., phi, pii, confidential, internal, public, non-sensitive). Update your tagging policy to require this tag on all S3 buckets."
  }
}
```

## Correct Configuration

A safe observation has a `data-classification` tag set to an appropriate value:

```json
{
  "properties": {
    "storage": {
      "kind": "bucket",
      "tags": {
        "data-classification": "internal"
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.LIFECYCLE.001`](inv-s3-lifecycle-001.md) -- Requires lifecycle rules on retention-tagged buckets; depends on tagging being in place.
- [`INV.S3.LIFECYCLE.002`](inv-s3-lifecycle-002.md) -- Enforces minimum retention for PHI buckets; only fires when `data-classification=phi`.
- [`INV.S3.LOCK.002`](inv-s3-lock-002.md) -- Requires COMPLIANCE mode Object Lock for PHI buckets; gated on the `data-classification` tag.
- [`INV.S3.LOCK.003`](inv-s3-lock-003.md) -- Requires minimum Object Lock retention for PHI buckets; gated on the `data-classification` tag.
