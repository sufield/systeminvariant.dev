---
title: "stave config env list"
sidebar_label: "config env list"
sidebar_position: 52
description: "List supported STAVE_* environment variables"
---

# stave config env list

List supported STAVE_* environment variables

## Usage

```
stave config env list [flags]
```

## Description

List prints every supported STAVE_* environment variable with its
description, category, and current value.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples

```bash
stave config env list
```
