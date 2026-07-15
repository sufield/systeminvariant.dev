# stave trend predict

Project compliance readiness achievement date

## Usage[​](#usage "Direct link to Usage")

```
stave trend predict [flags]
```

## Description[​](#description "Direct link to Description")

Predict estimates when a target compliance readiness percentage will be achieved based on historical MTTR and current framework gaps.

Requires at least 2 assessment files to compute trends.

Inputs: --history Directory of out.v0.1 assessment files --files Comma-separated assessment files --profile Compliance framework profile name --target-readiness Target readiness percentage (default: 95) --window Lookback window in days for MTTR computation (default: 90) --format Output format: text or json (default: text)

Exit Codes: 0 Prediction generated 2 Invalid input or insufficient data 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag                 | Type    | Description                                                  |
| -------------------- | ------- | ------------------------------------------------------------ |
| `--files`            | string  | Comma-separated assessment files in chronological order      |
| `-f, --format`       | string  | Output format: text or json (default: `text`)                |
| `--history`          | string  | Directory of out.v0.1 assessment files                       |
| `--profile`          | string  | Compliance framework profile name                            |
| `--target-readiness` | float64 | Target readiness percentage (default: `95`)                  |
| `--window`           | int     | Lookback window in days for MTTR computation (default: `90`) |

## Examples[​](#examples "Direct link to Examples")

```
stave trend predict --history ./assessments/ --target-readiness 95
  stave trend predict --history ./assessments/ --profile pci_dss --format json
```
