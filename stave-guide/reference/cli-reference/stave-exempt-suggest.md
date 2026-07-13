---
title: "stave exempt suggest"
sidebar_label: "exempt suggest"
sidebar_position: 84
description: "Suggest exemptions for chronic/oscillating findings"
---

# stave exempt suggest

Suggest exemptions for chronic/oscillating findings

## Usage

```
stave exempt suggest [flags]
```

## Description

Analyze assessment history to identify findings that have been open
long enough to warrant a formal governance decision: fix, formally
accept the risk, or escalate.

Oscillating findings (fixed then returned) are separated from chronic
findings (continuously open). Each includes a copy-paste exemption command.

Exit Codes:
  0   Suggestions produced
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--file` | string | path to acceptance file (for excluding already-exempted findings) (default: `./stave-acknowledgments.yaml`) |
| `-f, --format` | string | output format: table \| json (default: `table`) |
| `--history` | string | directory of historical assessment JSON files (required) |
| `--min-dwell` | string | minimum time a finding must be open to be chronic (e.g. 14d) (default: `14d`) |
| `--window` | string | how far back to look for patterns (e.g. 30d, 90d) (default: `30d`) |

## Examples

```bash
stave exempt suggest --history ./history --window 30d --min-dwell 14d
  stave exempt suggest --history ./history --format json
```
