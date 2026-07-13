---
title: "stave exempt upcoming"
sidebar_label: "exempt upcoming"
sidebar_position: 85
description: "Show acceptances approaching expiry"
---

# stave exempt upcoming

Show acceptances approaching expiry

## Usage

```
stave exempt upcoming [flags]
```

## Description

Show acknowledgments with expiry dates within the specified look-ahead window.

Exit Codes:
  0   Report produced
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--days` | int | look-ahead window in days (default: `30`) |
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |

## Examples

```bash
stave exempt upcoming --days 30
```
