# stave config explain

Explain resolved config values and sources

## Usage[​](#usage "Direct link to Usage")

```
stave config explain
```

## Description[​](#description "Direct link to Description")

Explain is an alias of "stave config show". It prints effective values and their resolution source (flag/env/project/user/default).

Exit Codes: 0 - Success 2 - Input error 4 - Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples[​](#examples "Direct link to Examples")

```
stave config explain max_unsafe
```
