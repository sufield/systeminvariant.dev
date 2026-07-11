# stave config show

Show effective project configuration and value sources

## Usage[​](#usage "Direct link to Usage")

```
stave config show
```

## Description[​](#description "Direct link to Description")

Show prints the effective configuration values used by Stave and where each value came from (environment variable, stave.yaml, user config, or built-in default).

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples[​](#examples "Direct link to Examples")

```
stave config show --format json
```
