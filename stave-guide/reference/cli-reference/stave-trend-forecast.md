---
title: "stave trend forecast"
sidebar_label: "trend forecast"
sidebar_position: 157
description: "Project posture score trajectory with SLA breach warnings"
---

# stave trend forecast

Project posture score trajectory with SLA breach warnings

## Usage

```
stave trend forecast [flags]
```

## Description

Forecast computes a linear trend over daily posture scores and
projects the score forward over the specified horizon. When an
SLA profile is provided, annotates each severity with ON_TRACK,
AT_RISK, or BREACHING status based on MTTR trajectory.

Requires at least 7 assessment files for a meaningful trend.

Inputs:
  --history            Directory of out.v0.1 assessment files
  --files              Comma-separated assessment files
  --horizon            Forecast horizon in days (default: 90)
  --sla-profile        Path to SLA policy YAML (enables SLA status)
  --format             Output format: table or json (default: table)

Exit Codes:
  0   Forecast generated
  2   Invalid input or insufficient data

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--files` | string | comma-separated assessment files |
| `-f, --format` | string | output format: table \| json (default: `table`) |
| `--history` | string | directory of assessment JSON files |
| `--horizon` | int | forecast horizon in days (default: `90`) |
| `--sla-profile` | string | path to SLA policy YAML |

## Examples

```bash
stave trend forecast --history ./assessments/ --horizon 90
  stave trend forecast --history ./assessments/ --sla-profile sla.yaml --format json
```
