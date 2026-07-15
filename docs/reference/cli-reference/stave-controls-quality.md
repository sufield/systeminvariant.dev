# stave controls quality

Analyze control catalog metadata completeness and coverage gaps

## Usage[​](#usage "Direct link to Usage")

```
stave controls quality [flags]
```

## Description[​](#description "Direct link to Description")

Evaluate control catalog quality by checking metadata completeness (severity, remediation action, attack stage, compliance mappings), identifying blind spots where observed asset types lack controls, and detecting MITRE ATT\&CK stage coverage gaps.

Inputs: --controls Path to control definitions directory --snapshot Path to observation snapshot for blind spot detection --format Output format: table or json (default: table) --min-completeness Minimum overall completeness percentage (exit 1 if below)

Exit Codes: 0 Quality report generated 1 Completeness below --min-completeness threshold 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag                 | Type    | Description                                                 |
| -------------------- | ------- | ----------------------------------------------------------- |
| `-i, --controls`     | string  | Path to control definitions directory (default: `controls`) |
| `-f, --format`       | string  | Output format: table or json (default: `table`)             |
| `--min-completeness` | float64 | Minimum overall completeness percentage (exit 1 if below)   |
| `--snapshot`         | string  | Path to observation snapshot for blind spot detection       |

## Examples[​](#examples "Direct link to Examples")

```
stave controls quality --controls controls/s3
  stave controls quality --controls controls/ --snapshot observations/latest.json
  stave controls quality --controls controls/ --min-completeness 80 --format json
```
