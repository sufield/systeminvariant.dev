# stave trend

Analyze compliance posture trends across assessment runs

## Usage[​](#usage "Direct link to Usage")

```
stave trend [flags]
```

## Description[​](#description "Direct link to Description")

Reads a sequence of stave apply output files and computes posture metrics including violation rate, MTTR, severity distribution, attack stage trends, velocity, and improvement projection.

Requires at least 2 assessment files to produce a trend report.

Exit Codes: 0 Trend report generated successfully 2 Invalid input or insufficient data 4 Internal error

Examples: stave trend --history ./assessments/ stave trend --files run1.json,run2.json,run3.json --format json stave trend --history ./assessments/ --window 10

## Flags[​](#flags "Direct link to Flags")

| Flag                | Type   | Description                                                        |
| ------------------- | ------ | ------------------------------------------------------------------ |
| `--compliance`      | string | comma-separated framework profiles for trajectory (hipaa,soc2,...) |
| `--files`           | string | comma-separated assessment files in chronological order            |
| `-f, --format`      | string | output format: table \| json \| openmetrics (default: `table`)     |
| `--history`         | string | directory of out.v0.1 assessment files                             |
| `--min-runs`        | int    | minimum assessment files required (default: `2`)                   |
| `--no-pager`        | bool   | never page output, even on a terminal                              |
| `--regression-only` | bool   | show only regressing teams                                         |
| `--rollup`          | string | aggregate to hierarchy group ID                                    |
| `--team`            | string | filter to specific team ID                                         |
| `--team-manifest`   | string | path to team manifest YAML for per-team metrics                    |
| `--window`          | int    | limit to most recent N assessments (0 = all)                       |

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                               | Description                                                       |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`stave trend forecast`](/docs/reference/cli-reference/stave-trend-forecast.md)       | Project posture score trajectory with SLA breach warnings         |
| [`stave trend oscillation`](/docs/reference/cli-reference/stave-trend-oscillation.md) | Classify violation oscillation patterns across assessment history |
| [`stave trend predict`](/docs/reference/cli-reference/stave-trend-predict.md)         | Project compliance readiness achievement date                     |

## Examples[​](#examples "Direct link to Examples")

```
stave trend --history ./assessments/
  stave trend --history ./assessments/ --format json
```
