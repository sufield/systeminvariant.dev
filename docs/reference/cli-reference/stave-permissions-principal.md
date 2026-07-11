# stave permissions principal

Resolve permissions for a specific principal ARN

## Usage[​](#usage "Direct link to Usage")

```
stave permissions principal [flags]
```

## Description[​](#description "Direct link to Description")

Resolve and display the net effective permissions for a single IAM principal after all policy layers are applied.

Shows: effective allows, SCP ceiling, permission boundary constraint, role chains, and privilege classification.

Exit Codes: 0 Resolution complete, no critical findings 1 Principal has admin-equivalent or escalation findings 3 Incomplete resolution (snapshot data missing) 4 Internal error

Examples: stave nep principal --snapshot obs.json<br />--principal arn:aws:iam::123456789012:role/data-pipeline

stave nep principal --snapshot obs.json<br />--principal arn:aws:iam::123456789012:role/app<br />--format json --show-chains

## Flags[​](#flags "Direct link to Flags")

| Flag               | Type   | Description                                     |
| ------------------ | ------ | ----------------------------------------------- |
| `--filter-service` | string | filter to a specific service prefix             |
| `-f, --format`     | string | output format: table \| json (default: `table`) |
| `--principal`      | string | principal ARN to resolve (required)             |
| `--show-chains`    | bool   | include role chain detail                       |
| `--show-denied`    | bool   | include denied actions                          |
| `--snapshot`       | string | path to snapshot file (required)                |

## Examples[​](#examples "Direct link to Examples")

```
stave nep principal --snapshot obs.json --principal arn:aws:iam::123:role/app
```
