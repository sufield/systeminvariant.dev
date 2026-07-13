---
title: "stave exempt asset"
sidebar_label: "exempt asset"
sidebar_position: 78
description: "Add a scope exclusion (exemption)"
---

# stave exempt asset

Add a scope exclusion (exemption)

## Usage

```
stave exempt asset [flags]
```

## Description

Add a scope exclusion (exemption) for an asset or asset pattern.
Exempted assets are excluded from all control evaluation.

Exit Codes:
  0   Exemption added
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `--pattern` | string | asset ID or glob pattern (required) |
| `--reason` | string | reason for exemption |

## Examples

```bash
stave exempt asset --pattern "arn:aws:s3:::sandbox-*" --reason "sandbox"
```
