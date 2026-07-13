---
title: "stave config set"
sidebar_label: "config set"
sidebar_position: 55
description: "Set a project config value in stave.yaml"
---

# stave config set

Set a project config value in stave.yaml

## Usage

```
stave config set <key> <value>
```

## Description

Set updates stave.yaml in the nearest project root, or creates one in the
current directory if none exists.

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
stave config set max_unsafe 72h
```
