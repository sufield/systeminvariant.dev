# No Public Write Access

**ID:** `CTL.S3.PUBLIC.003` **Category:** Public Access **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 buckets must not allow public write or delete access. This control fires when any bucket has `public_write` set to `true`, indicating that anonymous users can upload objects to or delete objects from the bucket.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Public write access is strictly more dangerous than public read access. An attacker with write access can inject malicious content, overwrite legitimate files with tampered versions, or delete critical data. Publicly writable buckets have been used to distribute malware through legitimate-looking download links and to deface websites backed by S3 static hosting. Unlike read exposure, write exposure can compromise the integrity of every object in the bucket.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.PUBLIC.003",
  "control_name": "No Public Write Access",
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
        "path": "properties.storage.visibility.public_write",
        "value": true
      }
    ],
    "why_now": "Resource has been unsafe for 1 hours (threshold: 0 hours). Unsafe since 2026-01-14T23:00:00Z."
  },
  "mitigation": {
    "description": "Bucket allows public write or delete access. Anyone on the internet can upload, overwrite, or delete objects.",
    "action": "Remove bucket policy statements that grant s3:PutObject or s3:DeleteObject to Principal \"*\". Remove ACL grants that allow WRITE or FULL_CONTROL to AllUsers or AuthenticatedUsers. Enable S3 Public Access Block."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `public_write` set to `false`:

```
{
  "properties": {
    "storage": {
      "visibility": {
        "public_write": false
      }
    }
  }
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ACL.WRITE.001`](/docs/reference/invariants-reference/public-access/inv-s3-acl-write-001.md) -- Specifically checks for write access granted through bucket ACLs to AllUsers or AuthenticatedUsers.
* [`CTL.S3.PUBLIC.001`](/docs/reference/invariants-reference/public-access/inv-s3-public-001.md) -- Checks for public read and list access, which often accompanies public write.
* [`CTL.S3.CONTROLS.001`](/docs/reference/invariants-reference/public-access/inv-s3-controls-001.md) -- Ensures Public Access Block is enabled to prevent accidental public write exposure.
