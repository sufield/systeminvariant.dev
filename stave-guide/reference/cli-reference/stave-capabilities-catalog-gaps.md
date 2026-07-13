---
title: "stave capabilities catalog gaps"
sidebar_label: "capabilities catalog gaps"
sidebar_position: 17
description: "Compare catalog against an external checklist"
---

# stave capabilities catalog gaps

Compare catalog against an external checklist

## Usage

```
stave capabilities catalog gaps <checklist-file> [flags]
```

## Description

Gaps loads an external YAML checklist and reports which items
have matching controls in the catalog (COVERED) and which do not
(UNCOVERED). Ambiguous matches (multiple controls match) are marked
with "?".

Checklist format:
  checks:
    - id: iam-mfa-root
      service: IAM
      description: "Root account has MFA enabled"
      reference: "CIS 1.5"

Matching logic: same service + keyword overlap on description.
Use --strict for exact control-ID matching only.

Inputs:
  <checklist-file>   Path to the YAML checklist (positional, required)
  --format F         text (default) | json
  --strict           Exact ID match only, no fuzzy matching
  --controls DIR     Control catalog directory (default: controls)

Exit codes:
  0   Success
  2   Invalid input (bad checklist file)
  4   Internal error


## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |
| `--strict` | bool | exact control-ID match only, no fuzzy matching |

## Examples

```bash
stave catalog gaps checklist.yaml
  stave catalog gaps cis-benchmark.yaml --strict
  stave catalog gaps prowler-checks.yaml --format json
```
