# PHI Object Lock Retention Must Meet Minimum Period

**ID:** `CTL.S3.LOCK.003` **Category:** Lifecycle and Governance **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets tagged with `data-classification=phi` that have Object Lock enabled must have a default retention period of at least 2190 days (6 years). This control fires when a PHI bucket's `object_lock.retention_days` is below that threshold.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

HIPAA requires medical records to be retained for a minimum of 6 years (2190 days). Object Lock retention defines how long WORM protection remains in effect -- once the retention period expires, objects can be deleted or overwritten. A retention period shorter than 2190 days means WORM protection will lapse before the HIPAA retention obligation ends, leaving PHI data vulnerable to deletion during the gap. Unlike lifecycle expiration (which actively deletes data), an expired Object Lock retention silently removes the immutability guarantee, and the exposure may go unnoticed until a compliance audit or legal hold reveals the data was modified or destroyed.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.LOCK.003",
  "control_name": "PHI Object Lock Retention Must Meet Minimum Period",
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
        "path": "properties.storage.object_lock.enabled",
        "value": true
      },
      {
        "path": "properties.storage.object_lock.retention_days",
        "value": 365
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "PHI bucket Object Lock retention period is shorter than the HIPAA minimum of 6 years (2190 days). WORM protection may expire before the regulatory retention period.",
    "action": "Increase the Object Lock default retention period to at least 2190 days. Use aws s3api put-object-lock-configuration to update the default retention settings."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `retention_days` at or above 2190:

```
{
  "properties": {
    "storage": {
      "tags": {
        "data-classification": "phi"
      },
      "object_lock": {
        "enabled": true,
        "mode": "COMPLIANCE",
        "retention_days": 2190
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.LOCK.002`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lock-002.md) -- Requires COMPLIANCE mode on PHI Object Lock; this control checks the retention duration is long enough.
* [`CTL.S3.LOCK.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lock-001.md) -- Requires Object Lock to be enabled on compliance-tagged buckets.
* [`CTL.S3.LIFECYCLE.002`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lifecycle-002.md) -- Enforces the same 2190-day HIPAA minimum on lifecycle expiration rules; both controls must pass for full coverage.
* [`CTL.S3.GOVERNANCE.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-governance-001.md) -- Requires the `data-classification` tag that gates this control.
