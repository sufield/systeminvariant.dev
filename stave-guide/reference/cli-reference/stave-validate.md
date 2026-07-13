---
title: "stave validate"
sidebar_label: "validate"
sidebar_position: 160
description: "Validate inputs without evaluation"
---

# stave validate

Validate inputs without evaluation

## Usage

```
stave validate [flags]
```

## Description

Validate controls, observations, and configuration for correctness without evaluation.

Validate checks structural and semantic correctness of all evaluation inputs
before running the full apply pipeline. It catches schema violations, invalid
timestamps, and cross-file inconsistencies early, reducing time spent debugging
failed evaluations.

What it checks:
  - Control schema (id, name, description)
  - Observation schema and timestamps
  - Cross-file consistency and time sanity
  - Duration format and feasibility

Inputs:
  --controls, -i       Path to control definitions (default: controls)
  --observations, -o   Path to observation snapshots (default: observations)
  --in                 Single input file or '-' for stdin
  --kind               Contract kind: control|observation|finding (requires --in)
  --schema-version     Contract schema version override
  --max-unsafe         Maximum allowed unsafe duration
  --eval-time                Evaluation reference timestamp (RFC3339) for deterministic output
  --format, -f         Output format: text or json (default: text)
  --strict             Treat warnings as errors (exit 2)
  --fix-hints          Print remediation hints after issues
  --quiet              Suppress output
  --template           Custom output template

Outputs:
  stdout               Validation report listing issues found (text or JSON)
  stderr               Error messages (if any)

Exit Codes:
  0   - All inputs are valid; no issues found
  2   - Invalid input or validation failure (also used in --strict mode for warnings)
  130 - Interrupted (SIGINT)

Examples:
  # Validate project controls and observations
  stave validate

  # Validate with JSON output
  stave validate --format json

  # Validate a single file from stdin
  cat control.yaml | stave validate --in - --kind control

  # Strict mode: treat warnings as errors
  stave validate --strict

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--assert-recent` | string | Fail if no snapshot newer than this duration (e.g. 48h) |
| `-i, --controls` | string | Path to control definitions (inferred if omitted) (default: `controls`) |
| `--eval-time` | string | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock. |
| `--fix-hints` | bool | Print remediation hints after issues |
| `-f, --format` | string | Output format: text or json (default: `text`) |
| `--in` | string | Single input file or '-' for stdin |
| `--kind` | string | Contract kind: control\|observation\|finding |
| `--max-unsafe` | string | Maximum allowed unsafe duration Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in. |
| `-o, --observations` | string | Path to observation snapshots (inferred if omitted) (default: `observations`) |
| `--schema-version` | string | Contract schema version override |
| `--strict` | bool | Treat warnings as errors (exit 2) |
| `--template` | string | Custom output template |

## Examples

```bash
stave validate --controls controls/s3 --observations observations
```
