---
title: "stave features"
sidebar_label: "features"
sidebar_position: 97
description: "Show what Stave does and deliberately does not do"
---

# stave features

Show what Stave does and deliberately does not do

## Usage

```
stave features [flags]
```

## Description

Report Stave's capability scope.

IN SCOPE is discovered live from this build's registries (control
catalog, packs, compliance frameworks, observation schemas, ATT&CK
tactics) — it cannot drift from what the binary can do. OUT OF
SCOPE is read from the versioned features/scope.yaml manifest, which is
reviewed in PRs: capabilities Stave delegates to upstream collectors or
downstream tools.

Output is paged through $PAGER (then 'less -R', then 'more') when stdout is a
terminal, and written plain and unpaged when piped, redirected, or in CI — so
'... | grep' and '... > file' are unaffected. JSON is never paged. Use
--no-pager to force plain output on a terminal.

Inputs:
  --format, -f   Output format: auto (default; paged on a TTY) | text | wide | json.
  --no-pager     Never page, even on a terminal.

Outputs:
  stdout         The scope report (text table, wide table, or JSON).

Exit codes:
  0  report rendered
  2  invalid flag / unknown format
  4  internal error reading the embedded manifest

Examples:
  stave features
  stave features --format wide
  stave features --format json

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | Output format: auto \| text \| wide \| json (default: `auto`) |
| `--no-pager` | bool | never page output, even on a terminal |

## Examples

```bash
stave features
  stave features --format wide
  stave features --format json
```
