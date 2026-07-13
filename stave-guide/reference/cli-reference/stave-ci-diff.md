---
title: "stave ci diff"
sidebar_label: "ci diff"
sidebar_position: 36
description: "Compare two evaluations and report new findings"
---

# stave ci diff

Compare two evaluations and report new findings

## Usage

```
stave ci diff [flags]
```

## Description

Diff compares a current evaluation against a baseline evaluation and
reports newly introduced and resolved findings.

Use this in CI to fail PRs only when new violations are introduced.

Exit Codes:
  0   - Success
  2   - Input error
  3   - New findings detected (with --fail-on-new)
  4   - Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--baseline` | string | Path to baseline evaluation JSON (required) |
| `--current` | string | Path to current evaluation JSON (required) |
| `--fail-on-new` | bool | Return exit code 3 when new findings are detected (default: `true`) |

## Examples

```bash
stave ci diff --current pr-evaluation.json --baseline main-evaluation.json
  stave ci diff --current pr-evaluation.json --baseline main-evaluation.json --fail-on-new
```
