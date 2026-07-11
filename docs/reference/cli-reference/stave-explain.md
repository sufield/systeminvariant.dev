# stave explain

Explain how a control evaluates and which fields it needs

## Usage[​](#usage "Direct link to Usage")

```
stave explain <control-id> [flags]
```

## Description[​](#description "Direct link to Description")

Explain loads a single control and prints:

* matched field paths used by predicates
* operator/value expectations
* a minimal obs.v0.1 snippet you can start from

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                                 |
| -------------- | ------ | ----------------------------------------------------------- |
| `--controls`   | string | Path to control definitions directory (default: `controls`) |
| `-f, --format` | string | Output format: text or json (default: `text`)               |

## Examples[​](#examples "Direct link to Examples")

```
stave explain --controls controls/s3 --format json
```
