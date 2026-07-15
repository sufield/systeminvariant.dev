# stave inspect exposure

Classify resource exposure vectors

## Usage[​](#usage "Direct link to Usage")

```
stave inspect exposure [flags]
```

## Description[​](#description "Direct link to Description")

Exposure reads normalized resource inputs and classifies their exposure vectors, resolving bucket access, visibility, and trust boundaries.

Input: JSON object with resource exposure data from --file or stdin. Output: JSON with classified exposures, visibility, and governance analysis.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                       |
| ------------ | ------ | ------------------------------------------------- |
| `-f, --file` | string | Path to exposure input JSON file (default: stdin) |

## Examples[​](#examples "Direct link to Examples")

```
stave inspect exposure --file resources.json
  cat resources.json | stave inspect exposure
```
