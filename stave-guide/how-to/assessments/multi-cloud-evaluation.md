---
sidebar_position: 4
---
# How to Evaluate Multi-Cloud Infrastructure

Stave evaluates any cloud provider and any service without engine changes.
Each domain has its own controls and observation property namespace.

## Available profiles

```bash
stave apply --profile aws-s3     # 67 S3 controls
stave apply --profile aws-iam    # 41 IAM controls
stave apply --profile gcp-gcs    # 7 GCS controls
stave apply --profile hipaa      # HIPAA compliance (S3)
```

## Standard mode (any domain)

Use `--controls` to point at any control directory:

```bash
# Evaluate S3 buckets
stave apply --controls controls/s3 --observations obs/ --max-unsafe 168h

# Evaluate IAM accounts
stave apply --controls controls/iam --observations obs/ --max-unsafe 168h

# Evaluate GCS buckets
stave apply --controls controls/gcs --observations obs/ --max-unsafe 168h

# Evaluate DNS records
stave apply --controls controls/dns --observations obs/ --max-unsafe 168h
```

## Mixing domains in one evaluation

Point `--controls` at multiple directories or a parent directory:

```bash
# Evaluate all domains
stave apply --controls controls/ --observations obs/ --max-unsafe 168h
```

Controls only fire on assets that match their predicates. S3 controls check
`properties.storage.kind == "bucket"`. IAM controls check
`properties.identity.kind == "user"`. They coexist without conflict.

## Writing observations for non-S3 domains

### IAM observation (account-level)

```json
{
  "schema_version": "obs.v0.1",
  "captured_at": "2026-01-01T00:00:00Z",
  "assets": [{
    "id": "aws-account-root",
    "type": "aws_iam_account",
    "vendor": "aws",
    "properties": {
      "identity": {
        "kind": "account",
        "root": { "mfa_enabled": false, "has_access_keys": true, "hardware_mfa": false }
      }
    }
  }]
}
```

### IAM observation (user-level)

```json
{
  "schema_version": "obs.v0.1",
  "captured_at": "2026-01-01T00:00:00Z",
  "assets": [{
    "id": "iam-user-alice",
    "type": "aws_iam_user",
    "vendor": "aws",
    "properties": {
      "identity": {
        "kind": "user",
        "policies": {
          "has_admin_access": true,
          "has_self_modify": false,
          "passrole_unrestricted": false,
          "statement_count": 12
        },
        "mfa": { "hardware_mfa": true },
        "credentials": { "inactive_days": 5 }
      }
    }
  }]
}
```

### GCS observation

```json
{
  "schema_version": "obs.v0.1",
  "captured_at": "2026-01-01T00:00:00Z",
  "assets": [{
    "id": "my-gcs-bucket",
    "type": "gcp_gcs_bucket",
    "vendor": "gcp",
    "properties": {
      "storage": {
        "kind": "bucket",
        "access": { "public_read": true }
      }
    }
  }]
}
```

### DNS observation

```json
{
  "schema_version": "obs.v0.1",
  "captured_at": "2026-01-01T00:00:00Z",
  "assets": [{
    "id": "legacy-subdomain",
    "type": "dns_record",
    "vendor": "cloudflare",
    "properties": {
      "dns": {
        "hostname": "old.example.com",
        "record_type": "CNAME",
        "target": "deleted-bucket.s3.amazonaws.com",
        "target_exists": false,
        "target_owned": false
      }
    }
  }]
}
```

## Property namespace reference

See `docs/observation-contract.md` for the full field dictionary:

- **S3**: `properties.storage.*` (67 controls, 80+ fields)
- **IAM**: `properties.identity.*` (41 controls, 20+ fields)
- **OpenSearch**: `properties.search_service.*` (12 controls, Darkbeam/Wyze/Microsoft breach patterns)
- **GCS**: `properties.storage.*` (7 controls, shared namespace with S3)
- **ECR**: `properties.container_registry.*` (3 controls, container supply chain)
- **DNS**: `properties.dns.*` (3 controls, vendor-agnostic)

## Verify binary integrity across domains

```bash
stave version --verify
```

Shows control count per domain and the policy library hash — confirming
which controls are embedded in the binary.
