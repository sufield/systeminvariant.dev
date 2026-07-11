# stave exempt validate

Validate the acceptance file

## Usage[​](#usage "Direct link to Usage")

```
stave exempt validate [flags]
```

## Description[​](#description "Direct link to Description")

Validate the acceptance file for required fields, date formats, and structural correctness.

Exit Codes: 0 Validation passed 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag     | Type   | Description                                                       |
| -------- | ------ | ----------------------------------------------------------------- |
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt validate --file ./stave-acknowledgments.yaml
```
