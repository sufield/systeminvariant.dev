---
title: "stave controls list"
sidebar_label: "controls list"
sidebar_position: 63
description: "List control IDs and names"
---

# stave controls list

List control IDs and names

## Usage

```
stave controls list [flags]
```

## Description

List loads controls from a directory and prints concise metadata.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--built-in` | bool | List built-in embedded controls instead of filesystem |
| `-c, --columns` | string | Comma-separated columns: id,name,type,risk,domain (default: `id,name,type`) |
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `--filter` | stringSlice | Filter controls by selector (e.g. aws/s3/severity:high+) |
| `-f, --format` | string | Output format: text, json, csv (default: `text`) |
| `--no-headers` | bool | Hide headers for table/csv output |
| `--packs` | bool | List built-in control packs instead of controls |
| `-s, --sort` | string | Sort column: id,name,type,risk,domain (default: `id`) |

## Examples

```bash
stave controls list --controls controls/s3 --format json
  stave controls list --built-in --filter aws/s3/severity:high+
```
