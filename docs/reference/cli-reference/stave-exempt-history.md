# stave exempt history

Show full audit trail including expired entries

## Usage[​](#usage "Direct link to Usage")

```
stave exempt history [flags]
```

## Description[​](#description "Direct link to Description")

Show the complete audit trail for all acknowledgments, including expired and revoked entries. Each entry shows its full lifecycle.

Exit Codes: 0 History produced 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                                       |
| -------------- | ------ | ----------------------------------------------------------------- |
| `--file`       | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `-f, --format` | string | output format: table \| json (default: `table`)                   |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt history
  stave exempt history --format json
```
