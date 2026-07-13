---
title: "Observation Export Schema"
sidebar_label: "Observation Export Schema"
sidebar_position: 2
description: "Field-by-field reference for the S3 observation property groups produced by Stave's export and ingest tooling."
---

# Observation Export Schema

This page is the field-by-field reference for the S3 resource property
groups carried in an `obs.v0.1` observation. For the envelope structure see [obs.v0.1 Schema](schema-obs.md); for contract guarantees see [Observation Contract](observation-contract.md). Each group maps to a set
of AWS API calls or Terraform resource attributes.

For the schema envelope (top-level structure, the `assets`/`identities`
arrays, and validation rules) see [Observation Schema
(`obs.v0.1`)](schema-obs.md). For step-by-step recipes that produce
these snapshots, see [Create Observation
Snapshots](../how-to/getting-started/create-snapshots.md).

## Observation file shape

Every observation file follows this structure:

```json
{
  "schema_version": "obs.v0.1",
  "generated_by": {
    "source_type": "aws-s3-snapshot",
    "tool": "aws-cli",
    "tool_version": "2.15.0"
  },
  "captured_at": "2026-01-15T00:00:00Z",
  "resources": [
    {
      "id": "res:aws:s3:bucket:acme-patient-records",
      "type": "storage_bucket",
      "vendor": "aws",
      "properties": {
        "storage": {
          "kind": "bucket",
          "name": "acme-patient-records",
          "visibility": { "public_read": false, "public_list": false },
          "controls": { "public_access_fully_blocked": true },
          "encryption": { "at_rest_enabled": true, "algorithm": "aws:kms" }
        }
      }
    },
    {
      "id": "res:aws:s3:bucket:acme-static-assets",
      "type": "storage_bucket",
      "vendor": "aws",
      "properties": {
        "storage": {
          "kind": "bucket",
          "name": "acme-static-assets",
          "visibility": { "public_read": true, "public_list": false },
          "controls": { "public_access_fully_blocked": false },
          "encryption": { "at_rest_enabled": true, "algorithm": "AES256" }
        }
      }
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `schema_version` | yes | Must be `"obs.v0.1"` |
| `generated_by` | no | Describes the tool that created this snapshot |
| `generated_by.source_type` | no | Identifier for the data source (e.g., `"aws-s3-snapshot"`, `"terraform.plan_json"`) |
| `captured_at` | yes | RFC 3339 timestamp of when this snapshot was taken |
| `resources` | yes | Array of resource objects (S3 buckets) |
| `identities` | no | Array of IAM identity objects (for tenant isolation controls) |

**Key constraints:**

- Each file represents a single point in time (`captured_at`)
- The top-level object must contain only these fields — the schema rejects unknown properties (`additionalProperties: false`)
- Place multiple snapshot files in a directory, one per timestamp
- File names do not matter — Stave sorts by `captured_at`

## Resource object

Each entry in the `resources` array describes one S3 bucket:

```json
{
  "id": "res:aws:s3:bucket:acme-patient-records",
  "type": "storage_bucket",
  "vendor": "aws",
  "properties": {
    "storage": {
      "kind": "bucket",
      "name": "acme-patient-records",
      "visibility": { "public_read": false, "public_list": false },
      "controls": { "public_access_fully_blocked": true },
      "encryption": { "at_rest_enabled": true, "algorithm": "aws:kms" },
      "versioning": { "enabled": true },
      "logging": { "enabled": true, "target_bucket": "acme-access-logs", "target_prefix": "patient-records/" }
    }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique resource identifier |
| `type` | yes | Resource type — use `"storage_bucket"` for S3 |
| `vendor` | yes | Cloud provider — use `"aws"` for S3 |
| `properties` | yes | Nested object containing the configuration data Stave evaluates |

## S3 property groups

The `properties.storage` object contains the bucket configuration that controls check. Each group maps to a set of AWS API calls or Terraform resource attributes.

### Core

| Field | Type | Description |
|-------|------|-------------|
| `kind` | string | Always `"bucket"` for S3 |
| `name` | string | Bucket name |
| `tags` | object | Key-value tag pairs |

```json
"kind": "bucket",
"name": "acme-patient-records",
"tags": {
  "data-classification": "phi",
  "Environment": "production"
}
```

### Visibility

Describes whether the bucket is publicly accessible and through which mechanism.

| Field | Type | Source |
|-------|------|--------|
| `visibility.public_read` | boolean | Bucket policy or ACL grants public read |
| `visibility.public_list` | boolean | Bucket policy grants public listing |
| `visibility.public_write` | boolean | Bucket policy or ACL grants public write |
| `visibility.public_read_via_policy` | boolean | Public read specifically via bucket policy |
| `visibility.public_read_via_acl` | boolean | Public read specifically via ACL |
| `visibility.public_list_via_policy` | boolean | Public listing specifically via bucket policy |

```json
"visibility": {
  "public_read": true,
  "public_list": false,
  "public_write": false,
  "public_read_via_policy": true,
  "public_read_via_acl": false,
  "public_list_via_policy": false
}
```

### Controls

Public access block settings at the bucket and account level.

| Field | Type | Source |
|-------|------|--------|
| `controls.public_access_fully_blocked` | boolean | All four `PublicAccessBlock` settings are `true` |
| `controls.account_public_access_fully_blocked` | boolean | Account-level public access block is fully enabled |
| `controls.public_access_block.block_public_acls` | boolean | `BlockPublicAcls` setting |
| `controls.public_access_block.ignore_public_acls` | boolean | `IgnorePublicAcls` setting |
| `controls.public_access_block.block_public_policy` | boolean | `BlockPublicPolicy` setting |
| `controls.public_access_block.restrict_public_buckets` | boolean | `RestrictPublicBuckets` setting |

```json
"controls": {
  "public_access_fully_blocked": false,
  "account_public_access_fully_blocked": false,
  "public_access_block": {
    "block_public_acls": true,
    "ignore_public_acls": true,
    "block_public_policy": false,
    "restrict_public_buckets": false
  }
}
```

### Encryption

| Field | Type | Source |
|-------|------|--------|
| `encryption.at_rest_enabled` | boolean | Server-side encryption is configured |
| `encryption.algorithm` | string | `"AES256"`, `"aws:kms"`, or `""` if disabled |
| `encryption.kms_key_id` | string | KMS key ARN if using KMS encryption |
| `encryption.in_transit_enforced` | boolean | Bucket policy requires HTTPS (`aws:SecureTransport`) |

```json
"encryption": {
  "at_rest_enabled": true,
  "algorithm": "aws:kms",
  "kms_key_id": "arn:aws:kms:us-east-1:123456789012:key/mrk-abc123",
  "in_transit_enforced": true
}
```

### Versioning

| Field | Type | Source |
|-------|------|--------|
| `versioning.enabled` | boolean | Object versioning is enabled |
| `versioning.mfa_delete_enabled` | boolean | MFA Delete protection is enabled |

```json
"versioning": {
  "enabled": true,
  "mfa_delete_enabled": false
}
```

### Logging

| Field | Type | Source |
|-------|------|--------|
| `logging.enabled` | boolean | Server access logging is configured |
| `logging.target_bucket` | string | Destination bucket for logs |
| `logging.target_prefix` | string | Prefix for log objects |

```json
"logging": {
  "enabled": true,
  "target_bucket": "acme-access-logs",
  "target_prefix": "patient-records/"
}
```

### Access

Cross-account and wildcard policy analysis.

| Field | Type | Source |
|-------|------|--------|
| `access.has_external_access` | boolean | Bucket policy grants access to external accounts |
| `access.external_accounts` | array or null | List of external account ARNs |
| `access.has_wildcard_policy` | boolean | Bucket policy contains wildcard (`*`) principals |

```json
"access": {
  "has_external_access": true,
  "external_accounts": ["arn:aws:iam::987654321098:root"],
  "has_wildcard_policy": false
}
```

### Policy (network scope)

| Field | Type | Source |
|-------|------|--------|
| `policy.has_ip_condition` | boolean | Policy includes IP address conditions |
| `policy.has_vpc_condition` | boolean | Policy includes VPC endpoint conditions |
| `policy.effective_network_scope` | string | `"public"`, `"vpc-restricted"`, `"ip-restricted"`, or `""` |

```json
"policy": {
  "has_ip_condition": false,
  "has_vpc_condition": true,
  "effective_network_scope": "vpc-restricted"
}
```

### Lifecycle

| Field | Type | Source |
|-------|------|--------|
| `lifecycle.rules_configured` | boolean | At least one lifecycle rule exists |
| `lifecycle.rule_count` | integer | Number of lifecycle rules |
| `lifecycle.has_expiration` | boolean | Any rule includes object expiration |
| `lifecycle.has_transition` | boolean | Any rule includes storage class transition |
| `lifecycle.min_expiration_days` | integer | Shortest expiration period across all rules |
| `lifecycle.has_noncurrent_version_expiration` | boolean | Any rule expires noncurrent object versions |

```json
"lifecycle": {
  "rules_configured": true,
  "rule_count": 2,
  "has_expiration": true,
  "has_transition": true,
  "min_expiration_days": 90,
  "has_noncurrent_version_expiration": true
}
```

### Object Lock

| Field | Type | Source |
|-------|------|--------|
| `object_lock.enabled` | boolean | S3 Object Lock is enabled |
| `object_lock.mode` | string | `"COMPLIANCE"`, `"GOVERNANCE"`, or `""` |
| `object_lock.retention_days` | integer | Default retention period in days |

```json
"object_lock": {
  "enabled": true,
  "mode": "COMPLIANCE",
  "retention_days": 2555
}
```

## Identity object

The optional `identities` array describes IAM principals. Tenant isolation controls use this data:

```json
{
  "id": "arn:aws:iam::123456789012:role/data-pipeline",
  "type": "iam_role",
  "vendor": "aws",
  "owner": "data-team",
  "purpose": "ETL pipeline",
  "grants": { "has_wildcard": false },
  "scope": { "distinct_systems": 1, "distinct_resource_groups": 2 }
}
```

## See also

- [Observation Schema (`obs.v0.1`)](schema-obs.md) — the schema
  envelope, validation rules, and what `stave validate` enforces.
- [Create Observation Snapshots](../how-to/getting-started/create-snapshots.md) —
  recipes for producing these snapshots from AWS, Terraform, or by hand.
