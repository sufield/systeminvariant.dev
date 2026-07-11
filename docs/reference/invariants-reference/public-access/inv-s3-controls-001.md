# Public Access Block Must Be Enabled

**ID:** `CTL.S3.CONTROLS.001` **Category:** Public Access **Severity:** High

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets must have the S3 Public Access Block fully enabled with all four settings active. This control fires when the bucket `kind` is `bucket` and `public_access_fully_blocked` is `false`, meaning at least one of the four PAB settings is disabled.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

The S3 Public Access Block is the primary safety net against accidental public exposure from policy or ACL changes. Without all four settings enabled -- BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets -- a single misconfigured bucket policy or ACL grant can immediately expose data to the internet. This control detects the enabling condition for public access rather than the exposure itself. It catches buckets that are one policy change away from being public, even if they are not currently exposed.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.CONTROLS.001",
  "control_name": "Public Access Block Must Be Enabled",
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
        "path": "properties.storage.kind",
        "value": "bucket"
      },
      {
        "path": "properties.storage.controls.public_access_fully_blocked",
        "value": false
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Public Access Block is not fully enabled. The bucket has no safety net against accidental public exposure from policy or ACL changes.",
    "action": "Enable all four Public Access Block settings on the bucket: BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy, RestrictPublicBuckets."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `public_access_fully_blocked` set to `true`:

```
{
  "properties": {
    "storage": {
      "kind": "bucket",
      "controls": {
        "public_access_fully_blocked": true
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.PUBLIC.005`](/docs/reference/invariants-reference/public-access/inv-s3-public-005.md) -- Detects latent public read exposure masked by PAB; this control ensures PAB is the first line of defense.
* [`CTL.S3.PUBLIC.006`](/docs/reference/invariants-reference/public-access/inv-s3-public-006.md) -- Detects latent public listing masked by PAB.
* [`CTL.S3.PUBLIC.001`](/docs/reference/invariants-reference/public-access/inv-s3-public-001.md) -- Detects active public read access; without PAB enabled, policy mistakes become immediate exposures.
* [`CTL.S3.ACL.WRITE.001`](/docs/reference/invariants-reference/public-access/inv-s3-acl-write-001.md) -- ACL-based write access that PAB's BlockPublicAcls and IgnorePublicAcls settings would block.
