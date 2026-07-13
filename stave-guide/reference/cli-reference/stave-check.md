---
title: "stave check"
sidebar_label: "check"
sidebar_position: 31
description: "Compare before/after evaluations to check remediation"
---

# stave check

Compare before/after evaluations to check remediation

## Usage

```
stave check [flags]
```

## Description

Compare before/after evaluations to check whether remediation resolved findings.

Verify runs the same controls against two sets of observations (before and after
remediation) and reports which findings were resolved, which remain, and which
are newly introduced. Use it after applying fixes to confirm that violations
have been addressed without introducing regressions.

Inputs:
  --before, -b             Path to before-remediation observations (required)
  --after, -a              Path to after-remediation observations (required)
  --controls, -i           Path to control definitions directory (default: controls)
  --max-unsafe             Maximum allowed unsafe duration
  --eval-time                    Evaluation reference timestamp (RFC3339) for deterministic output

Outputs:
  stdout                   Verification report JSON showing resolved, remaining,
                           and introduced findings
  stderr                   Error messages (if any)

Exit Codes:
  0   - All findings resolved; no remaining or introduced violations
  3   - Remaining or introduced violations exist
  130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-a, --after` | string | Path to after-remediation observations (required) |
| `-b, --before` | string | Path to before-remediation observations (required) |
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `--eval-time` | string | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock. |
| `--max-unsafe` | string | Maximum allowed unsafe duration Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in. |

## Examples

```bash
# Compare before/after observations
  stave check --before ./obs-before --after ./obs-after --controls ./controls

  # Deterministic output for CI
  stave check --before ./obs-before --after ./obs-after --controls ./controls \
    --eval-time 2026-01-15T00:00:00Z

  # With a custom unsafe duration threshold
  stave check --before ./obs-before --after ./obs-after --controls ./controls \
    --max-unsafe 72h
```
