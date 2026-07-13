---
title: "stave config context list"
sidebar_label: "config context list"
sidebar_position: 47
description: "List available contexts"
---

# stave config context list

List available contexts

## Usage

```
stave config context list [flags]
```

## Description

List all named contexts stored in the user configuration.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples

```bash
stave config context list
  stave config context list --format json
```
