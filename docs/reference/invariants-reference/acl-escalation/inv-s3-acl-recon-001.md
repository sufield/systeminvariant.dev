# No Public ACL Readability

**ID:** `CTL.S3.ACL.RECON.001` **Category:** ACL Privilege Escalation **Severity:** Medium

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket ACLs should not be readable by unauthenticated users. Any bucket where `public_acl_readable` is true is flagged as unsafe.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

The `READ_ACP` ACL permission and the `s3:GetBucketAcl`/`s3:GetObjectAcl` policy actions allow anyone to read the bucket's ACL. An attacker can call `get-bucket-acl` without authentication to discover which principals have access and find escalation paths -- for example, identifying that `AuthenticatedUsers` has `WRITE_ACP` and then using that to escalate to `FULL_CONTROL`. While this is information disclosure rather than direct data access, it is a recon enabler that reduces the effort needed for targeted attacks.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.ACL.RECON.001",
  "control_name": "No Public ACL Readability",
  "resource_id": "acme-staging-assets",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.visibility.public_acl_readable",
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
    "description": "Bucket grants ACL read access (READ_ACP) to public users. An attacker can call GetBucketAcl to discover which principals have access and identify escalation paths.",
    "action": "Remove READ_ACP grants from the bucket ACL and remove policy statements granting s3:GetBucketAcl or s3:GetObjectAcl to public principals. Enable S3 Public Access Block with BlockPublicAcls set to true."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe bucket does not grant ACL read access to unauthenticated users:

```
{
  "storage": {
    "visibility": {
      "public_acl_readable": false
    }
  }
}
```

**To remediate:** Remove `READ_ACP` grants from the bucket ACL. Remove policy statements granting `s3:GetBucketAcl` or `s3:GetObjectAcl` to `*`. Enable S3 Public Access Block with `BlockPublicAcls` set to `true`.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ACL.ESCALATION.001`](/docs/reference/invariants-reference/acl-escalation/inv-s3-acl-escalation-001.md) -- No Public ACL Modification (the escalation that ACL readability enables reconnaissance for)
* [`CTL.S3.ACL.FULLCONTROL.001`](/docs/reference/invariants-reference/acl-escalation/inv-s3-acl-fullcontrol-001.md) -- No FULL\_CONTROL ACL Grants to Public (FULL\_CONTROL implies READ\_ACP)
* [`CTL.S3.CONTROLS.001`](/docs/reference/invariants-reference/public-access/inv-s3-controls-001.md) -- Public Access Block Must Be Enabled (PAB neutralizes ACL-based grants)
