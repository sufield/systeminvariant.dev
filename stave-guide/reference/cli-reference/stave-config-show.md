---
title: "stave config show"
sidebar_label: "config show"
sidebar_position: 56
description: "Show effective project configuration and value sources"
---

# stave config show

Show effective project configuration and value sources

## Usage

```
stave config show
```

## Description

Show prints the effective configuration values used by Stave and where each
value came from (environment variable, stave.yaml, user config, or built-in default).

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples

```bash
stave config show --format json
```
