# stave catalog stats

Print aggregate catalog statistics

## Usage[​](#usage "Direct link to Usage")

```
stave catalog stats [flags]
```

## Description[​](#description "Direct link to Description")

Stats computes aggregate counts from the control catalog: total controls, services, chains, operational features, severity breakdown, and a per-service summary table.

Inputs: --format F text (default) | json --controls DIR Control catalog directory (default: controls) --chains DIR Chain catalog directory (default: chains)

Exit codes: 0 Success 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                     |
| ---------------- | ------ | ----------------------------------------------- |
| `--chains`       | string | chain catalog directory (default: `chains`)     |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format`   | string | output format: text \| json (default: `text`)   |

## Examples[​](#examples "Direct link to Examples")

```
stave catalog stats
  stave catalog stats --format json | jq '.severity'
```
