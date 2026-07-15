# No Public List via Policy

**ID:** `CTL.S3.PUBLIC.008` **Category:** Public Access **Severity:** High

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket policies must not grant anonymous object listing. This control fires when `public_list_via_policy` is `true`, meaning the bucket policy contains a statement granting list actions (such as `s3:ListBucket`) to `Principal: "*"` or `Principal: {"AWS": "*"}`.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Public listing allows anyone to enumerate every object key in the bucket. Attackers use listing to discover sensitive file names, directory structures, backup files, and configuration artifacts before downloading them. Even when individual objects are not publicly readable, listing reveals naming patterns and internal organization. Combined with other access vectors, listing is the first step in a targeted data exfiltration attack.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.PUBLIC.008",
  "control_name": "No Public List via Policy",
  "resource_id": "acme-internal-reports",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.visibility.public_list_via_policy",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket policy grants public listing (Principal \"*\" with list action).",
    "action": "Remove or constrain policy statements allowing s3:ListBucket to anonymous principals."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `public_list_via_policy` set to `false`:

```
{
  "properties": {
    "storage": {
      "visibility": {
        "public_list_via_policy": false
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.PUBLIC.007`](/docs/reference/invariants-reference/public-access/inv-s3-public-007.md) -- The read counterpart: detects public read granted via bucket policy.
* [`CTL.S3.PUBLIC.LIST.001`](/docs/reference/invariants-reference/public-access/inv-s3-public-list-001.md) -- Broader check for any public listing regardless of mechanism.
* [`CTL.S3.PUBLIC.006`](/docs/reference/invariants-reference/public-access/inv-s3-public-006.md) -- Detects latent public listing masked by PAB.
* [`CTL.S3.CONTROLS.001`](/docs/reference/invariants-reference/public-access/inv-s3-controls-001.md) -- Ensures Public Access Block is enabled as defense-in-depth.
