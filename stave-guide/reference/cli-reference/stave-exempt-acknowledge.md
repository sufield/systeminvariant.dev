---
title: "stave exempt acknowledge"
sidebar_label: "exempt acknowledge"
sidebar_position: 77
description: "Add a formal risk acceptance"
---

# stave exempt acknowledge

Add a formal risk acceptance

## Usage

```
stave exempt acknowledge [flags]
```

## Description

Add a formal risk acceptance (acknowledgment) for a specific finding.
Requires approver identity, rationale, and expiry date.
The entry is written to the acceptance YAML file with a full audit trail.

Exit Codes:
  0   Acknowledgment added
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--approver` | string | identity of approving authority (required) |
| `--asset-id` | string | asset ARN or ID (required) |
| `--compensating` | string | comma-separated compensating control IDs |
| `--control-id` | string | control ID (required) |
| `--expires` | string | expiry date YYYY-MM-DD (required) |
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `--reason` | string | rationale for accepting this risk (required) |

## Examples

```bash
stave exempt acknowledge \
    --control-id CTL.S3.PUBLIC.001 \
    --asset-id arn:aws:s3:::legacy-bucket \
    --reason "Temporary public access during migration" \
    --approver "jane.doe@example.com (CISO)" \
    --expires 2026-09-01
```
