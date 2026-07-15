# PHI Buckets Must Use COMPLIANCE Mode Object Lock

**ID:** `CTL.S3.LOCK.002` **Category:** Lifecycle and Governance **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets tagged with `data-classification=phi` that have Object Lock enabled must use COMPLIANCE mode. This control fires when a PHI bucket's Object Lock mode is set to anything other than `COMPLIANCE` (typically `GOVERNANCE`).

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

S3 Object Lock offers two modes: GOVERNANCE and COMPLIANCE. GOVERNANCE mode allows users with the `s3:BypassGovernanceRetention` permission to override retention and delete protected objects. COMPLIANCE mode prevents any user -- including the root account -- from deleting or modifying protected objects until the retention period expires. For HIPAA-regulated protected health information, GOVERNANCE mode is insufficient because it leaves a path for privileged users to destroy records that must be preserved. COMPLIANCE mode provides the tamper-proof immutability that HIPAA requires for medical records, audit trails, and billing data.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.LOCK.002",
  "control_name": "PHI Buckets Must Use COMPLIANCE Mode Object Lock",
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
        "path": "properties.storage.object_lock.mode",
        "value": "GOVERNANCE"
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "PHI bucket with Object Lock is using GOVERNANCE mode instead of COMPLIANCE mode. Users with special permissions can override retention.",
    "action": "Change the Object Lock default retention mode from GOVERNANCE to COMPLIANCE. In COMPLIANCE mode, no user (including root) can delete or modify protected objects during the retention period."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has Object Lock in `COMPLIANCE` mode:

```
{
  "properties": {
    "storage": {
      "tags": {
        "data-classification": "phi"
      },
      "object_lock": {
        "enabled": true,
        "mode": "COMPLIANCE"
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.LOCK.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lock-001.md) -- Requires Object Lock to be enabled on compliance-tagged buckets; this control checks the mode is correct.
* [`CTL.S3.LOCK.003`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lock-003.md) -- Enforces that the COMPLIANCE mode retention period meets the 2190-day HIPAA minimum.
* [`CTL.S3.LIFECYCLE.002`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lifecycle-002.md) -- Enforces the same 2190-day minimum on lifecycle expiration rules for PHI buckets.
* [`CTL.S3.GOVERNANCE.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-governance-001.md) -- Requires the `data-classification` tag that gates this control.
