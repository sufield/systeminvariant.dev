# stave exempt upcoming

Show acceptances approaching expiry

## Usage[​](#usage "Direct link to Usage")

```
stave exempt upcoming [flags]
```

## Description[​](#description "Direct link to Description")

Show acknowledgments with expiry dates within the specified look-ahead window.

Exit Codes: 0 Report produced 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag     | Type   | Description                                                       |
| -------- | ------ | ----------------------------------------------------------------- |
| `--days` | int    | look-ahead window in days (default: `30`)                         |
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt upcoming --days 30
```
