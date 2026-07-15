# Create Observation Snapshots

Stave evaluates observation snapshots — JSON files that describe your infrastructure at a point in time. This guide is a set of recipes for producing `obs.v0.1` snapshots from a live AWS account, from Terraform, or by hand.

For the field-by-field spec of the S3 property groups these recipes populate, see [Observation Export Schema](/docs/reference/observation-export-schema.md). For the schema envelope (top-level structure, `assets`, `identities`, validation rules), see [Observation Schema (`obs.v0.1`)](/docs/reference/schema-obs.md).

## From a Live AWS Environment[​](#from-a-live-aws-environment "Direct link to From a Live AWS Environment")

Use the AWS CLI to query your S3 configuration, then convert the output to observation format using `stave ingest --profile mvp1-s3`.

### Step 1: Export raw AWS data[​](#step-1-export-raw-aws-data "Direct link to Step 1: Export raw AWS data")

```
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

```
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

### Step 2: Convert to observation format[​](#step-2-convert-to-observation-format "Direct link to Step 2: Convert to observation format")

```
stave ingest --profile mvp1-s3 \
  --input ./aws-snapshot-2026-01-15 \
  --output observations/2026-01-15.json \
  --include-all \
  --eval-time 2026-01-15T00:00:00Z
```

`ingest --profile mvp1-s3` reads the raw AWS CLI JSON and produces a single observation file that conforms to the `obs.v0.1` schema. It maps each AWS API response to the property groups described in the [Observation Export Schema](/docs/reference/observation-export-schema.md).

By default, `ingest --profile mvp1-s3` filters to buckets tagged with `DataDomain=health` or `containsPHI=true`. To change this:

```
# Extract all buckets (no filtering)
stave ingest --profile mvp1-s3 --input ./aws-snapshot-2026-01-15 --out obs.json --include-all

# Extract specific buckets by name
stave ingest --profile mvp1-s3 --input ./aws-snapshot-2026-01-15 --out obs.json \
  --bucket-allowlist acme-patient-records \
  --bucket-allowlist acme-audit-logs
```

### How AWS API responses map to properties[​](#how-aws-api-responses-map-to-properties "Direct link to How AWS API responses map to properties")

| AWS API call              | Properties populated                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get-bucket-policy`       | `visibility.public_read_via_policy`, `visibility.public_list_via_policy`, `access.has_external_access`, `access.external_accounts`, `access.has_wildcard_policy`, `policy.*`, `encryption.in_transit_enforced` |
| `get-bucket-acl`          | `visibility.public_read_via_acl`, `visibility.public_write` (via ACL)                                                                                                                                          |
| `get-public-access-block` | `controls.public_access_block.*`, `controls.public_access_fully_blocked`                                                                                                                                       |
| `get-bucket-tagging`      | `tags`                                                                                                                                                                                                         |
| Derived from above        | `visibility.public_read`, `visibility.public_list` (union of policy and ACL signals)                                                                                                                           |

Additional AWS API calls for complete coverage (not required by `ingest --profile mvp1-s3` but can be included in custom exporters):

| AWS API call                         | Properties populated                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `get-bucket-encryption`              | `encryption.at_rest_enabled`, `encryption.algorithm`, `encryption.kms_key_id` |
| `get-bucket-versioning`              | `versioning.enabled`, `versioning.mfa_delete_enabled`                         |
| `get-bucket-logging`                 | `logging.enabled`, `logging.target_bucket`, `logging.target_prefix`           |
| `get-bucket-lifecycle-configuration` | `lifecycle.*`                                                                 |
| `get-object-lock-configuration`      | `object_lock.*`                                                               |

## From Terraform[​](#from-terraform "Direct link to From Terraform")

If your S3 buckets are managed by Terraform, you can extract observation data from Terraform state or plan output without querying AWS APIs directly.

### From Terraform state[​](#from-terraform-state "Direct link to From Terraform state")

```
terraform show -json > tf-state.json
```

The state JSON contains the current configuration of every managed resource. Extract S3 bucket attributes and map them to the observation schema:

| Terraform resource attribute                                                                                        | Observation property                                        |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `aws_s3_bucket.bucket`                                                                                              | `storage.name`                                              |
| `aws_s3_bucket_public_access_block.block_public_acls`                                                               | `controls.public_access_block.block_public_acls`            |
| `aws_s3_bucket_public_access_block.ignore_public_acls`                                                              | `controls.public_access_block.ignore_public_acls`           |
| `aws_s3_bucket_public_access_block.block_public_policy`                                                             | `controls.public_access_block.block_public_policy`          |
| `aws_s3_bucket_public_access_block.restrict_public_buckets`                                                         | `controls.public_access_block.restrict_public_buckets`      |
| `aws_s3_bucket_server_side_encryption_configuration.rule.apply_server_side_encryption_by_default.sse_algorithm`     | `encryption.algorithm`                                      |
| `aws_s3_bucket_server_side_encryption_configuration.rule.apply_server_side_encryption_by_default.kms_master_key_id` | `encryption.kms_key_id`                                     |
| `aws_s3_bucket_versioning.versioning_configuration.status`                                                          | `versioning.enabled` (`"Enabled"` = true)                   |
| `aws_s3_bucket_logging.target_bucket`                                                                               | `logging.target_bucket`                                     |
| `aws_s3_bucket_logging.target_prefix`                                                                               | `logging.target_prefix`                                     |
| `aws_s3_bucket_lifecycle_configuration.rule`                                                                        | `lifecycle.*`                                               |
| `aws_s3_bucket_object_lock_configuration.rule.default_retention`                                                    | `object_lock.*`                                             |
| `aws_s3_bucket_policy.policy`                                                                                       | Parse JSON to derive `visibility.*`, `access.*`, `policy.*` |

### From Terraform plan[​](#from-terraform-plan "Direct link to From Terraform plan")

To evaluate what Terraform is about to deploy (before `apply`):

```
terraform plan -out=plan.tfplan
terraform show -json plan.tfplan > observations/2026-01-15.json
```

Evaluate Terraform plan output the same way as any other observation:

```
stave apply \
  --controls controls/s3 \
  --observations ./observations \
  --max-unsafe 7d
```

### Writing a Terraform-to-observation converter[​](#writing-a-terraform-to-observation-converter "Direct link to Writing a Terraform-to-observation converter")

For full control, write a script that reads `terraform show -json` output and produces `obs.v0.1` JSON. A minimal approach using `jq`:

```
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

## By Hand[​](#by-hand "Direct link to By Hand")

You can create observation JSON manually. This is useful for testing custom controls or evaluating hypothetical configurations. Here is a complete example with all property groups populated:

```
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

```
stave validate --observations ./observations --controls controls/s3
```

## Snapshot Cadence[​](#snapshot-cadence "Direct link to Snapshot Cadence")

For `unsafe_duration` controls, Stave needs multiple snapshots to calculate how long a resource has been unsafe:

* **Minimum:** 2 snapshots at different times
* **Recommended:** Daily snapshots (via cron or CI) for accurate duration tracking
* **Gaps:** Observation gaps larger than 12 hours reduce confidence in findings

For `unsafe_state` controls (no duration tracking), a single snapshot is sufficient.

```
observations/
  2026-01-13.json
  2026-01-14.json
  2026-01-15.json
```

Point Stave at the directory and it evaluates all snapshots together, building resource timelines automatically.

## See also[​](#see-also "Direct link to See also")

* [Observation Export Schema](/docs/reference/observation-export-schema.md) — field-by-field spec of the S3 property groups these recipes populate.
* [Observation Schema (`obs.v0.1`)](/docs/reference/schema-obs.md) — the schema envelope and validation rules.
