# stave exempt asset

Add a scope exclusion (exemption)

## Usage[​](#usage "Direct link to Usage")

```
stave exempt asset [flags]
```

## Description[​](#description "Direct link to Description")

Add a scope exclusion (exemption) for an asset or asset pattern. Exempted assets are excluded from all control evaluation.

Exit Codes: 0 Exemption added 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag        | Type   | Description                                                       |
| ----------- | ------ | ----------------------------------------------------------------- |
| `--file`    | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `--pattern` | string | asset ID or glob pattern (required)                               |
| `--reason`  | string | reason for exemption                                              |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt asset --pattern "arn:aws:s3:::sandbox-*" --reason "sandbox"
```
