# Versioning Required

**ID:** `CTL.S3.VERSION.001` **Category:** Lifecycle and Governance **Severity:** Medium

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets must have versioning enabled. This control fires when any bucket has `versioning.enabled` set to `false`.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Without versioning, an overwrite or delete operation on an S3 object is permanent and irreversible. A single mistyped `aws s3 rm --recursive` command, a compromised IAM credential, or a buggy deployment script can destroy production data with no recovery path. Versioning preserves every previous version of every object, enabling point-in-time recovery. It is also a prerequisite for MFA delete, cross-region replication, and Object Lock -- all of which depend on the version history that versioning provides.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.VERSION.001",
  "control_name": "Versioning Required",
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
        "path": "properties.storage.versioning.enabled",
        "value": false
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket does not have versioning enabled. Objects deleted or overwritten cannot be recovered.",
    "action": "Enable versioning on the bucket using aws s3api put-bucket-versioning. Once enabled, configure lifecycle rules to manage noncurrent versions and control storage costs."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `versioning.enabled` set to `true`:

```
{
  "properties": {
    "storage": {
      "kind": "bucket",
      "versioning": {
        "enabled": true
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.VERSION.002`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-version-002.md) -- Requires MFA delete on backup-tagged buckets; MFA delete depends on versioning being enabled.
* [`CTL.S3.LOCK.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lock-001.md) -- Object Lock requires versioning as a prerequisite.
* [`CTL.S3.LIFECYCLE.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lifecycle-001.md) -- Lifecycle rules for noncurrent version expiration complement versioning to control storage costs.
