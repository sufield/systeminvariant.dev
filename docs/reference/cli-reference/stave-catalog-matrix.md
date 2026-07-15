# stave catalog matrix

Show taxonomy × service cross-product with gap cells

## Usage[​](#usage "Direct link to Usage")

```
stave catalog matrix [flags]
```

## Description[​](#description "Direct link to Description")

Matrix builds the taxonomy × service cross-product from the control catalog. Each row is a taxonomy category; columns show how many services and controls use that category. Gap cells highlight services where a widely-used category has zero controls.

Inputs: --format F text (default) | json --controls DIR Control catalog directory (default: controls)

Output: Summary table: CATEGORY | SERVICES | CONTROLS Gap cells: (category, service) pairs missing coverage

Exit codes: 0 Success 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                     |
| ---------------- | ------ | ----------------------------------------------- |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format`   | string | output format: text \| json (default: `text`)   |

## Examples[​](#examples "Direct link to Examples")

```
stave catalog matrix
  stave catalog matrix --format json | jq '.gaps'
```
