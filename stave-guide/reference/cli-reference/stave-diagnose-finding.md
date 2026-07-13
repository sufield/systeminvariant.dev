---
title: "stave diagnose finding"
sidebar_label: "diagnose finding"
sidebar_position: 69
description: "Deep-dive analysis of a single finding"
---

# stave diagnose finding

Deep-dive analysis of a single finding

## Usage

```
stave diagnose finding [flags]
```

## Description

Finding generates a detailed root-cause analysis for a specific control/asset
violation. It shows control metadata, predicate evaluation trace, evidence,
remediation guidance, and next steps.

Inputs:
  --control-id     Control ID to inspect (required)
  --asset-id       Asset ID to inspect (required)
  --controls       Directory containing YAML control definitions
  --observations   Directory containing JSON observation snapshots
  --previous-output  Optional path to existing apply output JSON

Outputs:
  stdout           Finding detail (text or JSON with --format json)

Exit Codes:
  0   - Finding detail rendered successfully
  2   - Invalid input or error
  3   - Violation confirmed

Examples:
  # Deep dive into a specific finding
  stave diagnose finding \
    --control-id CTL.S3.PUBLIC.001 \
    --asset-id res:aws:s3:bucket:my-bucket \
    --controls ./controls --observations ./obs

  # Using existing evaluation output
  stave diagnose finding \
    --control-id CTL.S3.PUBLIC.001 \
    --asset-id res:aws:s3:bucket:my-bucket \
    --previous-output output/evaluation.json \
    --controls ./controls --observations ./obs

  # JSON output for scripting
  stave diagnose finding \
    --control-id CTL.S3.PUBLIC.001 \
    --asset-id res:aws:s3:bucket:my-bucket \
    --controls ./controls --observations ./obs \
    --format json

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--asset-id` | string | Asset ID to inspect (required) |
| `--control-id` | string | Control ID to inspect (required) |
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `--eval-time` | string | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock. |
| `-f, --format` | string | Output format: text or json (default: `text`) |
| `--max-unsafe` | string | Maximum allowed unsafe duration Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in. |
| `-o, --observations` | string | Path to observation snapshots directory (default: `observations`) |
| `-p, --previous-output` | string | Path to existing apply output JSON |
| `--template` | string | Template string for custom output formatting |

## Examples

```bash
stave diagnose finding --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket \
    --controls ./controls --observations ./obs
```
