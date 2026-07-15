# stave metrics

Write Prometheus scrape file for node\_exporter

## Usage[​](#usage "Direct link to Usage")

```
stave metrics [flags]
```

## Description[​](#description "Direct link to Description")

Produce a stable Prometheus text format metrics file covering posture score, findings by severity, SLA burn rates, chain activations, and per-team metrics.

Designed for the node\_exporter textfile collector. Run on a schedule via cron to maintain continuous monitoring.

Inputs: --history DIR Directory of assessment JSON files (required) --out PATH Output .prom file path (required)

Exit Codes: 0 Metrics written 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag        | Type   | Description                                   |
| ----------- | ------ | --------------------------------------------- |
| `--history` | string | directory of assessment JSON files (required) |
| `--out`     | string | output .prom file path (required)             |

## Examples[​](#examples "Direct link to Examples")

```
stave metrics --history ./history --out /var/lib/node_exporter/stave.prom
  stave metrics --history ./history --out stave.prom
```
