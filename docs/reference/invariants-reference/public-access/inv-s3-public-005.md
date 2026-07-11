# No Latent Public Read Exposure

**ID:** `CTL.S3.PUBLIC.005` **Category:** Public Access **Severity:** High

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets must not have latent public read exposure where a public-granting mechanism (bucket policy or ACL) exists but is currently masked only by the S3 Public Access Block. This control fires when `latent_public_read` is `true`, meaning removing PAB would immediately expose the bucket to the internet.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

A bucket with latent public read exposure is one configuration change away from a data breach. If an administrator disables the Public Access Block -- during debugging, migration, or by accident -- the underlying policy or ACL immediately exposes the bucket. Defense-in-depth requires that the underlying access grants themselves be removed rather than relying on a single control layer. Latent exposure is invisible to most compliance scanners that only check effective access.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.PUBLIC.005",
  "control_name": "No Latent Public Read Exposure",
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
        "path": "properties.storage.visibility.latent_public_read",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket has a policy or ACL granting public read, currently masked only by Public Access Block. Removing PAB would immediately expose the bucket.",
    "action": "Remove the underlying public-granting policy statement or ACL entry so the bucket does not depend solely on PAB for protection. Then verify PAB remains enabled as defense-in-depth."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `latent_public_read` set to `false`, meaning no underlying policy or ACL grants public read access:

```
{
  "properties": {
    "storage": {
      "visibility": {
        "latent_public_read": false
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.PUBLIC.006`](/docs/reference/invariants-reference/public-access/inv-s3-public-006.md) -- The listing counterpart: detects latent public bucket listing masked only by PAB.
* [`CTL.S3.PUBLIC.001`](/docs/reference/invariants-reference/public-access/inv-s3-public-001.md) -- Detects active (not latent) public read access where PAB is not blocking it.
* [`CTL.S3.CONTROLS.001`](/docs/reference/invariants-reference/public-access/inv-s3-controls-001.md) -- Ensures PAB is enabled; this control catches the case where PAB is enabled but is the only thing standing between the bucket and the internet.
