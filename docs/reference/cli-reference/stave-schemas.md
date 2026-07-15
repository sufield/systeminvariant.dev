# stave schemas

List all contract schemas

## Usage[​](#usage "Direct link to Usage")

```
stave schemas [flags]
```

## Description[​](#description "Direct link to Description")

Schemas lists every wire-format contract schema that this version of Stave reads or writes, grouped by category.

Exit Codes: 0 - Success 4 - Internal error

Examples:

# List all schemas

stave schemas

# JSON output

stave schemas --format json

# Pipe to jq

stave schemas --format json | jq '.data'

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag       | Type   | Description                                  |
| ---------- | ------ | -------------------------------------------- |
| `--format` | string | Output format (text, json) (default: `text`) |

## Examples[​](#examples "Direct link to Examples")

```
stave schemas
```
