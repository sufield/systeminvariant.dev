# stave capabilities catalog coverage

Show per-service control coverage

## Usage[​](#usage "Direct link to Usage")

```
stave capabilities catalog coverage [flags]
```

## Description[​](#description "Direct link to Description")

Coverage maps the catalog against services, showing how many controls and categories each service has and which asset types they apply to.

Inputs: --format F text (default) | json --controls DIR Control catalog directory (default: controls)

Exit codes: 0 Success 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                     |
| ---------------- | ------ | ----------------------------------------------- |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format`   | string | output format: text \| json (default: `text`)   |

## Examples[​](#examples "Direct link to Examples")

```
stave catalog coverage
  stave catalog coverage --format json | jq '.services[] | select(.controls > 10)'
```
