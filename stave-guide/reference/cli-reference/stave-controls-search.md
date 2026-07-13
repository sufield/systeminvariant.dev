---
title: "stave controls search"
sidebar_label: "controls search"
sidebar_position: 65
description: "Search the built-in control catalog"
---

# stave controls search

Search the built-in control catalog

## Usage

```
stave controls search [flags]
```

## Description

Search controls by keyword, domain, severity, or attack stage.

Exit Codes:
  0    Success
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--attack-stage` | string | Filter by ATT&CK stage |
| `--domain` | string | Filter by domain (e.g. s3, iam) |
| `-f, --format` | string | Output format: text or json (default: `text`) |
| `--query` | string | Search keywords (matches ID, name, description) |
| `--severity` | string | Filter by severity (critical, high, medium, low) |

## Examples

```bash
stave controls search --query encryption
  stave controls search --domain s3 --severity critical
  stave controls search --query bucket --format json
```
