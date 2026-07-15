# No Wildcard Action Policies

**ID:** `CTL.S3.ACCESS.002` **Category:** Access Control **Severity:** High

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket policies must not use wildcard actions such as `s3:*` or `*`. Any policy statement that grants all S3 actions is flagged as unsafe.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Wildcard action grants violate the principle of least privilege. A policy with `"Action": "s3:*"` on a bucket like `acme-payroll-exports` grants not just read access but also `s3:DeleteObject`, `s3:PutBucketPolicy`, and `s3:PutBucketAcl` -- actions that allow an attacker to exfiltrate data, destroy evidence, or escalate access by rewriting the bucket policy itself. Most legitimate access patterns require only a handful of specific actions.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.ACCESS.002",
  "control_name": "No Wildcard Action Policies",
  "resource_id": "acme-payroll-exports",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.access.has_wildcard_policy",
        "value": true
      },
      {
        "path": "properties.storage.kind",
        "value": "bucket"
      }
    ],
    "first_unsafe_at": "2026-01-08T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 168,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 168 hours (threshold: 0 hours). Unsafe since 2026-01-08T00:00:00Z."
  },
  "mitigation": {
    "description": "Control violation detected.",
    "action": "Review the unsafe configuration and remediate."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe bucket policy uses specific actions instead of wildcards:

```
{
  "storage": {
    "kind": "bucket",
    "access": {
      "has_wildcard_policy": false
    }
  }
}
```

**To remediate:** Replace wildcard actions with the specific S3 actions required by the use case. For example, a read-only analytics role needs only `s3:GetObject` and `s3:ListBucket`. A CI/CD pipeline that pushes artifacts needs `s3:PutObject` and `s3:GetObject`, not `s3:*`.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ACCESS.001`](/docs/reference/invariants-reference/access-control/inv-s3-access-001.md) -- No Unauthorized Cross-Account Access (flags external account principals)
* [`CTL.S3.ACCESS.003`](/docs/reference/invariants-reference/access-control/inv-s3-access-003.md) -- No External Write Access (flags write grants to external accounts)
* [`CTL.S3.NETWORK.001`](/docs/reference/invariants-reference/access-control/inv-s3-network-001.md) -- Public-Principal Policies Must Have Network Conditions (flags `Principal: *` without network scoping)
