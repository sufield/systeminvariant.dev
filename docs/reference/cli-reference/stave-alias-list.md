# stave alias list

List all aliases

## Usage[​](#usage "Direct link to Usage")

```
stave alias list [flags]
```

## Description[​](#description "Direct link to Description")

List all defined aliases from user config.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples[​](#examples "Direct link to Examples")

```
stave alias list --format json
```
