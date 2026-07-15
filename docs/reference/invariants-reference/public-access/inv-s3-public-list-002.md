# Anonymous S3 Listing Must Be Explicitly Intended

**ID:** `CTL.S3.PUBLIC.LIST.002` **Category:** Public Access **Severity:** Medium

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

Anonymous bucket listing increases exposure surface even when objects are public by design. This control fires when a bucket has `public_list` set to `true` but does not carry the tag `public_list_intended=true`. It enforces an explicit opt-in for directory enumeration on public-content buckets.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Some buckets legitimately serve public content -- open data sets, public documentation, software repositories. But even for these buckets, enabling listing is an additional exposure surface that should be a deliberate decision, not an accident. Listing reveals the full set of object keys, which may include staging files, internal tooling artifacts, or objects that were uploaded by mistake. Requiring an explicit intent tag ensures that listing is a reviewed configuration choice rather than an overlooked default.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.PUBLIC.LIST.002",
  "control_name": "Anonymous S3 Listing Must Be Explicitly Intended",
  "resource_id": "acme-public-datasets",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.kind",
        "value": "bucket"
      },
      {
        "path": "properties.storage.visibility.public_list",
        "value": true
      },
      {
        "path": "properties.storage.tags.public_list_intended",
        "value": null
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket has public listing enabled without an explicit intent tag. Anonymous listing increases exposure surface even for public content.",
    "action": "If listing is intentional, add the tag public_list_intended=true to the bucket. Otherwise, remove the policy or ACL granting s3:ListBucket to Principal \"*\" or AllUsers."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation either has listing disabled or has the explicit intent tag:

```
{
  "properties": {
    "storage": {
      "kind": "bucket",
      "visibility": {
        "public_list": true
      },
      "tags": {
        "public_list_intended": "true"
      }
    }
  }
}
```

Alternatively, a bucket with `public_list` set to `false` also passes this control.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.PUBLIC.LIST.001`](/docs/reference/invariants-reference/public-access/inv-s3-public-list-001.md) -- Unconditionally blocks public listing; this control is the softer variant that allows listing with an intent tag.
* [`CTL.S3.PUBLIC.006`](/docs/reference/invariants-reference/public-access/inv-s3-public-006.md) -- Detects latent public listing masked only by Public Access Block.
* [`CTL.S3.PUBLIC.001`](/docs/reference/invariants-reference/public-access/inv-s3-public-001.md) -- General public access check that also covers listing.
