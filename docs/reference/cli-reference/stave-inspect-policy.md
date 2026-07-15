# stave inspect policy

Analyze an S3 bucket policy document

## Usage[​](#usage "Direct link to Usage")

```
stave inspect policy [flags]
```

## Description[​](#description "Direct link to Description")

Policy reads a raw S3 bucket policy JSON document and performs a comprehensive security analysis including access assessment, prefix scope analysis, risk scoring, and IAM action requirements.

Inputs: --file, -f Path to policy JSON file (default: stdin)

Outputs: stdout JSON report with assessment, prefix\_scope, risk, and required\_iam\_actions

Exit Codes: 0 - Analysis completed successfully 2 - Invalid input (malformed JSON, missing required fields) 4 - Internal error 130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                               |
| ------------ | ------ | ----------------------------------------- |
| `-f, --file` | string | Path to policy JSON file (default: stdin) |

## Examples[​](#examples "Direct link to Examples")

```
stave inspect policy --file policy.json
  cat policy.json | stave inspect policy
  stave inspect policy --file policy.json | jq .risk
```
