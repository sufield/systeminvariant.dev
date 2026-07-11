# stave score

Compute security posture score (0-100)

## Usage[​](#usage "Direct link to Usage")

```
stave score [flags]
```

## Description[​](#description "Direct link to Description")

Compute a normalized 0-100 security posture score from assessment output. The score is a weighted combination of severity distribution, SLA compliance, chain activity, and framework coverage.

Inputs: --output PATH Path to a single out.v0.1.json assessment file --history DIR Directory of out.v0.1.json files for score trend --compliance LIST Comma-separated compliance profile names for coverage --sla-profile NAME SLA profile name for SLA component scoring --weights STRING Override default weights (severity=0.45,sla=0.25, chain=0.20,coverage=0.10) --format FORMAT Output format: table (default) | json | openmetrics

Outputs: stdout Score report in the selected format

Exit Codes: 0 Score computed 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag            | Type   | Description                                                    |
| --------------- | ------ | -------------------------------------------------------------- |
| `--compliance`  | string | comma-separated compliance profiles for coverage               |
| `-f, --format`  | string | output format: table \| json \| openmetrics (default: `table`) |
| `--history`     | string | directory of out.v0.1.json files for trend                     |
| `--output`      | string | path to out.v0.1.json assessment file                          |
| `--sla-profile` | string | SLA profile name for SLA scoring                               |
| `--weights`     | string | override weights (severity=N,sla=N,chain=N,coverage=N)         |

## Examples[​](#examples "Direct link to Examples")

```
# Current score from assessment output
  stave score --output assessment.json

  # Score with compliance coverage
  stave score --output assessment.json --compliance hipaa

  # Score trend over history
  stave score --history ./assessments/ --compliance hipaa

  # JSON output for automation
  stave score --output assessment.json --format json

  # OpenMetrics for Prometheus scraping
  stave score --output assessment.json --format openmetrics

  # Custom weights
  stave score --output assessment.json --weights severity=0.60,sla=0.20,chain=0.15,coverage=0.05
```
