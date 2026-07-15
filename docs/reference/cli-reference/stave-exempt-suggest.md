# stave exempt suggest

Suggest exemptions for chronic/oscillating findings

## Usage[​](#usage "Direct link to Usage")

```
stave exempt suggest [flags]
```

## Description[​](#description "Direct link to Description")

Analyze assessment history to identify findings that have been open long enough to warrant a formal governance decision: fix, formally accept the risk, or escalate.

Oscillating findings (fixed then returned) are separated from chronic findings (continuously open). Each includes a copy-paste exemption command.

Exit Codes: 0 Suggestions produced 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                                                                                 |
| -------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `--file`       | string | path to acceptance file (for excluding already-exempted findings) (default: `./stave-acknowledgments.yaml`) |
| `-f, --format` | string | output format: table \| json (default: `table`)                                                             |
| `--history`    | string | directory of historical assessment JSON files (required)                                                    |
| `--min-dwell`  | string | minimum time a finding must be open to be chronic (e.g. 14d) (default: `14d`)                               |
| `--window`     | string | how far back to look for patterns (e.g. 30d, 90d) (default: `30d`)                                          |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt suggest --history ./history --window 30d --min-dwell 14d
  stave exempt suggest --history ./history --format json
```
