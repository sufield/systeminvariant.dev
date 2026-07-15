# stave controls aliases

List built-in semantic predicate aliases

## Usage[​](#usage "Direct link to Usage")

```
stave controls aliases [flags]
```

## Description[​](#description "Direct link to Description")

List all built-in semantic predicate aliases that can be used in control definitions via the unsafe\_predicate\_alias field. Optionally filter by category.

Exit Codes: 0 Success 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                   |
| ------------ | ------ | --------------------------------------------- |
| `--category` | string | Filter by category (e.g. Encryption, Logging) |

## Examples[​](#examples "Direct link to Examples")

```
stave controls aliases
  stave controls aliases --category Encryption
```
