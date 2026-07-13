---
title: "stave config context show"
sidebar_label: "config context show"
sidebar_position: 48
description: "Show selected context"
---

# stave config context show

Show selected context

## Usage

```
stave config context show [flags]
```

## Description

Show the currently active context and its configured paths.
Reports how the context was selected (active vs STAVE_CONTEXT env var).

Exit Codes:
  0    Success
  2    No context selected
  4    Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples

```bash
stave config context show
  stave config context show --format json
```
