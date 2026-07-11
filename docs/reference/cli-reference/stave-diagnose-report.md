# stave diagnose report

Generate a plain-text report from evaluation output

## Usage[​](#usage "Direct link to Usage")

```
stave diagnose report [flags]
```

## Description[​](#description "Direct link to Description")

Report reads evaluation JSON and renders a formatted summary of findings, controls evaluated, and asset coverage.

Inputs: --in, -i Path to evaluation JSON file (required) --format, -f Output format: text or json (default: text) --template-file Path to custom Go template for text output

Outputs: stdout Rendered report (text or JSON) stderr Error messages and git-dirty warnings (if any)

Exit Codes: 0 - Report generated successfully 2 - Invalid input (missing file, bad format) 4 - Internal error 130 - Interrupted (SIGINT)

Examples:

# Render text report from evaluation output

stave report --in output/evaluation.json

# JSON report for scripting

stave report --in output/evaluation.json --format json | jq .summary

# Use a custom template

stave report --in output/evaluation.json --template-file ./my-template.tmpl

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag              | Type   | Description                                  |
| ----------------- | ------ | -------------------------------------------- |
| `-f, --format`    | string | Output format (text\|json) (default: `text`) |
| `-i, --in`        | string | Path to evaluation JSON file (required)      |
| `--template-file` | string | Path to custom Go template                   |

## Examples[​](#examples "Direct link to Examples")

```
stave report --in evaluation.json --format text
```
