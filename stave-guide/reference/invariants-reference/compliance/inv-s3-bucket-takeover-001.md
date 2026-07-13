---
title: "Referenced S3 Buckets Must Exist And Be Owned"
sidebar_label: "CTL.S3.BUCKET.TAKEOVER.001"
sidebar_position: 1
description: "Any externally referenced S3 bucket must exist and be owned by your account."
---

# Referenced S3 Buckets Must Exist And Be Owned

**ID:** `CTL.S3.BUCKET.TAKEOVER.001`
**Category:** Compliance
**Severity:** Critical

## What This Checks

Any S3 bucket referenced by a DNS CNAME, CDN origin, or application configuration must exist and be owned by your AWS account. This control fires when `s3_ref.bucket_exists` is `false` or `s3_ref.bucket_owned` is `false`.

## Why It Matters

Dangling S3 references are a well-known vector for bucket takeover attacks. When a DNS record, CloudFront origin, or application config points to a bucket name that does not exist, an attacker can create that bucket in their own account and serve arbitrary content under your domain. This has led to phishing pages, malware distribution, and cookie theft on major platforms including HackerOne, Khan Academy, and U.S. Department of Defense properties.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "dsl_version": "out.v0.1",
  "summary": {
    "total_findings": 1,
    "unsafe_count": 1,
    "safe_count": 0
  },
  "findings": [
    {
      "control_id": "CTL.S3.BUCKET.TAKEOVER.001",
      "resource_id": "s3-ref://cdn.acme.com/assets.acme.com",
      "status": "unsafe",
      "severity": "critical",
      "message": "Referenced S3 Buckets Must Exist And Be Owned: An external reference points to an S3 bucket that does not exist or is not owned by your account.",
      "evidence": {
        "matched_properties": [
          {
            "path": "properties.s3_ref.bucket_exists",
            "value": false
          }
        ]
      },
      "mitigation": {
        "description": "An external reference (DNS CNAME, CDN origin, or application config) points to an S3 bucket that does not exist or is not owned by your account. An attacker can claim this bucket name and serve malicious content.",
        "action": "Create the S3 bucket in your AWS account, or remove the DNS record, CDN origin, or application reference pointing to the unclaimed bucket."
      }
    }
  ]
}
```

## Correct Configuration

A safe observation has both `bucket_exists` and `bucket_owned` set to `true`:

```json
{
  "s3_ref": {
    "bucket_exists": true,
    "bucket_owned": true
  }
}
```

## Related Controls

- [`CTL.S3.DANGLING.ORIGIN.001`](inv-s3-dangling-origin-001.md) -- CDN-specific variant that checks CloudFront distributions for dangling S3 origins.
- [`CTL.S3.CONTROLS.001`](../public-access/inv-s3-controls-001.md) -- Ensures Public Access Block is fully enabled as defense-in-depth.
