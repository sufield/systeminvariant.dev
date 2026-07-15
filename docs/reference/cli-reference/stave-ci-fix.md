# stave ci fix

Show machine-readable fix plan for a finding

## Usage[​](#usage "Direct link to Usage")

```
stave ci fix [flags]
```

## Description[​](#description "Direct link to Description")

Fix reads an evaluation artifact and prints deterministic remediation guidance for a single finding. It never modifies user files.

Inputs: --input Path to evaluation JSON file (required) --finding Finding selector: \<control\_id>@\<asset\_id> (required)

Outputs: stdout Remediation guidance JSON for the selected finding

Exit Codes: 0 - Guidance emitted successfully 2 - Invalid input (missing file, bad selector) 4 - Internal error 130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag        | Type   | Description                                              |
| ----------- | ------ | -------------------------------------------------------- |
| `--finding` | string | Finding selector: \<control\_id>@\<asset\_id> (required) |
| `--input`   | string | Path to evaluation JSON (required)                       |

## Examples[​](#examples "Direct link to Examples")

```
# Show fix plan for a specific finding
  stave ci fix --input output/evaluation.json --finding CTL.S3.PUBLIC.001@res:aws:s3:bucket:my-bucket

  # Pipe to jq for structured inspection
  stave ci fix --input output/evaluation.json --finding CTL.S3.PUBLIC.001@res:aws:s3:bucket:my-bucket | jq .
```
