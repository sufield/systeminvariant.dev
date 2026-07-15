# stave export compliance

Export compliance evidence package

## Usage[​](#usage "Direct link to Usage")

```
stave export compliance [flags]
```

## Description[​](#description "Direct link to Description")

Evaluate a snapshot against a compliance framework profile and export a structured evidence package as JSON.

Runs the full assessment pipeline with evidence generation, evaluates the requested compliance profile, and produces a requirement-centric evidence package with per-requirement scores, gaps, and reasoning traces.

Supported profiles: hipaa HIPAA Security Rule soc2 SOC 2 Trust Service Criteria pci\_dss\_v4.0 PCI-DSS v4.0 fedramp\_moderate FedRAMP Moderate (NIST 800-53 Rev 5) cis\_aws\_v3.0 CIS AWS Foundations Benchmark v3.0

Exit Codes: 0 All required requirements satisfied 1 One or more required requirements failed 2 Invalid input (bad profile ID, missing snapshot) 4 Internal error

Examples: stave export compliance --snapshot obs.json --profile hipaa

stave export compliance --snapshot obs.json --profile soc2<br />--include-pass

stave export compliance --snapshot obs.json --profile pci\_dss\_v4.0<br />--min-severity high

## Flags[​](#flags "Direct link to Flags")

| Flag                | Type        | Description                                                                |
| ------------------- | ----------- | -------------------------------------------------------------------------- |
| `--assessment-uuid` | string      | UUID for this assessment result (for OSCAL)                                |
| `--assessor`        | string      | assessor name (for OSCAL) (default: `Stave automated assessment`)          |
| `--composite`       | bool        | force composite report even for single framework                           |
| `-f, --format`      | string      | output format: json \| table \| markdown (default: `json`)                 |
| `--include-pass`    | bool        | include passing evidence records                                           |
| `--min-severity`    | string      | minimum severity filter: critical\|high\|medium\|low\|all (default: `all`) |
| `--profile`         | string      | compliance profile ID (required)                                           |
| `--profile-file`    | stringSlice | path to custom profile YAML (can be repeated)                              |
| `--snapshot`        | string      | path to snapshot file (required)                                           |
| `--system-uuid`     | string      | UUID of the System Security Plan (for eMASS/OSCAL)                         |
| `--verbose`         | bool        | include reasoning traces in table output                                   |

## Examples[​](#examples "Direct link to Examples")

```
stave export compliance --snapshot obs.json --profile hipaa
  stave export compliance --snapshot obs.json --profile soc2
```
