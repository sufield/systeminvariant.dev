# stave exempt remove

Mark an acknowledgment as revoked

## Usage[​](#usage "Direct link to Usage")

```
stave exempt remove [flags]
```

## Description[​](#description "Direct link to Description")

Mark an acknowledgment as revoked. The entry is preserved with audit trail — not deleted.

Exit Codes: 0 Entry revoked 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag     | Type   | Description                                                       |
| -------- | ------ | ----------------------------------------------------------------- |
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `--id`   | string | acknowledgment ID (control\_id\@asset\_id)                        |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt remove --id "CTL.S3.PUBLIC.001@arn:aws:s3:::bucket"
```
