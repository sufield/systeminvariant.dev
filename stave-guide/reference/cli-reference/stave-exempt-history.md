---
title: "stave exempt history"
sidebar_label: "exempt history"
sidebar_position: 81
description: "Show full audit trail including expired entries"
---

# stave exempt history

Show full audit trail including expired entries

## Usage

```
stave exempt history [flags]
```

## Description

Show the complete audit trail for all acknowledgments, including
expired and revoked entries. Each entry shows its full lifecycle.

Exit Codes:
  0   History produced
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `-f, --format` | string | output format: table \| json (default: `table`) |

## Examples

```bash
stave exempt history
  stave exempt history --format json
```
