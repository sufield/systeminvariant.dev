---
title: "stave capabilities catalog inspect"
sidebar_label: "capabilities catalog inspect"
sidebar_position: 18
description: "Show full metadata for a single control"
---

# stave capabilities catalog inspect

Show full metadata for a single control

## Usage

```
stave capabilities catalog inspect <control-id> [flags]
```

## Description

Inspect prints the complete metadata for one control: severity,
domain, scope, compliance mappings, applicable asset types, observation
fields, chains that reference it, and remediation guidance.

Inputs:
  <control-id>     The control ID to inspect (positional, required)
  --format F       text (default) | json
  --controls DIR   Control catalog directory (default: controls)
  --chains DIR     Chain catalog directory (default: chains)

Exit codes:
  0   Success
  2   Invalid input (unknown control ID)
  4   Internal error


## Flags

| Flag | Type | Description |
|---|---|---|
| `--chains` | string | chain catalog directory (default: `chains`) |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |

## Examples

```bash
stave catalog inspect CTL.S3.PUBLIC.001
  stave catalog inspect CTL.IAM.ESCALATE.SSOOAUTH.001 --format json
```
