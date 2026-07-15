# stave config delete

Remove a project config key (reverts to default)

## Usage[​](#usage "Direct link to Usage")

```
stave config delete <key>
```

## Description[​](#description "Direct link to Description")

Delete removes a key from stave.yaml, reverting it to the built-in default. Supported keys match those of 'config set'.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples[​](#examples "Direct link to Examples")

```
stave config delete max_unsafe
```
