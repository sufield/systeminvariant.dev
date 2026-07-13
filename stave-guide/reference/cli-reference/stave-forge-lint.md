---
title: "stave forge lint"
sidebar_label: "forge lint"
sidebar_position: 104
description: "Static analysis for control YAML files"
---

# stave forge lint

Static analysis for control YAML files

## Usage

```
stave forge lint [flags]
```

## Description

Validate control YAML files for schema correctness, CEL predicate
syntax, and completeness. With --semantic, performs additional
checks for always-firing predicates and impossible conditions.

Exit Codes:
  0   No errors, no warnings
  1   Warnings only (errors with --strict)
  2   Errors present
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--control` | string | control YAML file or directory (required) |
| `-f, --format` | string | output format: text \| json (default: `text`) |
| `--semantic` | bool | enable semantic analysis (always-firing, never-firing) |
| `--strict` | bool | treat warnings as errors |

## Examples

```bash
stave forge lint --control controls/ad/CTL.AD.PASS.MINLEN.001.yaml
  stave forge lint --control controls/ --semantic --strict
```
