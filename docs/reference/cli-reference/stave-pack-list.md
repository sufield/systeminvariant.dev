# stave pack list

List available concern packs and their control counts

## Usage[​](#usage "Direct link to Usage")

```
stave pack list [flags]
```

## Description[​](#description "Direct link to Description")

List the available concern packs and how many controls each resolves to from the active catalog.

A concern pack is a named, cross-cutting grouping of controls (e.g. "entropy", "quick"). Use a pack name with "stave pack show " to see its data requirements, or with "stave apply --pack " to scope an evaluation.

Inputs: --format, -f (text|json); --controls, -i (catalog to resolve against). Outputs: pack names, titles, and resolved control counts on stdout.

Exit codes: 0 = success, 2 = input error (bad --format), 4 = internal.

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                                                     |
| ---------------- | ------ | ------------------------------------------------------------------------------- |
| `-i, --controls` | string | control definitions directory (default: built-in catalog) (default: `controls`) |
| `-f, --format`   | string | output format: text, json (default: `text`)                                     |

## Examples[​](#examples "Direct link to Examples")

```
# List all concern packs
  stave pack list

  # Machine-readable output
  stave pack list --format json
```
