---
title: "stave ci fix-loop"
sidebar_label: "ci fix-loop"
sidebar_position: 38
description: "Run apply-before/apply-after/verify in one command"
---

# stave ci fix-loop

Run apply-before/apply-after/verify in one command

## Usage

```
stave ci fix-loop [flags]
```

## Description

Fix-loop executes the remediation verification lifecycle in one run:
apply before state, apply after state, compare findings, and emit a
remediation report suitable for CI/CD.

Input:
  --before      Directory containing before-remediation observations
  --after       Directory containing after-remediation observations
  --controls  Directory containing control definitions

Output:
  stdout  remediation report JSON
  --out   writes evaluation.before.json, evaluation.after.json,
          verification.json, remediation-report.json

Exit Codes:
  0   - No remaining or introduced violations
  3   - Remaining or introduced violations exist

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-a, --after` | string | Path to after-remediation observations (required) |
| `-b, --before` | string | Path to before-remediation observations (required) |
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `--eval-time` | string | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock. |
| `--max-unsafe` | string | Maximum allowed unsafe duration Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in. |
| `--out` | string | Write remediation artifacts to this directory |

## Examples

```bash
# Run a full fix-loop comparing before and after observations
  stave ci fix-loop --before ./obs-before --after ./obs-after --controls ./controls --out ./output --eval-time 2026-01-11T00:00:00Z

  # Run in CI with a strict 72-hour threshold
  stave ci fix-loop --before ./obs-before --after ./obs-after --controls ./controls --out ./output --max-unsafe 72h --eval-time 2026-01-11T00:00:00Z

  # Inspect the remediation report
  cat ./output/remediation-report.json | jq '.summary'
```
