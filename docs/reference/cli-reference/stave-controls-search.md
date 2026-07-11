# stave controls search

Search the built-in control catalog

## Usage[​](#usage "Direct link to Usage")

```
stave controls search [flags]
```

## Description[​](#description "Direct link to Description")

Search controls by keyword, domain, severity, or attack stage.

Exit Codes: 0 Success 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                      |
| ---------------- | ------ | ------------------------------------------------ |
| `--attack-stage` | string | Filter by ATT\&CK stage                          |
| `--domain`       | string | Filter by domain (e.g. s3, iam)                  |
| `-f, --format`   | string | Output format: text or json (default: `text`)    |
| `--query`        | string | Search keywords (matches ID, name, description)  |
| `--severity`     | string | Filter by severity (critical, high, medium, low) |

## Examples[​](#examples "Direct link to Examples")

```
stave controls search --query encryption
  stave controls search --domain s3 --severity critical
  stave controls search --query bucket --format json
```
