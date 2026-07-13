---
title: "stave exempt validate"
sidebar_label: "exempt validate"
sidebar_position: 86
description: "Validate the acceptance file"
---

# stave exempt validate

Validate the acceptance file

## Usage

```
stave exempt validate [flags]
```

## Description

Validate the acceptance file for required fields, date formats, and structural correctness.

Exit Codes:
  0   Validation passed
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--file` | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |

## Examples

```bash
stave exempt validate --file ./stave-acknowledgments.yaml
```
