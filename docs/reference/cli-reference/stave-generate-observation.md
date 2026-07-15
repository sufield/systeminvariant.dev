# stave generate observation

Generate an observation template

## Usage[​](#usage "Direct link to Usage")

```
stave generate observation <name> [flags]
```

## Description[​](#description "Direct link to Description")

Generate observation creates an obs.v0.1 JSON template in observations/.

Exit Codes: 0 - Success 2 - Input error 4 - Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag    | Type   | Description                                    |
| ------- | ------ | ---------------------------------------------- |
| `--out` | string | Output file path (default: observations/.json) |

## Examples[​](#examples "Direct link to Examples")

```
stave generate observation my-obs --out observations/snap.json
```
