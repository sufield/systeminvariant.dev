---
title: "Backup Buckets Must Have MFA Delete Enabled"
sidebar_label: "INV.S3.VERSION.002"
sidebar_position: 5
description: "S3 buckets tagged with backup=true must have MFA delete enabled to prevent unauthorized permanent deletion."
---

# Backup Buckets Must Have MFA Delete Enabled

**ID:** `INV.S3.VERSION.002`
**Category:** Lifecycle and Governance
**Severity:** Critical

## What This Checks

S3 buckets tagged with `backup=true` must have MFA delete enabled. This invariant fires when a backup-tagged bucket has `versioning.mfa_delete_enabled` set to `false`.

## Why It Matters

MFA delete requires multi-factor authentication to permanently delete object versions, adding a hardware-token barrier that stops both compromised credentials and insider threats from destroying backup data. Without MFA delete, any principal with `s3:DeleteObject` permission can permanently erase every version of every object in the bucket. In a ransomware scenario, an attacker who gains write access can delete all backup versions and then encrypt the primary data, leaving no recovery path. MFA delete is the last line of defense for backup integrity.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.VERSION.002",
  "invariant_name": "Backup Buckets Must Have MFA Delete Enabled",
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

## Correct Configuration

A safe observation has `mfa_delete_enabled` set to `true`:

```json
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

## Related Invariants

- [`INV.S3.VERSION.001`](inv-s3-version-001.md) -- Versioning must be enabled before MFA delete can be configured.
- [`INV.S3.LOCK.001`](inv-s3-lock-001.md) -- Object Lock provides an alternative WORM protection mechanism for compliance-tagged buckets.
- [`INV.S3.GOVERNANCE.001`](inv-s3-governance-001.md) -- The `data-classification` tag works alongside the `backup` tag to enable full invariant coverage.
