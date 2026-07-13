---
title: "No Public S3 Buckets With Sensitive Data"
sidebar_label: "INV.S3.PUBLIC.002"
sidebar_position: 2
description: "S3 buckets tagged with sensitive data classifications must not allow any public access."
---

# No Public S3 Buckets With Sensitive Data

**ID:** `INV.S3.PUBLIC.002`
**Category:** Public Access
**Severity:** Critical

## What This Checks

S3 buckets tagged with sensitive data classifications -- PHI, PII, or confidential -- must not allow any public access. This invariant fires when a bucket has public read or public list access enabled and carries a sensitive `data_classification` tag.

## Why It Matters

Public exposure of buckets containing regulated data triggers mandatory breach notification under HIPAA, GDPR, and state privacy laws. The combination of public access and sensitive data classification represents the highest-risk configuration: the data is both reachable and known to be regulated. Incident response timelines start from the moment of exposure, not the moment of discovery, so every hour counts.

## What A Violation Looks Like

```
$ stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "invariant_id": "INV.S3.PUBLIC.002",
  "invariant_name": "No Public S3 Buckets With Sensitive Data",
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
        "path": "properties.storage.visibility.public_read",
        "value": true
      },
      {
        "path": "properties.storage.tags.data-classification",
        "value": "phi"
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket with sensitive data classification has public access enabled. Regulated data is exposed to the internet.",
    "action": "Immediately enable S3 Public Access Block (all four settings). Remove bucket policy statements granting access to Principal \"*\". Audit CloudTrail logs for unauthorized access during the exposure window."
  }
}
```

## Correct Configuration

A safe observation has no public access enabled and carries a sensitive data classification tag:

```json
{
  "properties": {
    "storage": {
      "visibility": {
        "public_read": false,
        "public_list": false
      },
      "tags": {
        "data-classification": "phi"
      }
    }
  }
}
```

## Related Invariants

- [`INV.S3.PUBLIC.001`](inv-s3-public-001.md) -- General check for public access on any bucket, regardless of data classification.
- [`INV.S3.PUBLIC.003`](inv-s3-public-003.md) -- Checks for public write access, which is critical for any bucket but especially sensitive ones.
- [`INV.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures Public Access Block is fully enabled, providing defense-in-depth for sensitive buckets.
