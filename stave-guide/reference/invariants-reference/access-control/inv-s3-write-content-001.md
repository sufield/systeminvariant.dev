---
title: "S3 Signed Upload Must Restrict Content Types"
sidebar_label: "CTL.S3.WRITE.CONTENT.001"
sidebar_position: 8
description: "Signed upload policies must restrict allowed content types to prevent stored XSS."
---

# S3 Signed Upload Must Restrict Content Types

**ID:** `CTL.S3.WRITE.CONTENT.001`
**Category:** Access Control
**Severity:** High

## What This Checks

Signed upload policies must restrict allowed content types. Upload policies where `content_type_restricted` is false while the operation is write are flagged as unsafe.

## Why It Matters

Direct client-to-S3 uploads via presigned URLs are common for user-facing upload features. When the upload policy does not restrict content types, an attacker can upload an SVG with embedded JavaScript (`<svg onload="...">`) or an HTML file, causing stored XSS when served from the bucket's domain. A bucket like `acme-user-avatars` configured to accept "any image" but without a content-type restriction actually accepts `image/svg+xml` and `text/html` -- both of which execute scripts in the browser. Adding an exact content-type condition (e.g., `eq $Content-Type image/jpeg`) to the presigned POST policy prevents this class of attack entirely.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "control_id": "CTL.S3.WRITE.CONTENT.001",
  "control_name": "S3 Signed Upload Must Restrict Content Types",
  "resource_id": "upload-api-acme-user-avatars",
  "resource_type": "s3_upload_policy",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "s3_upload.content_type_restricted",
        "value": false
      },
      {
        "path": "s3_upload.operation",
        "value": "write"
      },
      {
        "path": "type",
        "value": "s3_upload_policy"
      }
    ],
    "first_unsafe_at": "2026-01-07T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 192,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 192 hours (threshold: 0 hours). Unsafe since 2026-01-07T00:00:00Z."
  },
  "mitigation": {
    "description": "Signed upload policy does not restrict content types. An attacker can upload arbitrary content types including image/svg+xml or text/html, enabling stored XSS.",
    "action": "Add an exact content-type condition to the signed upload policy (e.g., eq $Content-Type image/jpeg). Avoid starts-with with empty prefix, which allows any content type."
  }
}
```

## Correct Configuration

A safe upload policy restricts allowed content types:

```json
{
  "s3_upload": {
    "operation": "write",
    "content_type_restricted": true,
    "allowed_content_types": ["image/jpeg", "image/png"]
  }
}
```

**To remediate:** Add an exact content-type condition to the presigned POST policy. Use `eq $Content-Type image/jpeg` (or the specific MIME type) instead of `starts-with $Content-Type` with an empty prefix. If multiple content types are needed, generate separate presigned URLs for each allowed type. Consider adding server-side content-type validation as defense in depth.

## Related Controls

- [`CTL.S3.WRITE.SCOPE.001`](inv-s3-write-scope-001.md) -- S3 Signed Upload Must Bind To Exact Object Key (flags prefix-scoped upload keys, a complementary upload hardening check)
- [`CTL.S3.TENANT.ISOLATION.001`](inv-s3-tenant-isolation-001.md) -- Shared-Bucket Tenant Isolation Must Enforce Prefix (flags missing prefix enforcement on shared buckets)
