---
title: "stave forge chain lint"
sidebar_label: "forge chain lint"
sidebar_position: 103
description: "Validate chain YAML"
---

# stave forge chain lint

Validate chain YAML

## Usage

```
stave forge chain lint [flags]
```

## Description

Validate a chain definition: member control IDs exist in catalog,
capability strings are valid, escalation threshold is correct.

Exit Codes:
  0   Valid
  1   Errors found
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--chain` | string | path to chain YAML file (required) |
| `--controls` | string | path to controls directory (default: `controls`) |

## Examples

```bash
stave forge chain lint --chain chains/my-chain.yaml
```
