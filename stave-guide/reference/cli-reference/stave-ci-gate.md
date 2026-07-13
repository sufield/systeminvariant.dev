---
title: "stave ci gate"
sidebar_label: "ci gate"
sidebar_position: 39
description: "Enforce CI failure policy modes from config or flags"
---

# stave ci gate

Enforce CI failure policy modes from config or flags

## Usage

```
stave ci gate [flags]
```

## Description

Gate applies a CI failure policy and returns exit code 3 when the policy fails.

Supported policies:
  - fail_on_any_violation
  - fail_on_new_violation
  - fail_on_overdue_upcoming

Inputs:
  --policy          CI failure policy mode (default: from project config)
  --in              Path to evaluation JSON (required for fail_on_any/new)
  --baseline        Path to baseline JSON (required for fail_on_new_violation)
  --controls, -i    Path to control definitions directory (used by fail_on_overdue_upcoming)
  --observations, -o Path to observation snapshots directory (used by fail_on_overdue_upcoming)
  --max-unsafe      Maximum allowed unsafe duration (used by fail_on_overdue_upcoming)
  --eval-time             Reference time (RFC3339). If omitted, uses wall clock
  --format, -f      Output format: text or json (default: text)

Outputs:
  stdout            Gate result summary (text or JSON)
  stderr            Error messages (if any)

Exit Codes:
  0   - Policy passed; no violations detected
  2   - Invalid input or configuration error
  3   - Policy failed; violations detected
  130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--baseline` | string | Path to baseline JSON (required for fail_on_new_violation) (default: `output/baseline.json`) |
| `-i, --controls` | string | Path to control definitions directory (used by fail_on_overdue_upcoming) (default: `controls`) |
| `--eval-time` | string | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock. |
| `-f, --format` | string | Output format: text or json (default: `text`) |
| `--in` | string | Path to evaluation JSON (required for fail_on_any_violation and fail_on_new_violation) (default: `output/evaluation.json`) |
| `--max-unsafe` | string | Maximum allowed unsafe duration (used by fail_on_overdue_upcoming) Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in. |
| `-o, --observations` | string | Path to observation snapshots directory (used by fail_on_overdue_upcoming) (default: `observations`) |
| `--policy` | string | CI failure policy mode: fail_on_any_violation, fail_on_new_violation, fail_on_overdue_upcoming Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in. |
| `--team` | string | Filter gate to findings owned by this team |
| `--team-manifest` | string | Team manifest YAML for ownership routing |

## Examples

```bash
# Fail on any findings in evaluation output
  stave ci gate --policy fail_on_any_violation --in output/evaluation.json

  # Fail only on newly introduced findings
  stave ci gate --policy fail_on_new_violation --in output/evaluation.json --baseline output/baseline.json

  # Fail when any upcoming action is already overdue
  stave ci gate --policy fail_on_overdue_upcoming --controls ./controls --observations ./observations
```
