# stave inspect aliases

List predicate aliases with metadata

## Usage[​](#usage "Direct link to Usage")

```
stave inspect aliases [flags]
```

## Description[​](#description "Direct link to Description")

Aliases lists all registered semantic predicate aliases with their descriptions, categories, and supported operators. Optionally filter by category.

Output: JSON array of alias info entries.

Exit Codes: 0 Success 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                   |
| ------------ | ------ | --------------------------------------------- |
| `--category` | string | Filter by category (e.g. Encryption, Logging) |

## Examples[​](#examples "Direct link to Examples")

```
stave inspect aliases
  stave inspect aliases --category Encryption
```
