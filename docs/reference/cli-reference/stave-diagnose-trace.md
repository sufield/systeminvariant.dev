# stave diagnose trace

Trace predicate evaluation for a single control against a single asset

## Usage[​](#usage "Direct link to Usage")

```
stave diagnose trace [flags]
```

## Description[​](#description "Direct link to Description")

Trace walks a control's unsafe\_predicate clause by clause against a single asset and prints a detailed evaluation log — field value, operator, comparison value, and PASS/FAIL — for every clause.

Use this when you get unexpected evaluation results and want to understand exactly why a control did or did not match.

Examples: stave trace --control CTL.S3.PUBLIC.001<br />--observation observations/2026-01-11T000000Z.json<br />--asset-id res:aws:s3:bucket:public-bucket

stave trace --control CTL.S3.ENCRYPT.001<br />--observation observations/2026-01-11T000000Z.json<br />--asset-id res:aws:s3:bucket:public-bucket<br />--format json

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                                 |
| ---------------- | ------ | ----------------------------------------------------------- |
| `--asset-id`     | string | Asset ID to trace against (required)                        |
| `--control`      | string | Control ID to trace (required)                              |
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `-f, --format`   | string | Output format: text or json (default: `text`)               |
| `--observation`  | string | Path to single observation JSON file (required)             |

## Examples[​](#examples "Direct link to Examples")

```
stave trace --controls controls/s3 --observation observations/snap.json --control CTL.S3.PUBLIC.001 --asset-id my-bucket
```
