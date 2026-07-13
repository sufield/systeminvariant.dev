---
title: "CDN S3 Origins Must Not Be Dangling"
sidebar_label: "CTL.S3.DANGLING.ORIGIN.001"
sidebar_position: 2
description: "CloudFront distributions must not reference S3 origins that do not exist."
---

# CDN S3 Origins Must Not Be Dangling

**ID:** `CTL.S3.DANGLING.ORIGIN.001`
**Category:** Compliance
**Severity:** Critical

## What This Checks

CloudFront distributions must not reference S3 origin buckets that do not exist. This control fires when `cdn.kind` is `"distribution"` and `origins_has_dangling_s3` is `true`.

## Why It Matters

A dangling S3 origin in CloudFront is a direct path to content injection at scale. When a distribution references a bucket that does not exist, any attacker can create that bucket and serve malicious JavaScript, HTML, or binaries through your CDN. Because the content is served from your domain with your TLS certificate, browsers and users trust it implicitly. The RubyGems.org incident demonstrated how dangling CDN origins can compromise an entire software supply chain.

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
      "control_id": "CTL.S3.DANGLING.ORIGIN.001",
      "resource_id": "arn:aws:cloudfront::123456789012:distribution/E1A2B3C4D5E6F7",
      "status": "unsafe",
      "severity": "critical",
      "message": "CDN S3 Origins Must Not Be Dangling: CloudFront distribution references an S3 origin bucket that does not exist.",
      "evidence": {
        "matched_properties": [
          {
            "path": "properties.cdn.kind",
            "value": "distribution"
          },
          {
            "path": "properties.cdn.origins_has_dangling_s3",
            "value": true
          }
        ]
      },
      "mitigation": {
        "description": "CloudFront distribution references an S3 origin bucket that does not exist. An attacker can create this bucket and serve malicious content through your CDN.",
        "action": "Create the S3 bucket in your AWS account to claim the name, or remove the dangling origin from the CloudFront distribution. Update the distribution to use an Origin Access Control (OAC)."
      }
    }
  ]
}
```

## Correct Configuration

A safe observation has `origins_has_dangling_s3` set to `false`:

```json
{
  "cdn": {
    "kind": "distribution",
    "origins_has_dangling_s3": false
  }
}
```

Use Origin Access Control (OAC) instead of Origin Access Identity (OAI) to restrict CloudFront access to only buckets you own.

## Related Controls

- [`CTL.S3.BUCKET.TAKEOVER.001`](inv-s3-bucket-takeover-001.md) -- General-purpose check that any referenced S3 bucket exists and is owned.
- [`CTL.S3.CONTROLS.001`](../public-access/inv-s3-controls-001.md) -- Ensures Public Access Block is fully enabled on origin buckets.
