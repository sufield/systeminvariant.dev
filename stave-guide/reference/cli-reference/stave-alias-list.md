---
title: "stave alias list"
sidebar_label: "alias list"
sidebar_position: 4
description: "List all aliases"
---

# stave alias list

List all aliases

## Usage

```
stave alias list [flags]
```

## Description

List all defined aliases from user config.

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
stave alias list --format json
```
