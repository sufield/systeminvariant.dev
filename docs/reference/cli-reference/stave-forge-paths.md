# stave forge paths

List available observation property paths from a snapshot

## Usage[​](#usage "Direct link to Usage")

```
stave forge paths [flags]
```

## Description[​](#description "Direct link to Description")

Lists all observation property paths for a given asset type in a snapshot, with types and presence counts. Map entries (like tags) are expanded to show individual keys present in the snapshot.

Exit Codes: 0 Paths listed successfully 2 Invalid input or snapshot not found 4 Internal error

Examples: stave forge paths --snapshot obs.json --asset-type aws\_s3\_bucket stave forge paths --snapshot obs.json --asset-type aws\_s3\_bucket --filter tags

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                      |
| -------------- | ------ | -------------------------------- |
| `--asset-type` | string | filter to a specific asset type  |
| `--filter`     | string | substring filter on path names   |
| `--snapshot`   | string | path to snapshot file (required) |

## Examples[​](#examples "Direct link to Examples")

```
stave forge paths --snapshot obs.json --asset-type aws_s3_bucket
```
