# stave config context list

List available contexts

## Usage[​](#usage "Direct link to Usage")

```
stave config context list [flags]
```

## Description[​](#description "Direct link to Description")

List all named contexts stored in the user configuration.

Exit Codes: 0 Success 2 Input error 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples[​](#examples "Direct link to Examples")

```
stave config context list
  stave config context list --format json
```
