# stave export oscal

Export findings as OSCAL 1.1.2 Assessment Results JSON

## Usage[​](#usage "Direct link to Usage")

```
stave export oscal [flags]
```

## Description[​](#description "Direct link to Description")

Convert assessment findings to an OSCAL Assessment Results document for FedRAMP, FISMA, and DoD automated toolchain ingestion.

UUIDs are deterministic (derived from control\_id + asset\_id).

Document types: assessment-results Standard assessment results (default) poam Plan of Action and Milestones ssp System Security Plan (stub)

Exit Codes: 0 Export complete 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag            | Type   | Description                                                                        |
| --------------- | ------ | ---------------------------------------------------------------------------------- |
| `--assessment`  | string | stave apply JSON output (required)                                                 |
| `--system-uuid` | string | system UUID for POA\&M generation                                                  |
| `--type`        | string | OSCAL document type: assessment-results, poam, ssp (default: `assessment-results`) |

## Examples[​](#examples "Direct link to Examples")

```
stave export oscal --assessment findings.json
  stave export oscal --assessment findings.json --type poam --system-uuid abc-123
```
