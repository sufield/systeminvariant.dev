---
title: "stave ci baseline check"
sidebar_label: "ci baseline check"
sidebar_position: 34
description: "Compare evaluation findings against baseline and detect new findings"
---

# stave ci baseline check

Compare evaluation findings against baseline and detect new findings

## Usage

```
stave ci baseline check [flags]
```

## Description

Check compares current evaluation findings against a saved baseline.
New findings (not in the baseline) are reported. Use --fail-on-new to
fail the CI pipeline when new violations appear.

Inputs:
  --in          Path to current evaluation JSON
  --baseline    Path to saved baseline JSON
  --fail-on-new Exit 3 when new findings detected (default: true)

Exit Codes:
  0    No new findings (or --fail-on-new=false)
  2    Input error (missing or invalid files)
  3    New findings detected (when --fail-on-new is true)
  4    Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--baseline` | string | Path to baseline JSON (required) |
| `--fail-on-new` | bool | Return exit code 3 when new findings are detected (default: `true`) |
| `--in` | string | Path to evaluation JSON (required) |

## Examples

```bash
stave ci baseline check --in output/evaluation.json --baseline output/baseline.json
  stave ci baseline check --in output/evaluation.json --baseline output/baseline.json --fail-on-new=false
```
