# stave config context show

Show selected context

## Usage[​](#usage "Direct link to Usage")

```
stave config context show [flags]
```

## Description[​](#description "Direct link to Description")

Show the currently active context and its configured paths. Reports how the context was selected (active vs STAVE\_CONTEXT env var).

Exit Codes: 0 Success 2 No context selected 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples[​](#examples "Direct link to Examples")

```
stave config context show
  stave config context show --format json
```
