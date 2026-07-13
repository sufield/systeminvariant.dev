---
title: "stave cel eval"
sidebar_label: "cel eval"
sidebar_position: 30
description: "Evaluate a CEL expression against observation assets"
---

# stave cel eval

Evaluate a CEL expression against observation assets

## Usage

```
stave cel eval [flags]
```

## Description

Evaluate a CEL expression against assets from an observation file.
Reports which assets match and which do not.

Inputs:
  --expr         CEL expression to evaluate (required)
  --input        Path to observation JSON file
  --stdin        Read observation JSON from stdin
  --asset-type   Filter to assets of this type
  --format       Output format: text or json (default: text)

Exit Codes:
  0   Evaluation completed
  2   Invalid input
  4   Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--asset-type` | string | Filter to assets of this type |
| `--expr` | string | CEL expression to evaluate (required) |
| `-f, --format` | string | Output format: text or json (default: `text`) |
| `--input` | string | Path to observation JSON file |
| `--stdin` | bool | Read observation JSON from stdin |

## Examples

```bash
stave cel eval --expr 'properties["storage"]["versioning"]["enabled"] == false' --input obs.json
  cat obs.json | stave cel eval --expr 'properties["type"] == "aws_s3_bucket"' --stdin
```
