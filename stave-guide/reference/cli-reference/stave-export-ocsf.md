---
title: "stave export ocsf"
sidebar_label: "export ocsf"
sidebar_position: 92
description: "Export findings as OCSF 1.1 Compliance Finding events"
---

# stave export ocsf

Export findings as OCSF 1.1 Compliance Finding events

## Usage

```
stave export ocsf [flags]
```

## Description

Convert assessment findings to OCSF 1.1 events (class_uid: 2003)
for SIEM ingestion (Splunk, Sentinel, Elastic, Panther).

Output is NDJSON — one event per line.

Exit Codes:
  0   Export complete
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--assessment` | string | stave apply JSON output (required) |

## Examples

```bash
stave export ocsf --assessment findings.json
```
