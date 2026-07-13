---
title: "stave map"
sidebar_label: "map"
sidebar_position: 124
description: "ATT&CK tactic coverage and gap analysis"
---

# stave map

ATT&CK tactic coverage and gap analysis

## Usage

```
stave map [flags]
```

## Description

Produce a MITRE ATT&CK tactic coverage map from the control catalog.
Optionally overlay current posture from assessment output.

Exit Codes:
  0   Map produced
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | path to controls directory (default: `controls`) |
| `-f, --format` | string | output format: table \| json \| navigator \| markdown (default: `table`) |
| `--min-controls` | int | thin coverage threshold (default: `2`) |
| `--no-pager` | bool | never page output, even on a terminal |
| `--output` | string | path to out.v0.1.json for posture overlay |

## Examples

```bash
stave map
  stave map --output assessment.json --format navigator > layer.json
```
