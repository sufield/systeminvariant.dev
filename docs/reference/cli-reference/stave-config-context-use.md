# stave config context use

Set active context

## Usage[​](#usage "Direct link to Usage")

```
stave config context use <name>
```

## Description[​](#description "Direct link to Description")

Set the active context. Subsequent commands use this context's default paths unless overridden by flags. Override with STAVE\_CONTEXT env var.

Exit Codes: 0 Context activated 2 Input error (unknown context name) 4 Internal error

## Examples[​](#examples "Direct link to Examples")

```
stave config context use myproject
```
