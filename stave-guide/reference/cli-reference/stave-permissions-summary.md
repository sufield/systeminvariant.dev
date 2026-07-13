---
title: "stave permissions summary"
sidebar_label: "permissions summary"
sidebar_position: 136
description: "Aggregate NEP metrics across all principals"
---

# stave permissions summary

Aggregate NEP metrics across all principals

## Usage

```
stave permissions summary [flags]
```

## Description

Show a high-level NEP summary across all principals in the snapshot.
Includes privilege distribution, finding counts, chain metrics, and
highest-risk principals.

Exit Codes:
  0   No findings above threshold
  1   Critical findings exist
  2   High findings (no critical)
  3   Incomplete resolution
  4   Internal error

Examples:
  stave nep summary --snapshot obs.json
  stave nep summary --snapshot obs.json --threshold critical --format json

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | output format: table \| json (default: `table`) |
| `--snapshot` | string | path to snapshot file (required) |
| `--threshold` | string | severity threshold: none\|limited\|standard\|elevated\|admin (default: `elevated`) |

## Examples

```bash
stave nep summary --snapshot obs.json
```
