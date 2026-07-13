---
title: "stave generate observation"
sidebar_label: "generate observation"
sidebar_position: 112
description: "Generate an observation template"
---

# stave generate observation

Generate an observation template

## Usage

```
stave generate observation <name> [flags]
```

## Description

Generate observation creates an obs.v0.1 JSON template in observations/.

Exit Codes:
  0   - Success
  2   - Input error
  4   - Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--out` | string | Output file path (default: observations/<name>.json) |

## Examples

```bash
stave generate observation my-obs --out observations/snap.json
```
