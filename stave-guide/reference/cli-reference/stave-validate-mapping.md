---
title: "stave validate-mapping"
sidebar_label: "validate-mapping"
sidebar_position: 161
description: "Validate a Steampipe→Stave mapping file before use"
---

# stave validate-mapping

Validate a Steampipe→Stave mapping file before use

## Usage

```
stave validate-mapping [flags]
```

## Description

Validate inspects a contracts/steampipe/<asset_type>.yaml mapping and
reports whether it can produce a schema-valid observation for the
declared asset type, plus how much of the catalog's read surface it
covers.

Three checks:
  1. Structural — required fields, recognised operation kinds, each
     kind's mandatory subfields.
  2. Schema fit — every operation path resolves to a property declared
     in schemas/observation/v1/asset-types/<asset_type>.schema.json
     (paths the schema does not declare are warned, not failed —
     additionalProperties is true).
  3. Catalog coverage — how many of the property paths the control +
     chain catalog reads for this asset type are populated, with the
     highest-control-count gaps surfaced.

Inputs:
  --file FILE        Mapping YAML to validate (required)
  --controls DIR     Control catalog (default: controls)
  --chains DIR       Chain catalog (default: chains)
  --format F         text (default) | json
  --strict           Treat coverage gaps and unknown-to-schema paths
                     as failures (exit 3) instead of warnings.

Exit codes:
  0   Mapping is valid (warnings may apply unless --strict)
  2   Invalid input (missing flag, unreadable file, bad format)
  3   Mapping is invalid (structural or, with --strict, coverage gap)
  4   Internal error


## Flags

| Flag | Type | Description |
|---|---|---|
| `--chains` | string | chain catalog directory (default: `chains`) |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `--file` | string | mapping YAML file to validate (required) |
| `-f, --format` | string | output format: text \| json (default: `text`) |
| `--strict` | bool | treat coverage gaps and unknown-to-schema paths as failures |

## Examples

```bash
stave validate-mapping --file contracts/steampipe/aws_s3_bucket.yaml
  stave validate-mapping --file contracts/steampipe/aws_iam_role.yaml --strict
  stave validate-mapping --file contracts/steampipe/aws_kms_key.yaml --format json
```
