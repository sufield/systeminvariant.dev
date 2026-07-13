---
title: "stave profile validate"
sidebar_label: "profile validate"
sidebar_position: 141
description: "Validate a profile file"
---

# stave profile validate

Validate a profile file

## Usage

```
stave profile validate [flags]
```

## Description

Check a custom compliance profile YAML for correctness: required
fields present, referenced control IDs exist in the catalog.

Exit Codes:
  0   Valid
  1   Errors found
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--file` | string | profile YAML file (required) |

## Examples

```bash
stave profile validate --file profiles/my-policy.yaml
```
