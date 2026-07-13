---
title: "stave ci fix"
sidebar_label: "ci fix"
sidebar_position: 37
description: "Show machine-readable fix plan for a finding"
---

# stave ci fix

Show machine-readable fix plan for a finding

## Usage

```
stave ci fix [flags]
```

## Description

Fix reads an evaluation artifact and prints deterministic remediation guidance
for a single finding. It never modifies user files.

Inputs:
  --input       Path to evaluation JSON file (required)
  --finding     Finding selector: <control_id>@<asset_id> (required)

Outputs:
  stdout        Remediation guidance JSON for the selected finding

Exit Codes:
  0   - Guidance emitted successfully
  2   - Invalid input (missing file, bad selector)
  4   - Internal error
  130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--finding` | string | Finding selector: <control_id>@<asset_id> (required) |
| `--input` | string | Path to evaluation JSON (required) |

## Examples

```bash
# Show fix plan for a specific finding
  stave ci fix --input output/evaluation.json --finding CTL.S3.PUBLIC.001@res:aws:s3:bucket:my-bucket

  # Pipe to jq for structured inspection
  stave ci fix --input output/evaluation.json --finding CTL.S3.PUBLIC.001@res:aws:s3:bucket:my-bucket | jq .
```
