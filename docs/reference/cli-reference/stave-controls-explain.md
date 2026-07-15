# stave controls explain

Explain a specific control

## Usage[​](#usage "Direct link to Usage")

```
stave controls explain <control-id> [flags]
```

## Description[​](#description "Direct link to Description")

Explain loads one control and prints matched fields, rule expectations, and a minimal observation snippet.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                                 |
| ------------ | ------ | ----------------------------------------------------------- |
| `--controls` | string | Path to control definitions directory (default: `controls`) |

## Examples[​](#examples "Direct link to Examples")

```
stave controls explain CTL.S3.PUBLIC.001 --controls controls/s3
```
