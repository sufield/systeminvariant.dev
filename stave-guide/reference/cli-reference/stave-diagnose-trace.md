---
title: "stave diagnose trace"
sidebar_label: "diagnose trace"
sidebar_position: 71
description: "Trace predicate evaluation for a single control against a single asset"
---

# stave diagnose trace

Trace predicate evaluation for a single control against a single asset

## Usage

```
stave diagnose trace [flags]
```

## Description

Trace walks a control's unsafe_predicate clause by clause against a
single asset and prints a detailed evaluation log — field value,
operator, comparison value, and PASS/FAIL — for every clause.

Use this when you get unexpected evaluation results and want to
understand exactly why a control did or did not match.

Examples:
  stave trace --control CTL.S3.PUBLIC.001 \
    --observation observations/2026-01-11T000000Z.json \
    --asset-id res:aws:s3:bucket:public-bucket

  stave trace --control CTL.S3.ENCRYPT.001 \
    --observation observations/2026-01-11T000000Z.json \
    --asset-id res:aws:s3:bucket:public-bucket \
    --format json

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--asset-id` | string | Asset ID to trace against (required) |
| `--control` | string | Control ID to trace (required) |
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `-f, --format` | string | Output format: text or json (default: `text`) |
| `--observation` | string | Path to single observation JSON file (required) |

## Examples

```bash
stave trace --controls controls/s3 --observation observations/snap.json --control CTL.S3.PUBLIC.001 --asset-id my-bucket
```
