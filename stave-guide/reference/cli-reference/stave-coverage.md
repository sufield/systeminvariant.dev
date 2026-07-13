---
title: "stave coverage"
sidebar_label: "coverage"
sidebar_position: 66
description: "Analyze observation field coverage against control predicates"
---

# stave coverage

Analyze observation field coverage against control predicates

## Usage

```
stave coverage [flags]
```

## Description

Analyze which controls can evaluate against a snapshot by checking
whether all fields referenced in control predicates are present in
the snapshot's asset properties.

Controls are classified as:
  EVALUABLE    All referenced fields present in snapshot
  INCOMPLETE   Some fields missing — INCOMPLETE verdict expected
  SILENT_RISK  Missing fields could produce false PASS verdicts
  NO_ASSETS    No assets of the required type in snapshot

Inputs:
  --snapshot PATH     Path to observation snapshot JSON (required)
  --controls PATH     Path to controls directory (default: controls)
  --format STRING     Output format: table (default) | json

Exit Codes:
  0   No silent risk controls
  2   Invalid input
  3   Silent risk controls detected

## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | path to controls directory (default: `controls`) |
| `-f, --format` | string | output format: table \| json (default: `table`) |
| `--no-pager` | bool | never page output, even on a terminal |
| `--snapshot` | string | path to observation snapshot JSON (required) |

## Examples

```bash
# Analyze coverage against snapshot
  stave coverage --snapshot snapshot.json

  # JSON output for automation
  stave coverage --snapshot snapshot.json --format json

  # Check before assessment
  stave coverage --snapshot snapshot.json && stave apply --snapshot snapshot.json
```
