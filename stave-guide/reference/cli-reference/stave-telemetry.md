---
title: "stave telemetry"
sidebar_label: "telemetry"
sidebar_position: 153
description: "Emit structured NDJSON telemetry from assessment output"
---

# stave telemetry

Emit structured NDJSON telemetry from assessment output

## Usage

```
stave telemetry [flags]
```

## Description

Telemetry reads assessment JSON (from stave apply) and emits one NDJSON
line per finding — consumable by Vector, Fluent Bit, Splunk, Logstash,
Loki, or any log shipper.

This is a format converter, not a re-evaluator. It transforms Stave's
deterministic reasoning output into the structured telemetry stream that
dashboards, SIEM pipelines, and compliance trending systems consume.

Inputs:
  stdin or --in       Assessment JSON from stave apply --format json
  --severity          Comma-separated severity filter (default: all)
  --resource          Scope to a specific resource ARN (default: all)

Output:
  NDJSON to stdout — one JSON object per line, newline terminated.
  Append-safe: results can be appended to a file without re-parsing.

Exit Codes:
  0   Telemetry emitted
  2   Input error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--in` | string | Path to assessment JSON (default: stdin) |
| `--resource` | string | Scope to a specific resource ARN |
| `--severity` | string | Comma-separated severity filter (e.g., critical,high) |

## Examples

```bash
# Pipe from apply
  stave apply --format json | stave telemetry

  # From file
  stave telemetry --in assessment.json

  # Filter by severity
  stave telemetry --in assessment.json --severity critical,high

  # Scope to one resource
  stave telemetry --in assessment.json --resource arn:aws:s3:::prod-bucket
```
