# stave config context delete

Delete a context

## Usage[​](#usage "Direct link to Usage")

```
stave config context delete <name>
```

## Description[​](#description "Direct link to Description")

Delete a named context from the user configuration. If the deleted context was active, no context will be selected until you run 'config context use' again.

Exit Codes: 0 Context deleted 2 Input error (unknown context name) 4 Internal error

## Examples[​](#examples "Direct link to Examples")

```
stave config context delete myproject
```
