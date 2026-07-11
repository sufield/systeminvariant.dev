# stave snapshot diff

Compare the latest two observation snapshots

## Usage[​](#usage "Direct link to Usage")

```
stave snapshot diff [flags]
```

## Description[​](#description "Direct link to Description")

Diff compares the latest two snapshots in the observations directory and reports asset-level changes (added, removed, modified) including property-level differences for modified assets.

Inputs: --observations, -o Path to observation snapshots directory (default: observations) --format, -f Output format: text or json (default: text) --change-type Filter changes: added, removed, modified (repeatable) --asset-type Filter by asset type (repeatable) --asset-id Filter by asset ID substring

Outputs: stdout Diff report showing added, removed, and modified assets stderr Error messages (if any)

Exit Codes: 0 - Diff completed successfully 2 - Invalid input or configuration error 4 - Internal error 130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag                 | Type        | Description                                                       |
| -------------------- | ----------- | ----------------------------------------------------------------- |
| `--asset-id`         | string      | Filter by asset ID substring                                      |
| `--asset-type`       | stringSlice | Filter by asset type                                              |
| `--change-type`      | stringSlice | Filter changes: PROVISIONED, DECOMMISSIONED, RECONFIGURED         |
| `-f, --format`       | string      | Output format (text\|json) (default: `text`)                      |
| `-o, --observations` | string      | Path to observation snapshots directory (default: `observations`) |

## Examples[​](#examples "Direct link to Examples")

```
# Human-readable summary
  stave snapshot diff --observations ./observations

  # Machine-readable output
  stave snapshot diff --observations ./observations --format json

  # Write report to file
  stave snapshot diff --observations ./observations --format json > output/diff.json
```
