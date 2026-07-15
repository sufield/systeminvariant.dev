# stave config set

Set a project config value in stave.yaml

## Usage[​](#usage "Direct link to Usage")

```
stave config set <key> <value>
```

## Description[​](#description "Direct link to Description")

Set updates stave.yaml in the nearest project root, or creates one in the current directory if none exists.

Supported keys: max\_unsafe snapshot\_retention default\_retention\_tier ci\_failure\_policy capture\_cadence snapshot\_filename\_template snapshot\_retention\_tiers.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples[​](#examples "Direct link to Examples")

```
stave config set max_unsafe 72h
```
