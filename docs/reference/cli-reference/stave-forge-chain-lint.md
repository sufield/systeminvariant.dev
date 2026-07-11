# stave forge chain lint

Validate chain YAML

## Usage[​](#usage "Direct link to Usage")

```
stave forge chain lint [flags]
```

## Description[​](#description "Direct link to Description")

Validate a chain definition: member control IDs exist in catalog, capability strings are valid, escalation threshold is correct.

Exit Codes: 0 Valid 1 Errors found 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                      |
| ------------ | ------ | ------------------------------------------------ |
| `--chain`    | string | path to chain YAML file (required)               |
| `--controls` | string | path to controls directory (default: `controls`) |

## Examples[​](#examples "Direct link to Examples")

```
stave forge chain lint --chain chains/my-chain.yaml
```
