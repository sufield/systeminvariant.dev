---
title: "stave forge paths"
sidebar_label: "forge paths"
sidebar_position: 106
description: "List available observation property paths from a snapshot"
---

# stave forge paths

List available observation property paths from a snapshot

## Usage

```
stave forge paths [flags]
```

## Description

Lists all observation property paths for a given asset type in a snapshot,
with types and presence counts. Map entries (like tags) are expanded to
show individual keys present in the snapshot.

Exit Codes:
  0   Paths listed successfully
  2   Invalid input or snapshot not found
  4   Internal error

Examples:
  stave forge paths --snapshot obs.json --asset-type aws_s3_bucket
  stave forge paths --snapshot obs.json --asset-type aws_s3_bucket --filter tags

## Flags

| Flag | Type | Description |
|---|---|---|
| `--asset-type` | string | filter to a specific asset type |
| `--filter` | string | substring filter on path names |
| `--snapshot` | string | path to snapshot file (required) |

## Examples

```bash
stave forge paths --snapshot obs.json --asset-type aws_s3_bucket
```
