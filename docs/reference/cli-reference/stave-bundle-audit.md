# stave bundle audit

Assemble a compliance-period evidence package

## Usage[​](#usage "Direct link to Usage")

```
stave bundle audit [flags]
```

## Description[​](#description "Direct link to Description")

Package all evidence components for a specific compliance framework and time period into a named directory with a SHA-256 manifest.

Components: assessment results, executive report, continuity attestation, remediation trend, and exemption register.

Inputs: --framework Compliance framework (hipaa, soc2, fedramp, pci\_dss) --period Period shorthand (Q1-2026, Q4-2025) --from / --to Explicit date range (ISO 8601) --history Directory of assessment JSON files --exempt Path to acknowledgments YAML (optional) --out Output directory (created if not exists) --dry-run Show what would be collected without writing

Exit Codes: 0 Package assembled 2 Invalid input

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag          | Type   | Description                                   |
| ------------- | ------ | --------------------------------------------- |
| `--dry-run`   | bool   | show what would be collected                  |
| `--exempt`    | string | path to acknowledgments YAML                  |
| `--framework` | string | compliance framework (required)               |
| `--from`      | string | period start date (ISO 8601)                  |
| `--history`   | string | directory of assessment JSON files (required) |
| `--out`       | string | output directory (required unless --dry-run)  |
| `--period`    | string | period shorthand (e.g. Q1-2026)               |
| `--to`        | string | period end date (ISO 8601)                    |

## Examples[​](#examples "Direct link to Examples")

```
stave bundle audit --framework hipaa --period Q1-2026 --history ./assessments/ --out ./audit/
  stave bundle audit --framework soc2 --from 2025-01-01 --to 2025-12-31 --history ./assessments/
  stave bundle audit --framework hipaa --period Q1-2026 --history ./assessments/ --dry-run
```
