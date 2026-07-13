---
title: "No Public Website Hosting with Public Read"
sidebar_label: "CTL.S3.WEBSITE.PUBLIC.001"
sidebar_position: 10
description: "S3 buckets with static website hosting enabled must not also have public read access."
---

# No Public Website Hosting with Public Read

**ID:** `CTL.S3.WEBSITE.PUBLIC.001`
**Category:** Public Access
**Severity:** High

## What This Checks

S3 buckets with static website hosting enabled must not also have public read access. This control fires when `website.enabled` is `true` and `public_read` is `true`, meaning the bucket serves content directly to the internet via the S3 website endpoint without any CDN or access control in front of it.

## Why It Matters

S3 static website hosting combined with public read access serves every object in the bucket directly to the internet via a predictable URL pattern (`http://<bucket>.s3-website-<region>.amazonaws.com`). This bypasses any CDN-layer protections like WAF rules, geographic restrictions, or DDoS mitigation. It also means the bucket's contents are indexed by search engines and web scanners. The recommended pattern is to front S3 website content with CloudFront using an Origin Access Control (OAC), which allows the bucket itself to remain private while still serving content publicly through the CDN.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.WEBSITE.PUBLIC.001",
  "control_name": "No Public Website Hosting with Public Read",
  "resource_id": "acme-marketing-website",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.website.enabled",
        "value": true
      },
      {
        "path": "properties.storage.visibility.public_read",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket has static website hosting enabled with public read access. Content is served directly to the internet via the S3 website endpoint.",
    "action": "If public hosting is not intended, disable static website hosting and remove public read access. If hosting is intended, move content behind CloudFront with an Origin Access Control (OAC) and remove direct public access from the bucket."
  }
}
```

## Correct Configuration

A safe observation has website hosting enabled but public read disabled (content served through CloudFront OAC instead):

```json
{
  "properties": {
    "storage": {
      "website": {
        "enabled": true
      },
      "visibility": {
        "public_read": false
      }
    }
  }
}
```

## Related Controls

- [`CTL.S3.PUBLIC.001`](inv-s3-public-001.md) -- General check for public read access; this control adds the website-hosting dimension.
- [`CTL.S3.PUBLIC.005`](inv-s3-public-005.md) -- Detects latent public read exposure, which is especially dangerous for website-hosting buckets.
- [`CTL.S3.CONTROLS.001`](inv-s3-controls-001.md) -- Ensures Public Access Block is enabled as defense-in-depth for website-hosting buckets.
