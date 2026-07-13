---
title: "stave capabilities catalog"
sidebar_label: "capabilities catalog"
sidebar_position: 15
description: "Print the user-facing capability catalog"
---

# stave capabilities catalog

Print the user-facing capability catalog

## Usage

```
stave capabilities catalog [flags]
```

## Description

Catalog emits the grouped view of what Stave can check: control
groups by (service, category), compound chains, and operational
features (readiness, gaps, drift, validate, export-sir). Pair with
`stave search <query>` to look up by intent.

Use --service to filter to one service (s3, iam, lambda, …) or
--category to filter within a service. --kind narrows to one of
control_group | chain | operational.

Output is paged through $PAGER (then 'less -R', then 'more') when stdout is a
terminal, and written plain and unpaged when stdout is a pipe, a redirect, or
CI — so '... | grep' and '... > file' are unaffected. JSON is never paged.
Use --no-pager to force plain output on a terminal.

Drill-down mirrors 'man <topic>':
  catalog                 summary: one line per service
  catalog <SERVICE>       that service's capabilities, one line each
  catalog <SERVICE> --leaf  the leaf controls (individual control IDs)
  catalog --severity CRITICAL  only the matching leaf controls, any level

--severity matches an EXACT level and lists control-group controls only;
chains and operational features carry no severity and are excluded (stated in
the output, not silently dropped). --leaf is the leaf drill-down: --controls/-i
is already the catalog directory, so the leaf toggle is a distinct flag.

Inputs:
  --service SVC    Filter to one service (e.g. s3); also accepted positionally
  --category CAT   Filter to one category within --service (e.g. public)
  --kind K         control_group | chain | operational
  --severity SEV   critical | high | medium | low | info (leaf controls)
  --leaf           Drill to individual leaf controls
  --format F       auto (default; paged on a TTY) | text | wide | json
  --no-pager       Never page, even on a terminal
  --controls DIR   Control catalog directory (default: controls)
  --chains DIR     Chain catalog directory (default: chains)

Exit codes:
  0   Success
  2   Invalid input
  4   Internal error


## Flags

| Flag | Type | Description |
|---|---|---|
| `--category` | string | filter to one category (requires --service) |
| `--chains` | string | chain catalog directory (default: `chains`) |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: auto \| text \| wide \| json (default: `auto`) |
| `--kind` | string | filter to one kind: control_group \| chain \| operational |
| `--leaf` | bool | drill to leaf controls (the individual control IDs); pairs with a service |
| `--no-pager` | bool | never page output, even on a terminal |
| `--service` | string | filter to one service |
| `--severity` | string | show only leaf controls of this severity: critical \| high \| medium \| low \| info |
| `--taxonomy` | string | filter by taxonomy category (comma-separated, OR-joined) |

## Subcommands

| Command | Description |
|---|---|
| [`stave capabilities catalog coverage`](stave-capabilities-catalog-coverage.md) | Show per-service control coverage |
| [`stave capabilities catalog gaps`](stave-capabilities-catalog-gaps.md) | Compare catalog against an external checklist |
| [`stave capabilities catalog inspect`](stave-capabilities-catalog-inspect.md) | Show full metadata for a single control |
| [`stave capabilities catalog matrix`](stave-capabilities-catalog-matrix.md) | Show taxonomy × service cross-product with gap cells |
| [`stave capabilities catalog stats`](stave-capabilities-catalog-stats.md) | Print aggregate catalog statistics |
| [`stave capabilities catalog taxonomy`](stave-capabilities-catalog-taxonomy.md) | List taxonomy categories with control counts |

## Examples

```bash
stave catalog
  stave catalog s3
  stave catalog --service s3 --leaf
  stave catalog --kind chain
  stave catalog --format json | jq '.capabilities | length'
  stave catalog stats
  stave catalog inspect CTL.S3.PUBLIC.001
  stave catalog coverage
  stave catalog gaps checklist.yaml
```
