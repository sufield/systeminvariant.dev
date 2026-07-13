---
title: "stave enforce"
sidebar_label: "enforce"
sidebar_position: 75
description: "Generate deterministic enforcement templates from evaluation output"
---

# stave enforce

Generate deterministic enforcement templates from evaluation output

## Usage

```
stave enforce [flags]
```

## Description

Enforce reads evaluation JSON and generates deterministic remediation templates.

Supported Modes:
  pab - Generates AWS Public Access Block Terraform (.tf)
  scp - Generates AWS Service Control Policy JSON (.json)

Exit Codes:
  0   - Success
  2   - Input error
  4   - Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--dry-run` | bool | Preview planned paths without writing files |
| `-i, --in` | string | Path to evaluation JSON input (required) |
| `--mode` | string | Enforcement mode: pab\|scp (default: `pab`) |
| `--out` | string | Output directory for generated templates (default: `output`) |

## Examples

```bash
stave enforce --input evaluation.json --mode terraform
```
