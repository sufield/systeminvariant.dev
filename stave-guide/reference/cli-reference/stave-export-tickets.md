---
title: "stave export tickets"
sidebar_label: "export tickets"
sidebar_position: 94
description: "Export findings as canonical ticket records"
---

# stave export tickets

Export findings as canonical ticket records

## Usage

```
stave export tickets [flags]
```

## Description

Generate ticket records from assessment findings with stable IDs,
severity-to-priority mapping, and team assignment. Output as JSON
or CSV for import into Jira, Linear, GitHub Issues, or other
ticketing systems.

Each ticket has a deterministic ID derived from control_id + asset_id,
so re-running the export produces stable references.

Exit Codes:
  0   Export complete
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--assessment` | string | stave apply JSON output (required) |
| `-f, --format` | string | Output format: json or csv (default: `json`) |
| `--team` | string | Filter tickets to a specific team |
| `--team-manifest` | string | Path to stave-teams.yaml for team assignment |

## Examples

```bash
stave export tickets --assessment findings.json
  stave export tickets --assessment findings.json --format csv
  stave export tickets --assessment findings.json --team-manifest stave-teams.yaml --team platform
```
