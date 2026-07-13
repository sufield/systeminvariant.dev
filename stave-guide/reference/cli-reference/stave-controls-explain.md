---
title: "stave controls explain"
sidebar_label: "controls explain"
sidebar_position: 62
description: "Explain a specific control"
---

# stave controls explain

Explain a specific control

## Usage

```
stave controls explain <control-id> [flags]
```

## Description

Explain loads one control and prints matched fields, rule expectations,
and a minimal observation snippet.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--controls` | string | Path to control definitions directory (default: `controls`) |

## Examples

```bash
stave controls explain CTL.S3.PUBLIC.001 --controls controls/s3
```
