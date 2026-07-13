---
title: "stave fmt"
sidebar_label: "fmt"
sidebar_position: 100
description: "Format control and observation files deterministically"
---

# stave fmt

Format control and observation files deterministically

## Usage

```
stave fmt <path> [flags]
```

## Description

Fmt normalizes file formatting for control YAML and observation JSON.

Rules:
  - .yaml/.yml files are parsed as ctrl.v1 controls and emitted in canonical field order
  - .json files are parsed as obs.v0.1 snapshots and emitted with stable indentation

Use --check to verify formatting without writing files.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--check` | bool | Check formatting only; do not write files |

## Examples

```bash
stave fmt --controls controls/s3 --check
```
