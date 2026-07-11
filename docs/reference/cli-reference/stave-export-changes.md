# stave export changes

Export remediation property changes from assessment findings

## Usage[​](#usage "Direct link to Usage")

```
stave export changes [flags]
```

## Description[​](#description "Direct link to Description")

Extract remediation property changes from assessment findings into a structured format for external tooling (Terraform, CloudFormation, etc.).

Each change includes the control ID, asset ID, property path, current value, and required value. Stave provides the data; external tools generate vendor-specific scripts.

Exit Codes: 0 Export complete 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag               | Type    | Description                              |
| ------------------ | ------- | ---------------------------------------- |
| `--assessment`     | string  | stave apply JSON output (required)       |
| `--min-confidence` | float64 | minimum remediation confidence (0.0-1.0) |

## Examples[​](#examples "Direct link to Examples")

```
stave export changes --assessment findings.json
  stave export changes --assessment findings.json --min-confidence 0.8
```
