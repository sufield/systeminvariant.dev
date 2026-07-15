# Backup Buckets Must Have MFA Delete Enabled

**ID:** `CTL.S3.VERSION.002` **Category:** Lifecycle and Governance **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets tagged with `backup=true` must have MFA delete enabled. This control fires when a backup-tagged bucket has `versioning.mfa_delete_enabled` set to `false`.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

MFA delete requires multi-factor authentication to permanently delete object versions, adding a hardware-token barrier that stops both compromised credentials and insider threats from destroying backup data. Without MFA delete, any principal with `s3:DeleteObject` permission can permanently erase every version of every object in the bucket. In a ransomware scenario, an attacker who gains write access can delete all backup versions and then encrypt the primary data, leaving no recovery path. MFA delete is the last line of defense for backup integrity.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.VERSION.002",
  "control_name": "Backup Buckets Must Have MFA Delete Enabled",
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
        "path": "properties.storage.tags.backup",
        "value": "true"
      },
      {
        "path": "properties.storage.versioning.mfa_delete_enabled",
        "value": false
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Backup bucket does not have MFA delete enabled. Any principal with s3:DeleteObject permission can permanently destroy backup versions.",
    "action": "Enable MFA delete on the bucket using aws s3api put-bucket-versioning with the MFA flag. This requires the root account credentials and an MFA device. Only the root account can enable or disable MFA delete."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `mfa_delete_enabled` set to `true`:

```
{
  "properties": {
    "storage": {
      "tags": {
        "backup": "true"
      },
      "versioning": {
        "enabled": true,
        "mfa_delete_enabled": true
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.VERSION.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-version-001.md) -- Versioning must be enabled before MFA delete can be configured.
* [`CTL.S3.LOCK.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-lock-001.md) -- Object Lock provides an alternative WORM protection mechanism for compliance-tagged buckets.
* [`CTL.S3.GOVERNANCE.001`](/docs/reference/invariants-reference/lifecycle-governance/inv-s3-governance-001.md) -- The `data-classification` tag works alongside the `backup` tag to enable full control coverage.
