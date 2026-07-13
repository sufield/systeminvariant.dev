---
title: "stave config get"
sidebar_label: "config get"
sidebar_position: 54
description: "Get a config value"
---

# stave config get

Get a config value

## Usage

```
stave config get <key>
```

## Description

Get prints a config value.

Supported keys:
  max_unsafe
  snapshot_retention
  default_retention_tier
  ci_failure_policy
  capture_cadence
  snapshot_filename_template
  snapshot_retention_tiers.<tier>

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples

```bash
stave config get max_unsafe
```
