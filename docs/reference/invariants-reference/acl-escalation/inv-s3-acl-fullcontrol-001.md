# No FULL\_CONTROL ACL Grants to Public

**ID:** `CTL.S3.ACL.FULLCONTROL.001` **Category:** ACL Privilege Escalation **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket ACLs must not grant `FULL_CONTROL` to `AllUsers` or `AuthenticatedUsers`. Any bucket where `acl.has_full_control_public` or `acl.has_full_control_authenticated` is true is flagged as unsafe.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

`FULL_CONTROL` is the worst-case ACL misconfiguration. The grantee can read, write, and delete objects and modify the ACL itself. A bucket with `FULL_CONTROL` granted to `AllUsers` would trigger several individual visibility flags (`public_read`, `public_write`, `public_acl_writable`), but the observation model tracks the grant type directly so Stave can distinguish "read+write via separate grants" from "FULL\_CONTROL" -- the latter is worse because it inherently includes ACL modification capability that cannot be revoked without changing the ACL. Bug bounty reports consistently show this as the most damaging S3 ACL misconfiguration.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.ACL.FULLCONTROL.001",
  "control_name": "No FULL_CONTROL ACL Grants to Public",
  "resource_id": "acme-shared-workspace",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.acl.has_full_control_public",
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
    "description": "Bucket ACL grants FULL_CONTROL to AllUsers or AuthenticatedUsers. This grants complete control including object read/write/delete and ACL modification.",
    "action": "Replace the bucket ACL with \"BucketOwnerFullControl\" or remove the FULL_CONTROL grant to public groups. Enable S3 Public Access Block with BlockPublicAcls and IgnorePublicAcls set to true."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe bucket does not grant FULL\_CONTROL to public or authenticated users:

```
{
  "storage": {
    "acl": {
      "has_full_control_public": false,
      "has_full_control_authenticated": false
    }
  }
}
```

**To remediate:** Replace the bucket ACL with `BucketOwnerFullControl` or remove the `FULL_CONTROL` grant to `AllUsers`/`AuthenticatedUsers`. Enable S3 Public Access Block with `BlockPublicAcls` and `IgnorePublicAcls` set to `true`.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ACL.ESCALATION.001`](/docs/reference/invariants-reference/acl-escalation/inv-s3-acl-escalation-001.md) -- No Public ACL Modification (FULL\_CONTROL implies WRITE\_ACP)
* [`CTL.S3.ACL.RECON.001`](/docs/reference/invariants-reference/acl-escalation/inv-s3-acl-recon-001.md) -- No Public ACL Readability (FULL\_CONTROL implies READ\_ACP)
* [`CTL.S3.PUBLIC.004`](/docs/reference/invariants-reference/public-access/inv-s3-public-004.md) -- No Public Read via ACL (FULL\_CONTROL implies READ)
* [`CTL.S3.ACL.WRITE.001`](/docs/reference/invariants-reference/public-access/inv-s3-acl-write-001.md) -- No Public Write via ACL (FULL\_CONTROL implies WRITE)
