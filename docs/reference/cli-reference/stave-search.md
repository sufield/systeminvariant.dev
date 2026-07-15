# stave search

Find catalog entries matching a free-form intent

## Usage[​](#usage "Direct link to Usage")

```
stave search <query> [flags]
```

## Description[​](#description "Direct link to Description")

Search the capability catalog by intent. Ranks every capability (control group, compound chain, operational feature) against the query tokens, expanding synonyms so the user does not need to know Stave's vocabulary first.

Scoring (per matched token, summed): title: 3 use\_when: 2 keyword: 1 description: 0.5 Phrase-verbatim hits add 5; threshold of 1.0 filters single-word matches against long descriptions.

Use this when you know your problem but not the catalog vocabulary: "public S3 bucket", "expired access keys", "Cognito unauthenticated access", "CloudTrail logging disabled", "shadow admin", "orphaned policies".

Inputs: Free-form intent string (required) --top N Number of matches to surface (default 10) --format F text (default) | json --controls Control catalog directory (default: controls) --chains Chain catalog directory (default: chains)

Exit codes: 0 Matches found (or zero matches but query was well-formed) 2 Invalid input (missing query, bad --format) 4 Internal error (catalog load failure)

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                     |
| ---------------- | ------ | ----------------------------------------------- |
| `--chains`       | string | chain catalog directory (default: `chains`)     |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format`   | string | output format: text \| json (default: `text`)   |
| `--top`          | int    | number of matches to surface (default: `10`)    |

## Examples[​](#examples "Direct link to Examples")

```
stave search "public S3 bucket"
  stave search "how long was this misconfigured"
  stave search "shadow admin"
  stave search "kms rotation" --format json
```
