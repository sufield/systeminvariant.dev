---
title: "stave permissions"
sidebar_label: "permissions"
sidebar_position: 133
description: "Query net effective permissions from a snapshot"
---

# stave permissions

Query net effective permissions from a snapshot

## Usage

```
stave permissions
```

## Description

Resolve and display net effective permissions (NEP) by evaluating all
six AWS IAM policy layers: explicit denies, SCPs, permission boundaries,
identity-based policies, resource-based policies, and transitive role
chains.

All computation runs locally against a snapshot file. No cloud credentials
required.

Subcommands:
  principal   Resolve permissions for a specific principal ARN
  resource    Show who has effective access to a resource
  summary     Aggregate NEP metrics across all principals

Exit Codes:
  0   No findings above threshold
  1   Critical findings exist
  2   High findings (no critical)
  3   Incomplete resolution (snapshot data missing)
  4   Internal error

Examples:
  # Who can access the PHI bucket?
  stave nep resource --snapshot obs.json --resource arn:aws:s3:::phi-records

  # What can this role actually do?
  stave nep principal --snapshot obs.json --principal arn:aws:iam::123:role/app

  # NEP summary for CI/CD gating
  stave nep summary --snapshot obs.json --threshold critical

## Subcommands

| Command | Description |
|---|---|
| [`stave permissions principal`](stave-permissions-principal.md) | Resolve permissions for a specific principal ARN |
| [`stave permissions resource`](stave-permissions-resource.md) | Show who has effective access to a resource |
| [`stave permissions summary`](stave-permissions-summary.md) | Aggregate NEP metrics across all principals |

