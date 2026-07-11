# stave config env list

List supported STAVE\_\* environment variables

## Usage[​](#usage "Direct link to Usage")

```
stave config env list [flags]
```

## Description[​](#description "Direct link to Description")

List prints every supported STAVE\_\* environment variable with its description, category, and current value.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples[​](#examples "Direct link to Examples")

```
stave config env list
```
