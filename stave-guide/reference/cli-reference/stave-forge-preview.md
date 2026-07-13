---
title: "stave forge preview"
sidebar_label: "forge preview"
sidebar_position: 107
description: "Evaluate a predicate against a snapshot without writing files"
---

# stave forge preview

Evaluate a predicate against a snapshot without writing files

## Usage

```
stave forge preview [flags]
```

## Description

Evaluates a control predicate against all matching assets in a snapshot
and shows per-resource FAIL/PASS results. Uses the identical CEL
evaluation path as stave apply.

Predicate can be specified as field/op/value or as a raw expression.

Exit Codes:
  0   Preview completed successfully
  2   Invalid input or missing flags
  4   Internal error

Examples:
  stave forge preview --snapshot obs.json \
    --field properties.storage.access.public_read --op eq --value true

  stave forge preview --snapshot obs.json --asset-type aws_s3_bucket \
    --field properties.storage.encryption.at_rest_enabled --op eq --value false

## Flags

| Flag | Type | Description |
|---|---|---|
| `--asset-type` | string | filter to a specific asset type |
| `--field` | string | predicate field path |
| `--op` | string | predicate operator (default: `eq`) |
| `--predicate` | string | raw CEL predicate expression (alternative to field/op/value) |
| `--snapshot` | string | path to snapshot file (required) |
| `--value` | string | predicate value (default: `true`) |

## Examples

```bash
stave forge preview --snapshot obs.json --field properties.storage.access.public_read --op eq --value true
```
