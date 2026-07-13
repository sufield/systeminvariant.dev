---
title: "stave contract show"
sidebar_label: "contract show"
sidebar_position: 58
description: "Show the agent-facing contract for an asset type"
---

# stave contract show

Show the agent-facing contract for an asset type

## Usage

```
stave contract show [flags]
```

## Description

Show emits everything an agent needs to populate observations for
one asset type:

  - the per-asset JSON Schema path
  - the property paths the catalog reads, with type, control count,
    chain count, and a "required vs optional" hint
  - any Steampipe mapping under contracts/steampipe/

Use --list to enumerate every asset type with at least one
applicable_asset_types declaration in the catalog, showing whether
each has a schema and a Steampipe mapping.

Inputs:
  --asset-type T     Asset type to show (e.g. aws_s3_bucket)
  --list             List every asset type with controls (no --asset-type)
  --controls DIR     Control catalog (default: controls)
  --chains DIR       Chain catalog (default: chains)
  --steampipe DIR    Directory of Steampipe mappings (default: contracts/steampipe)
  --format F         text (default) | json

Exit codes:
  0   Success
  2   Invalid input (missing flag, unknown asset type)
  4   Internal error (catalog load failure)


## Flags

| Flag | Type | Description |
|---|---|---|
| `--asset-type` | string | asset type to inspect (e.g. aws_s3_bucket) |
| `--chains` | string | chain catalog directory (default: `chains`) |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |
| `--list` | bool | list every asset type with controls |
| `--no-pager` | bool | never page output, even on a terminal |
| `--steampipe` | string | Steampipe mapping directory (default: `contracts/steampipe`) |

## Examples

```bash
# Detailed view for one type
  stave contract show --asset-type aws_s3_bucket

  # All types with at-a-glance schema + mapping presence
  stave contract show --list

  # Machine-readable
  stave contract show --asset-type aws_iam_role --format json
```
