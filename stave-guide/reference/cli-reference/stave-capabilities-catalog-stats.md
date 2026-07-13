---
title: "stave capabilities catalog stats"
sidebar_label: "capabilities catalog stats"
sidebar_position: 20
description: "Print aggregate catalog statistics"
---

# stave capabilities catalog stats

Print aggregate catalog statistics

## Usage

```
stave capabilities catalog stats [flags]
```

## Description

Stats computes aggregate counts from the control catalog: total
controls, services, chains, operational features, severity breakdown,
and a per-service summary table.

Inputs:
  --format F       text (default) | json
  --controls DIR   Control catalog directory (default: controls)
  --chains DIR     Chain catalog directory (default: chains)

Exit codes:
  0   Success
  4   Internal error


## Flags

| Flag | Type | Description |
|---|---|---|
| `--chains` | string | chain catalog directory (default: `chains`) |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |

## Examples

```bash
stave catalog stats
  stave catalog stats --format json | jq '.severity'
```
