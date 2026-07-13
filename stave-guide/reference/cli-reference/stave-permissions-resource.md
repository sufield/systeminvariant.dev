---
title: "stave permissions resource"
sidebar_label: "permissions resource"
sidebar_position: 135
description: "Show who has effective access to a resource"
---

# stave permissions resource

Show who has effective access to a resource

## Usage

```
stave permissions resource [flags]
```

## Description

Show all principals with resolved effective access to a specific
resource ARN, with access path attribution (identity-based, resource
policy, or both).

By default shows only non-designated principals. Use --all to include
designated principals.

Exit Codes:
  0   No non-designated access to the resource
  1   Non-designated principals have access (PHI violation)
  3   Incomplete resolution
  4   Internal error

Examples:
  stave nep resource --snapshot obs.json \
    --resource arn:aws:s3:::phi-patient-records

  stave nep resource --snapshot obs.json \
    --resource arn:aws:s3:::phi-records --all

  stave nep resource --snapshot obs.json \
    --resource arn:aws:s3:::phi-records --format dot | dot -Tpng > access.png

## Flags

| Flag | Type | Description |
|---|---|---|
| `--actions` | string | comma-separated action filter |
| `--all` | bool | show all principals including designated |
| `--classification` | string | data classification tag value to filter resources (default: `phi`) |
| `-f, --format` | string | output format: table \| json \| dot (default: `table`) |
| `--resource` | string | resource ARN to query (required) |
| `--show-designated` | bool | show designated principals (alias for --all) |
| `--snapshot` | string | path to snapshot file (required) |

## Examples

```bash
stave nep resource --snapshot obs.json --resource arn:aws:s3:::phi-records
  stave nep resource --snapshot obs.json --resource arn:aws:s3:::phi-records --all --format dot
```
