---
title: "stave exempt remove"
sidebar_label: "exempt remove"
sidebar_position: 83
description: "Mark an acknowledgment as revoked"
---

# stave exempt remove

Mark an acknowledgment as revoked

## Usage

```
stave exempt remove [flags]
```

## Description

Mark an acknowledgment as revoked. The entry is preserved with audit trail — not deleted.

Exit Codes:
  0   Entry revoked
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `--id` | string | acknowledgment ID (control_id@asset_id) |

## Examples

```bash
stave exempt remove --id "CTL.S3.PUBLIC.001@arn:aws:s3:::bucket"
```
