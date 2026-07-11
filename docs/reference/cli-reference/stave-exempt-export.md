# stave exempt export

Export risk register as OSCAL POA\&M

## Usage[​](#usage "Direct link to Usage")

```
stave exempt export [flags]
```

## Description[​](#description "Direct link to Description")

Export acknowledgments and open findings as an OSCAL Plan of Action and Milestones (POA\&M) document for FedRAMP, HIPAA, and SOC2 submissions.

Exit Codes: 0 Export complete 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag            | Type   | Description                                                                |
| --------------- | ------ | -------------------------------------------------------------------------- |
| `--assessor`    | string | assessor name (default: `Stave automated assessment`)                      |
| `--file`        | string | path to acknowledgment YAML file (default: `./stave-acknowledgments.yaml`) |
| `-f, --format`  | string | output format: oscal-poam (default: `oscal-poam`)                          |
| `--output`      | string | path to out.v0.1.json for open findings                                    |
| `--system-uuid` | string | UUID of the System Security Plan                                           |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt export --format oscal-poam --system-uuid <uuid>
  stave exempt export --format oscal-poam --output assessment.json
```
