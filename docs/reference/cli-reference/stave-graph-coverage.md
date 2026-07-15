# stave graph coverage

Show which controls cover which assets

## Usage[​](#usage "Direct link to Usage")

```
stave graph coverage [flags]
```

## Description[​](#description "Direct link to Description")

Coverage outputs a graph showing control→asset edges.

Purpose: Visualize policy coverage — find uncovered assets, see control scope, and understand protection density on high-value assets.

Uses the same matching logic as apply: for each control, tests its unsafe\_predicate against each asset from the latest observation snapshot.

Output Formats: --format dot DOT graph (default) — pipe to graphviz for rendering --format json Machine-readable JSON with edges and uncovered assets

Examples:

# Output DOT graph to stdout

stave graph coverage --controls ./controls --observations ./obs

# Render as PNG (requires graphviz)

stave graph coverage --controls ./controls --observations ./obs | dot -Tpng > coverage.png

# JSON output with jq

stave graph coverage --controls ./controls --observations ./obs --format json | jq .

# Sanitize asset identifiers

stave graph coverage --controls ./controls --observations ./obs --sanitize

Exit Codes: 0 - Coverage graph generated successfully 2 - Invalid input or configuration error 4 - Internal error 130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag                 | Type   | Description                                                       |
| -------------------- | ------ | ----------------------------------------------------------------- |
| `-i, --controls`     | string | Path to control definitions directory (default: `controls`)       |
| `-f, --format`       | string | Output format: dot or json (default: `dot`)                       |
| `-o, --observations` | string | Path to observation snapshots directory (default: `observations`) |

## Examples[​](#examples "Direct link to Examples")

```
stave graph coverage --controls controls/s3 --observations observations
```
