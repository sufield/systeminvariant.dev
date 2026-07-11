# stave compare

Compare compliance posture between two frameworks

## Usage[​](#usage "Direct link to Usage")

```
stave compare [flags]
```

## Description[​](#description "Direct link to Description")

Analyze the gap between a baseline framework (e.g. HIPAA) and a target framework (e.g. FedRAMP Moderate). Identifies shared violations (fix once, satisfy both), marginal work (target-only), and free coverage (already passing).

Answers: "What is the marginal cost to adopt framework B given we already comply with framework A?"

Inputs: --from STRING Baseline framework key (required) --to STRING Target framework key (required) --assessment PATH stave apply JSON output (required) --format STRING table (default) | json | markdown

Framework keys: hipaa, nist\_800\_53\_r5, fedramp\_moderate, soc2, pci\_dss\_v4.0, cis\_aws\_v3.0, gdpr, iso\_27001\_2022

Exit Codes: 0 Gap analysis produced 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                                 |
| -------------- | ------ | ----------------------------------------------------------- |
| `--after`      | string | After assessment path (--mode remediation)                  |
| `--assessment` | string | stave apply JSON output (required)                          |
| `--before`     | string | Before assessment path (--mode remediation)                 |
| `-f, --format` | string | output format: table \| json \| markdown (default: `table`) |
| `--from`       | string | baseline framework key (required)                           |
| `--mode`       | string | Comparison mode: remediation                                |
| `--simulated`  | string | Simulated output for efficiency comparison                  |
| `--to`         | string | target framework key (required)                             |

## Examples[​](#examples "Direct link to Examples")

```
stave compare --from hipaa --to fedramp_moderate \
    --assessment findings.json

  stave compare --from hipaa --to soc2 \
    --assessment findings.json --format markdown
```
