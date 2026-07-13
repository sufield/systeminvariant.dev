---
title: "stave metrics"
sidebar_label: "metrics"
sidebar_position: 125
description: "Write Prometheus scrape file for node_exporter"
---

# stave metrics

Write Prometheus scrape file for node_exporter

## Usage

```
stave metrics [flags]
```

## Description

Produce a stable Prometheus text format metrics file covering
posture score, findings by severity, SLA burn rates, chain
activations, and per-team metrics.

Designed for the node_exporter textfile collector. Run on a
schedule via cron to maintain continuous monitoring.

Inputs:
  --history DIR         Directory of assessment JSON files (required)
  --out PATH            Output .prom file path (required)

Exit Codes:
  0   Metrics written
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--history` | string | directory of assessment JSON files (required) |
| `--out` | string | output .prom file path (required) |

## Examples

```bash
stave metrics --history ./history --out /var/lib/node_exporter/stave.prom
  stave metrics --history ./history --out stave.prom
```
