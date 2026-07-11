# stave capabilities catalog inspect

Show full metadata for a single control

## Usage[​](#usage "Direct link to Usage")

```
stave capabilities catalog inspect <control-id> [flags]
```

## Description[​](#description "Direct link to Description")

Inspect prints the complete metadata for one control: severity, domain, scope, compliance mappings, applicable asset types, observation fields, chains that reference it, and remediation guidance.

Inputs: The control ID to inspect (positional, required) --format F text (default) | json --controls DIR Control catalog directory (default: controls) --chains DIR Chain catalog directory (default: chains)

Exit codes: 0 Success 2 Invalid input (unknown control ID) 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                     |
| ---------------- | ------ | ----------------------------------------------- |
| `--chains`       | string | chain catalog directory (default: `chains`)     |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format`   | string | output format: text \| json (default: `text`)   |

## Examples[​](#examples "Direct link to Examples")

```
stave catalog inspect CTL.S3.PUBLIC.001
  stave catalog inspect CTL.IAM.ESCALATE.SSOOAUTH.001 --format json
```
