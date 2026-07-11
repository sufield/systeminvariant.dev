# Shared-Bucket Tenant Isolation Must Enforce Prefix

**ID:** `CTL.S3.TENANT.ISOLATION.001` **Category:** Access Control **Severity:** Critical

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

When a shared S3 bucket uses prefix-based tenant isolation, every app-signer identity that produces presigned URLs must enforce the tenant prefix. An identity that allows path traversal (`../`) or disables prefix enforcement lets one tenant read or overwrite another tenant's objects.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Multi-tenant platforms commonly use a single S3 bucket with per-tenant prefixes like `org-123/uploads/` to isolate customer data. The presigned URL signer is the enforcement boundary: it must guarantee that tenant A cannot craft a key like `../org-456/secrets.csv` to escape their prefix. On a bucket like `acme-platform-tenant-uploads` holding files for thousands of customers, a single app-signer with `enforce_prefix=false` or `allow_traversal=true` breaks isolation for every tenant simultaneously. This is a data breach across your entire customer base, not a single-account misconfiguration.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.TENANT.ISOLATION.001",
  "control_name": "Shared-Bucket Tenant Isolation Must Enforce Prefix",
  "resource_id": "acme-platform-tenant-uploads",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.kind",
        "value": "bucket"
      },
      {
        "path": "properties.storage.tags.tenant_mode",
        "value": "shared"
      },
      {
        "path": "properties.storage.tags.tenant_prefix",
        "value": "org-{tenant_id}/uploads/"
      }
    ],
    "first_unsafe_at": "2026-01-04T00:00:00Z",
    "last_seen_unsafe_at": "2026-01-15T00:00:00Z",
    "unsafe_duration_hours": 264,
    "threshold_hours": 0,
    "why_now": "Resource has been unsafe for 264 hours (threshold: 0 hours). Unsafe since 2026-01-04T00:00:00Z."
  },
  "mitigation": {
    "description": "Control violation detected.",
    "action": "Review the unsafe configuration and remediate."
  }
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe shared bucket has all app-signer identities enforcing the tenant prefix with path traversal blocked:

```
{
  "storage": {
    "kind": "bucket",
    "tags": {
      "tenant_mode": "shared",
      "tenant_prefix": "org-{tenant_id}/uploads/"
    }
  },
  "identities": [
    {
      "type": "app_signer",
      "id": "appsigner:s3:uploads",
      "purpose": "enforce_prefix=true allow_traversal=false"
    }
  ]
}
```

**To remediate:** Update the app-signer configuration to enforce tenant prefix restrictions (`enforce_prefix=true`) and block path traversal (`allow_traversal=false`) on all presigned URL signers. Audit every identity attached to the shared bucket to confirm none allow prefix escape.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.WRITE.SCOPE.001`](/docs/reference/invariants-reference/access-control/inv-s3-write-scope-001.md) -- S3 Signed Upload Must Bind To Exact Object Key (flags prefix-wide write grants in upload policies)
* [`CTL.S3.ACCESS.003`](/docs/reference/invariants-reference/access-control/inv-s3-access-003.md) -- No External Write Access (flags external write grants that compound tenant isolation failures)
* [`CTL.S3.ACCESS.001`](/docs/reference/invariants-reference/access-control/inv-s3-access-001.md) -- No Unauthorized Cross-Account Access (flags external account access that could bypass tenant boundaries)
