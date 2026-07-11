# stave trend oscillation

Classify violation oscillation patterns across assessment history

## Usage[​](#usage "Direct link to Usage")

```
stave trend oscillation [flags]
```

## Description[​](#description "Direct link to Description")

Classify control-asset pairs into oscillation patterns (chronic, deploy-time, or random) by analyzing state transitions across a sequence of assessment files.

Chronic patterns indicate persistent violations (>80%% failure rate). Deploy-time patterns indicate violations that toggle with deployments. Random patterns indicate no discernible oscillation pattern.

Inputs: --history Directory of out.v0.1 assessment files --files Comma-separated assessment files --min-oscillations Minimum state transitions for deploy-time (default: 3) --format Output format: table or json (default: table)

Exit Codes: 0 Analysis complete 2 Invalid input or insufficient data

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag                 | Type   | Description                                                             |
| -------------------- | ------ | ----------------------------------------------------------------------- |
| `--files`            | string | Comma-separated assessment files in chronological order                 |
| `-f, --format`       | string | Output format: table or json (default: `table`)                         |
| `--history`          | string | Directory of out.v0.1 assessment files                                  |
| `--min-oscillations` | int    | Minimum state transitions for deploy-time classification (default: `3`) |

## Examples[​](#examples "Direct link to Examples")

```
stave trend oscillation --history ./assessments/
  stave trend oscillation --history ./assessments/ --min-oscillations 5
  stave trend oscillation --history ./assessments/ --format json
```
