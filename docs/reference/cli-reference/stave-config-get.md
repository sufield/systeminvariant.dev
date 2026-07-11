# stave config get

Get a config value

## Usage[​](#usage "Direct link to Usage")

```
stave config get <key>
```

## Description[​](#description "Direct link to Description")

Get prints a config value.

Supported keys: max\_unsafe snapshot\_retention default\_retention\_tier ci\_failure\_policy capture\_cadence snapshot\_filename\_template snapshot\_retention\_tiers.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples[​](#examples "Direct link to Examples")

```
stave config get max_unsafe
```
