# stave report

Generate executive security posture report

## Usage[​](#usage "Direct link to Usage")

```
stave report [flags]
```

## Description[​](#description "Direct link to Description")

Aggregate all assessment dimensions into a single structured report document: posture score, findings summary, SLA compliance, top findings, active chains, ATT\&CK coverage, framework readiness, team attribution, and executive summary.

Consumers render the report however needed — Jinja template, Python script, Pandoc, or direct API consumption.

Inputs: --history PATH History directory (required) --snapshot PATH Snapshot to assess (required) --sla-profile-file PATH SLA policy --team-manifest PATH Team manifest --format STRING json (default) | markdown --title STRING Report title --period STRING Reporting period label

Exit Codes: 0 Report generated 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag                 | Type   | Description                                       |
| -------------------- | ------ | ------------------------------------------------- |
| `--chains`           | string | chains directory (default: `chains`)              |
| `-i, --controls`     | string | controls directory (default: `controls`)          |
| `-f, --format`       | string | output format: json \| markdown (default: `json`) |
| `--history`          | string | history directory (required)                      |
| `--period`           | string | reporting period label                            |
| `--sla-profile-file` | string | SLA policy file                                   |
| `--snapshot`         | string | snapshot to assess (required)                     |
| `--team-breakdown`   | bool   | Include per-team findings breakdown in report     |
| `--team-manifest`    | string | team manifest                                     |
| `--title`            | string | report title (default: `Security Posture Report`) |

## Examples[​](#examples "Direct link to Examples")

```
stave report --history ./history --snapshot latest.json
  stave report --history ./history --snapshot latest.json \
    --sla-profile-file sla.yaml --team-manifest teams.yaml \
    --format markdown > report.md
```
