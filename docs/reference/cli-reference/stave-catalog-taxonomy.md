# stave catalog taxonomy

List taxonomy categories with control counts

## Usage[​](#usage "Direct link to Usage")

```
stave catalog taxonomy [flags]
```

## Description[​](#description "Direct link to Description")

Taxonomy lists all security concept categories found in the control catalog, with the number of controls tagged in each category.

Inputs: --format F text (default) | json --controls DIR Control catalog directory (default: controls)

Exit codes: 0 Success 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                     |
| ---------------- | ------ | ----------------------------------------------- |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format`   | string | output format: text \| json (default: `text`)   |

## Examples[​](#examples "Direct link to Examples")

```
stave catalog taxonomy
  stave catalog taxonomy --format json | jq '.[] | select(.count > 100)'
```
