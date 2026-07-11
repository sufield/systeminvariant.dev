# No Public Write via ACL

**ID:** `CTL.S3.ACL.WRITE.001` **Category:** Public Access **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket ACLs must not grant write access to AllUsers or AuthenticatedUsers. This control fires when `public_write_via_acl` is `true`, meaning the bucket's legacy ACL configuration allows anyone to upload, overwrite, or delete objects.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

ACL-based write access is one of the most dangerous S3 misconfigurations. An attacker with write access can inject malicious executables into software distribution buckets, overwrite Terraform state files to hijack infrastructure, or plant web shells in buckets backing static websites. In 2018, researchers demonstrated mass exploitation of publicly writable buckets, finding thousands that could be used to distribute malware through legitimate organizations. ACL-based grants are especially insidious because they are less visible in the AWS console than bucket policies.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.ACL.WRITE.001",
  "control_name": "No Public Write via ACL",
  "resource_id": "acme-release-artifacts",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "first_unsafe_at": "2026-01-14T23:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 1,
    "threshold_hours": 0,
    "matched_properties": [
      {
        "path": "properties.storage.visibility.public_write_via_acl",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket ACL grants write access to AllUsers or AuthenticatedUsers. Any anonymous or authenticated AWS user can upload or overwrite objects.",
    "action": "Replace the bucket ACL with \"BucketOwnerFullControl\" or remove the public write grant. Enable S3 Public Access Block with BlockPublicAcls and IgnorePublicAcls set to true."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `public_write_via_acl` set to `false`:

```
{
  "properties": {
    "storage": {
      "visibility": {
        "public_write_via_acl": false
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.PUBLIC.003`](/docs/reference/invariants-reference/public-access/inv-s3-public-003.md) -- General check for public write access via any mechanism (policy or ACL).
* [`CTL.S3.PUBLIC.004`](/docs/reference/invariants-reference/public-access/inv-s3-public-004.md) -- The read counterpart: checks for ACL-based public read access.
* [`CTL.S3.CONTROLS.001`](/docs/reference/invariants-reference/public-access/inv-s3-controls-001.md) -- Ensures BlockPublicAcls and IgnorePublicAcls are enabled, which override ACL-based public grants.
