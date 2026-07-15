# No Public ACL Modification

**ID:** `CTL.S3.ACL.ESCALATION.001` **Category:** ACL Privilege Escalation **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket ACLs must not be writable by `AllUsers` or `AuthenticatedUsers`. Any bucket where `public_acl_writable` or `authenticated_users_acl_writable` is true is flagged as unsafe.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

The `WRITE_ACP` ACL permission and the `s3:PutBucketAcl`/`s3:PutObjectAcl` policy actions allow modifying the bucket's ACL. An attacker who can call `put-bucket-acl` can grant themselves `FULL_CONTROL`, then read, write, or delete every object in the bucket. This is privilege escalation -- the data isn't directly exposed by the misconfiguration, but the attacker can change who has access. Bug bounty programs consistently rate this as critical because it converts a permission-only vulnerability into full data access.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.ACL.ESCALATION.001",
  "control_name": "No Public ACL Modification",
  "resource_id": "acme-internal-reports",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.visibility.public_acl_writable",
        "value": true
      }
    ],
    "first_unsafe_at": "2026-01-03T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 288,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 288 hours (threshold: 0 hours). Unsafe since 2026-01-03T00:00:00Z."
  },
  "mitigation": {
    "description": "Bucket grants ACL modification (WRITE_ACP) to public or authenticated users. An attacker can call PutBucketAcl to grant themselves FULL_CONTROL, then read or modify all objects.",
    "action": "Remove WRITE_ACP grants from the bucket ACL and remove policy statements granting s3:PutBucketAcl or s3:PutObjectAcl to public principals. Enable S3 Public Access Block with BlockPublicAcls set to true."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe bucket does not grant ACL modification to public or authenticated users:

```
{
  "storage": {
    "visibility": {
      "public_acl_writable": false,
      "authenticated_users_acl_writable": false
    }
  }
}
```

**To remediate:** Remove `WRITE_ACP` grants from the bucket ACL. Remove policy statements granting `s3:PutBucketAcl` or `s3:PutObjectAcl` to `*` or `AuthenticatedUsers`. Enable S3 Public Access Block with `BlockPublicAcls` set to `true`.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ACL.FULLCONTROL.001`](/docs/reference/invariants-reference/acl-escalation/inv-s3-acl-fullcontrol-001.md) -- No FULL\_CONTROL ACL Grants to Public (flags the worst-case ACL grant that includes ACL modification)
* [`CTL.S3.ACL.WRITE.001`](/docs/reference/invariants-reference/public-access/inv-s3-acl-write-001.md) -- No Public Write via ACL (flags data write via ACL, not ACL modification)
* [`CTL.S3.CONTROLS.001`](/docs/reference/invariants-reference/public-access/inv-s3-controls-001.md) -- Public Access Block Must Be Enabled (PAB neutralizes ACL-based grants)
