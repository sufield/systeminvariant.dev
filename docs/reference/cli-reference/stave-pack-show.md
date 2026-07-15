# stave pack show

Show a pack's requirements manifest (AWS calls, signals, collector permissions)

## Usage[​](#usage "Direct link to Usage")

```
stave pack show <name> [flags]
```

## Description[​](#description "Direct link to Description")

Show a concern pack's requirements manifest: the resolved control count, the exact AWS API calls to collect, the observation signals the controls read, and the minimum collector IAM permissions. Copy the calls, run them, and feed the output to a scoped evaluation.

Inputs: (pack to show); --format, -f (text|json); --controls, -i. Outputs: the resolved manifest on stdout.

Exit codes: 0 = success, 2 = input error (unknown pack/format), 4 = internal.

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                                                     |
| ---------------- | ------ | ------------------------------------------------------------------------------- |
| `-i, --controls` | string | control definitions directory (default: built-in catalog) (default: `controls`) |
| `-f, --format`   | string | output format: text, json (default: `text`)                                     |

## Examples[​](#examples "Direct link to Examples")

```
# Show the entropy pack's data requirements
  stave pack show entropy

  # Machine-readable output
  stave pack show entropy --format json
```
