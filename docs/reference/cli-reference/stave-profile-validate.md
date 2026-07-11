# stave profile validate

Validate a profile file

## Usage[​](#usage "Direct link to Usage")

```
stave profile validate [flags]
```

## Description[​](#description "Direct link to Description")

Check a custom compliance profile YAML for correctness: required fields present, referenced control IDs exist in the catalog.

Exit Codes: 0 Valid 1 Errors found 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag     | Type   | Description                  |
| -------- | ------ | ---------------------------- |
| `--file` | string | profile YAML file (required) |

## Examples[​](#examples "Direct link to Examples")

```
stave profile validate --file profiles/my-policy.yaml
```
