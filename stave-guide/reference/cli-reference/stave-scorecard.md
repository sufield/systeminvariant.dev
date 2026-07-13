---
title: "stave scorecard"
sidebar_label: "scorecard"
sidebar_position: 148
description: "Multi-framework compliance scorecard"
---

# stave scorecard

Multi-framework compliance scorecard

## Usage

```
stave scorecard [flags]
```

## Description

Compute compliance readiness across multiple frameworks simultaneously.
Shows readiness percentage, critical findings, and trend per framework.

Exit Codes:
  0   Scorecard produced
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | output format: table \| json \| markdown (default: `table`) |
| `--profile` | stringSlice | framework profiles (repeatable; default: all built-in) |
| `--snapshot` | string | path to snapshot JSON (required) |

## Examples

```bash
stave scorecard --snapshot snapshot.json
  stave scorecard --snapshot snapshot.json --profile hipaa --profile soc2 --format json
```
