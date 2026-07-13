---
title: "stave capabilities catalog coverage"
sidebar_label: "capabilities catalog coverage"
sidebar_position: 16
description: "Show per-service control coverage"
---

# stave capabilities catalog coverage

Show per-service control coverage

## Usage

```
stave capabilities catalog coverage [flags]
```

## Description

Coverage maps the catalog against services, showing how many
controls and categories each service has and which asset types they
apply to.

Inputs:
  --format F       text (default) | json
  --controls DIR   Control catalog directory (default: controls)

Exit codes:
  0   Success
  4   Internal error


## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |

## Examples

```bash
stave catalog coverage
  stave catalog coverage --format json | jq '.services[] | select(.controls > 10)'
```
