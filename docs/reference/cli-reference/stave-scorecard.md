# stave scorecard

Multi-framework compliance scorecard

## Usage[​](#usage "Direct link to Usage")

```
stave scorecard [flags]
```

## Description[​](#description "Direct link to Description")

Compute compliance readiness across multiple frameworks simultaneously. Shows readiness percentage, critical findings, and trend per framework.

Exit Codes: 0 Scorecard produced 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type        | Description                                                 |
| -------------- | ----------- | ----------------------------------------------------------- |
| `-f, --format` | string      | output format: table \| json \| markdown (default: `table`) |
| `--profile`    | stringSlice | framework profiles (repeatable; default: all built-in)      |
| `--snapshot`   | string      | path to snapshot JSON (required)                            |

## Examples[​](#examples "Direct link to Examples")

```
stave scorecard --snapshot snapshot.json
  stave scorecard --snapshot snapshot.json --profile hipaa --profile soc2 --format json
```
