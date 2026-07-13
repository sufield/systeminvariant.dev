---
title: "stave exempt list"
sidebar_label: "exempt list"
sidebar_position: 82
description: "List all active risk acceptances"
---

# stave exempt list

List all active risk acceptances

## Usage

```
stave exempt list [flags]
```

## Description

List all active risk acceptances including acknowledgments, exceptions, and exemptions.

Exit Codes:
  0   List produced
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--expired` | bool | include expired/revoked entries |
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `-f, --format` | string | output format: table \| json (default: `table`) |
| `--type` | string | filter by type: acknowledgment \| exception \| exemption \| all (default: `all`) |

## Examples

```bash
stave exempt list
  stave exempt list --format json --expired
```
