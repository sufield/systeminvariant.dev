# stave exempt acknowledge

Add a formal risk acceptance

## Usage[​](#usage "Direct link to Usage")

```
stave exempt acknowledge [flags]
```

## Description[​](#description "Direct link to Description")

Add a formal risk acceptance (acknowledgment) for a specific finding. Requires approver identity, rationale, and expiry date. The entry is written to the acceptance YAML file with a full audit trail.

Exit Codes: 0 Acknowledgment added 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                                       |
| ---------------- | ------ | ----------------------------------------------------------------- |
| `--approver`     | string | identity of approving authority (required)                        |
| `--asset-id`     | string | asset ARN or ID (required)                                        |
| `--compensating` | string | comma-separated compensating control IDs                          |
| `--control-id`   | string | control ID (required)                                             |
| `--expires`      | string | expiry date YYYY-MM-DD (required)                                 |
| `--file`         | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `--reason`       | string | rationale for accepting this risk (required)                      |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt acknowledge \
    --control-id CTL.S3.PUBLIC.001 \
    --asset-id arn:aws:s3:::legacy-bucket \
    --reason "Temporary public access during migration" \
    --approver "jane.doe@example.com (CISO)" \
    --expires 2026-09-01
```
