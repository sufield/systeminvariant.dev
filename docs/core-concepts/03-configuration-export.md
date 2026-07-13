---
title: "Configuration Export"
sidebar_label: "Configuration Export"
sidebar_position: 3
description: "How to create observation snapshots from your live infrastructure for Stave evaluation."
---

# Configuration Export

Stave evaluates observation snapshots — JSON files that describe your infrastructure at a point in time. This page explains the observation schema and how to create snapshots from your live environment.

## Observation Schema (`obs.v0.1`)

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
| `identities` | no | Array of IAM identity objects (for tenant isolation invariants) |

**Key constraints:**

- Each file represents a single point in time (`captured_at`)
- The top-level object must contain only these fields — the schema rejects unknown properties (`additionalProperties: false`)
- Place multiple snapshot files in a directory, one per timestamp
- File names do not matter — Stave sorts by `captured_at`

### Resource object

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

### S3 property groups

The `properties.storage` object contains the bucket configuration that invariants check. Each group maps to a set of AWS API calls or Terraform resource attributes.

#### Core

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

#### Visibility

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

#### Controls

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

#### Encryption

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

#### Versioning

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

#### Logging

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

#### Access

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

#### Policy (network scope)

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

#### Lifecycle

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

#### Object Lock

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

### Identity object

The optional `identities` array describes IAM principals. Tenant isolation invariants use this data:

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

## Creating Snapshots from a Live AWS Environment

Use the AWS CLI to query your S3 configuration, then convert the output to observation format using `stave ingest --profile mvp1-s3`.

### Step 1: Export raw AWS data

```bash
#!/bin/bash
SNAPSHOT_DIR="./aws-snapshot-$(date +%Y-%m-%d)"
mkdir -p "$SNAPSHOT_DIR"/{get-bucket-policy,get-bucket-acl,get-public-access-block,get-bucket-tagging}

aws s3api list-buckets > "$SNAPSHOT_DIR/list-buckets.json"

for bucket in $(jq -r '.Buckets[].Name' "$SNAPSHOT_DIR/list-buckets.json"); do
  aws s3api get-bucket-policy --bucket "$bucket" \
    > "$SNAPSHOT_DIR/get-bucket-policy/$bucket.json" 2>/dev/null || true
  aws s3api get-bucket-acl --bucket "$bucket" \
    > "$SNAPSHOT_DIR/get-bucket-acl/$bucket.json" 2>/dev/null || true
  aws s3api get-public-access-block --bucket "$bucket" \
    > "$SNAPSHOT_DIR/get-public-access-block/$bucket.json" 2>/dev/null || true
  aws s3api get-bucket-tagging --bucket "$bucket" \
    > "$SNAPSHOT_DIR/get-bucket-tagging/$bucket.json" 2>/dev/null || true
done
```

Required IAM permissions:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:ListAllMyBuckets",
    "s3:GetBucketPolicy",
    "s3:GetBucketAcl",
    "s3:GetPublicAccessBlock",
    "s3:GetBucketTagging"
  ],
  "Resource": "*"
}
```

The expected directory structure after export:

```
aws-snapshot-2026-01-15/
  list-buckets.json
  get-bucket-policy/<bucket-name>.json
  get-bucket-acl/<bucket-name>.json
  get-public-access-block/<bucket-name>.json
  get-bucket-tagging/<bucket-name>.json
```

### Step 2: Convert to observation format

```bash
stave ingest --profile mvp1-s3 \
  --input ./aws-snapshot-2026-01-15 \
  --output observations/2026-01-15.json \
  --include-all \
  --eval-time 2026-01-15T00:00:00Z
```

`ingest --profile mvp1-s3` reads the raw AWS CLI JSON and produces a single observation file that conforms to the `obs.v0.1` schema. It maps each AWS API response to the property groups described above.

By default, `ingest --profile mvp1-s3` filters to buckets tagged with `DataDomain=health` or `containsPHI=true`. To change this:

```bash
# Extract all buckets (no filtering)
stave ingest --profile mvp1-s3 --input ./aws-snapshot-2026-01-15 --out obs.json --include-all

# Extract specific buckets by name
stave ingest --profile mvp1-s3 --input ./aws-snapshot-2026-01-15 --out obs.json \
  --bucket-allowlist acme-patient-records \
  --bucket-allowlist acme-audit-logs
```

### How AWS API responses map to properties

| AWS API call | Properties populated |
|-------------|---------------------|
| `get-bucket-policy` | `visibility.public_read_via_policy`, `visibility.public_list_via_policy`, `access.has_external_access`, `access.external_accounts`, `access.has_wildcard_policy`, `policy.*`, `encryption.in_transit_enforced` |
| `get-bucket-acl` | `visibility.public_read_via_acl`, `visibility.public_write` (via ACL) |
| `get-public-access-block` | `controls.public_access_block.*`, `controls.public_access_fully_blocked` |
| `get-bucket-tagging` | `tags` |
| Derived from above | `visibility.public_read`, `visibility.public_list` (union of policy and ACL signals) |

Additional AWS API calls for complete coverage (not required by `ingest --profile mvp1-s3` but can be included in custom exporters):

| AWS API call | Properties populated |
|-------------|---------------------|
| `get-bucket-encryption` | `encryption.at_rest_enabled`, `encryption.algorithm`, `encryption.kms_key_id` |
| `get-bucket-versioning` | `versioning.enabled`, `versioning.mfa_delete_enabled` |
| `get-bucket-logging` | `logging.enabled`, `logging.target_bucket`, `logging.target_prefix` |
| `get-bucket-lifecycle-configuration` | `lifecycle.*` |
| `get-object-lock-configuration` | `object_lock.*` |

## Creating Snapshots from Terraform

If your S3 buckets are managed by Terraform, you can extract observation data from Terraform state or plan output without querying AWS APIs directly.

### From Terraform state

```bash
terraform show -json > tf-state.json
```

The state JSON contains the current configuration of every managed resource. Extract S3 bucket attributes and map them to the observation schema:

| Terraform resource attribute | Observation property |
|-----------------------------|---------------------|
| `aws_s3_bucket.bucket` | `storage.name` |
| `aws_s3_bucket_public_access_block.block_public_acls` | `controls.public_access_block.block_public_acls` |
| `aws_s3_bucket_public_access_block.ignore_public_acls` | `controls.public_access_block.ignore_public_acls` |
| `aws_s3_bucket_public_access_block.block_public_policy` | `controls.public_access_block.block_public_policy` |
| `aws_s3_bucket_public_access_block.restrict_public_buckets` | `controls.public_access_block.restrict_public_buckets` |
| `aws_s3_bucket_server_side_encryption_configuration.rule.apply_server_side_encryption_by_default.sse_algorithm` | `encryption.algorithm` |
| `aws_s3_bucket_server_side_encryption_configuration.rule.apply_server_side_encryption_by_default.kms_master_key_id` | `encryption.kms_key_id` |
| `aws_s3_bucket_versioning.versioning_configuration.status` | `versioning.enabled` (`"Enabled"` = true) |
| `aws_s3_bucket_logging.target_bucket` | `logging.target_bucket` |
| `aws_s3_bucket_logging.target_prefix` | `logging.target_prefix` |
| `aws_s3_bucket_lifecycle_configuration.rule` | `lifecycle.*` |
| `aws_s3_bucket_object_lock_configuration.rule.default_retention` | `object_lock.*` |
| `aws_s3_bucket_policy.policy` | Parse JSON to derive `visibility.*`, `access.*`, `policy.*` |

### From Terraform plan

To evaluate what Terraform is about to deploy (before `apply`):

```bash
terraform plan -out=plan.tfplan
terraform show -json plan.tfplan > observations/2026-01-15.json
```

Evaluate the Terraform plan output directly — custom or unrecognized `source_type` values are accepted by default:

```bash
stave apply \
  --invariants invariants/s3 \
  --observations ./observations \
  --max-unsafe 7d
```

### Writing a Terraform-to-observation converter

For full control, write a script that reads `terraform show -json` output and produces `obs.v0.1` JSON. A minimal approach using `jq`:

```bash
terraform show -json | jq '{
  schema_version: "obs.v0.1",
  captured_at: (now | todate),
  generated_by: {
    source_type: "terraform.state_json",
    tool: "terraform",
    tool_version: "1.9.8"
  },
  resources: [
    .values.root_module.resources[]
    | select(.type == "aws_s3_bucket")
    | {
        id: ("res:aws:s3:bucket:" + .values.bucket),
        type: "storage_bucket",
        vendor: "aws",
        properties: {
          storage: {
            kind: "bucket",
            name: .values.bucket,
            visibility: { public_read: false, public_list: false },
            controls: { public_access_fully_blocked: false },
            encryption: {
              at_rest_enabled: false,
              algorithm: "",
              in_transit_enforced: false
            },
            versioning: { enabled: false },
            logging: { enabled: false, target_bucket: "", target_prefix: "" }
          }
        }
      }
  ]
}' > observations/2026-01-15.json
```

This produces a baseline observation. Enrich it by joining data from related Terraform resources (`aws_s3_bucket_public_access_block`, `aws_s3_bucket_server_side_encryption_configuration`, etc.) to populate additional property groups.

## Writing Observations by Hand

You can create observation JSON manually. This is useful for testing custom invariants or evaluating hypothetical configurations. Here is a complete example with all property groups populated:

```json
{
  "schema_version": "obs.v0.1",
  "generated_by": {
    "source_type": "manual",
    "tool": "hand-written"
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
          "visibility": {
            "public_read": false,
            "public_list": false,
            "public_write": false
          },
          "controls": {
            "public_access_fully_blocked": true
          },
          "encryption": {
            "at_rest_enabled": true,
            "algorithm": "aws:kms",
            "kms_key_id": "arn:aws:kms:us-east-1:123456789012:key/mrk-abc123",
            "in_transit_enforced": true
          },
          "versioning": {
            "enabled": true,
            "mfa_delete_enabled": false
          },
          "logging": {
            "enabled": true,
            "target_bucket": "acme-access-logs",
            "target_prefix": "patient-records/"
          },
          "tags": {
            "data-classification": "phi",
            "data-retention": "7years"
          }
        }
      }
    }
  ]
}
```

As long as the file conforms to the `obs.v0.1` schema, Stave will accept it. Use `stave validate` to check your files before evaluation:

```bash
stave validate --observations ./observations --invariants invariants/s3
```

Custom `source_type` values are accepted by default — no extra flag is needed.

## Snapshot Cadence

For `unsafe_duration` invariants, Stave needs multiple snapshots to calculate how long a resource has been unsafe:

- **Minimum:** 2 snapshots at different times
- **Recommended:** Daily snapshots (via cron or CI) for accurate duration tracking
- **Gaps:** Observation gaps larger than 12 hours reduce confidence in findings

For `unsafe_state` invariants (no duration tracking), a single snapshot is sufficient.

```
observations/
  2026-01-13.json
  2026-01-14.json
  2026-01-15.json
```

Point Stave at the directory and it evaluates all snapshots together, building resource timelines automatically.
