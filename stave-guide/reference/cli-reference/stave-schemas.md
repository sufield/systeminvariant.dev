---
title: "stave schemas"
sidebar_label: "schemas"
sidebar_position: 146
description: "List all contract schemas"
---

# stave schemas

List all contract schemas

## Usage

```
stave schemas [flags]
```

## Description

Schemas lists every wire-format contract schema that this version of Stave
reads or writes, grouped by category.

Exit Codes:
  0   - Success
  4   - Internal error

Examples:
  # List all schemas
  stave schemas

  # JSON output
  stave schemas --format json

  # Pipe to jq
  stave schemas --format json | jq '.data'

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--format` | string | Output format (text, json) (default: `text`) |

## Examples

```bash
stave schemas
```
