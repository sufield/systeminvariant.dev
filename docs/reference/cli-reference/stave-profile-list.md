# stave profile list

List available compliance profiles

## Usage[​](#usage "Direct link to Usage")

```
stave profile list [flags]
```

## Description[​](#description "Direct link to Description")

Show all built-in profiles and any custom profiles found in the specified directory.

Exit Codes: 0 Profiles listed

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                            |
| ---------------- | ------ | -------------------------------------- |
| `--profiles-dir` | string | directory of custom profile YAML files |

## Examples[​](#examples "Direct link to Examples")

```
stave profile list --profiles-dir ./profiles/
```
