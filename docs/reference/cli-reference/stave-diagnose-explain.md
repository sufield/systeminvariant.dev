# stave diagnose explain

Generate guided remediation playbook for a finding

## Usage[​](#usage "Direct link to Usage")

```
stave diagnose explain [flags]
```

## Description[​](#description "Direct link to Description")

Assemble a remediation narrative from structured finding data, control metadata, and chain context. Explains the security impact, dependency order for safe remediation, and compound risk context.

No network calls — fully offline, air-gap compatible.

Exit Codes: 0 Playbook generated 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                                         |
| -------------- | ------ | ------------------------------------------------------------------- |
| `--asset`      | string | explain all findings for an asset                                   |
| `--chains`     | string | chains directory (default: `chains`)                                |
| `--control`    | string | explain all findings for a control                                  |
| `--controls`   | string | controls directory (default: `controls`)                            |
| `--depth`      | string | detail level: brief \| standard \| detailed (default: `standard`)   |
| `--finding-id` | string | explain a specific finding by ID                                    |
| `-f, --format` | string | output format: narrative \| json \| markdown (default: `narrative`) |
| `--output`     | string | path to out.v0.1.json (required)                                    |

## Examples[​](#examples "Direct link to Examples")

```
stave diagnose explain --finding-id sha256:a3f8c2 --output out.v0.1.json
  stave diagnose explain --asset arn:aws:s3:::phi-records --output out.v0.1.json
  stave diagnose explain --control CTL.S3.PUBLIC.001 --output out.v0.1.json --format markdown
```
