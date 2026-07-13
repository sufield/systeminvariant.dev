---
title: "stave plan"
sidebar_label: "plan"
sidebar_position: 137
description: "Preview which controls will evaluate, by service and severity"
---

# stave plan

Preview which controls will evaluate, by service and severity

## Usage

```
stave plan [flags]
```

## Description

Preview what Stave will check before you collect anything. Given the AWS
services you use (or a pack), it shows the controls that would evaluate, broken
down by service and severity, plus a severity-weighted collection order so you
start with the highest-impact data first.

This is a coverage preview — distinct from "stave apply --dry-run", which checks
whether an already-collected snapshot is READY to evaluate. Use plan to decide
what to collect; use apply --dry-run to confirm a collected snapshot is complete.

Inputs:  --services (comma-separated) OR --pack <name>; --format, -f (text|json);
         --controls, -i (catalog to resolve against).
Outputs: a per-service control/severity table and recommended collection order.

Exit codes: 0 = success, 2 = input error, 4 = internal.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | control definitions directory (default: built-in catalog) (default: `controls`) |
| `-f, --format` | string | output format: text, json (default: `text`) |
| `--pack` | string | preview a named pack instead of services |
| `--services` | stringSlice | AWS services to preview (comma-separated), e.g. iam,s3,ec2 |

## Examples

```bash
# What will Stave check for these services?
  stave plan --services iam,s3,ec2

  # Preview a named pack
  stave plan --pack entropy --format json
```
