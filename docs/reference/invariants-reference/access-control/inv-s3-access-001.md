# No Unauthorized Cross-Account Access

**ID:** `CTL.S3.ACCESS.001` **Category:** Access Control **Severity:** High

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket policies must not grant access to external AWS accounts not in the `allowed_accounts` list. The control checks `external_account_ids` against a configurable allowlist and fires when any account ID is not in the permitted set.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Cross-account bucket policies are the most common path to unintended data exposure in multi-account AWS environments. When a bucket policy references an external account ID in its `Principal` element, any IAM entity in that account can access the bucket -- including roles that the external account creates after the policy is written. A single stale cross-account grant on a bucket like `acme-healthcare-claims-data` can expose regulated data to an account you no longer control.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.ACCESS.001",
  "control_name": "No Unauthorized Cross-Account Access",
  "resource_id": "acme-healthcare-claims-data",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.kind",
        "value": "bucket"
      },
      {
        "path": "properties.storage.access.external_account_ids",
        "value": ["123456789012"]
      }
    ],
    "first_unsafe_at": "2026-01-10T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 120,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 120 hours (threshold: 0 hours). Unsafe since 2026-01-10T00:00:00Z."
  },
  "mitigation": {
    "description": "Control violation detected.",
    "action": "Review the unsafe configuration and remediate."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe bucket has no external account IDs, or only those listed in the control's `allowed_accounts` parameter:

```
{
  "storage": {
    "kind": "bucket",
    "access": {
      "external_account_ids": []
    }
  }
}
```

**To remediate:** Review bucket policy `Principal` elements for external account IDs. Remove statements granting access to accounts not in your organization. Use the `aws:PrincipalOrgID` condition key to restrict access to your AWS Organization. Alternatively, add trusted account IDs to the control's `allowed_accounts` parameter.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ACCESS.003`](/docs/reference/invariants-reference/access-control/inv-s3-access-003.md) -- No External Write Access (stricter: flags write/delete grants to external accounts)
* [`CTL.S3.NETWORK.001`](/docs/reference/invariants-reference/access-control/inv-s3-network-001.md) -- Public-Principal Policies Must Have Network Conditions (flags `Principal: *` without network scoping)
* [`CTL.S3.ACCESS.002`](/docs/reference/invariants-reference/access-control/inv-s3-access-002.md) -- No Wildcard Action Policies (flags overly broad action grants)
