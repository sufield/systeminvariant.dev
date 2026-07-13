---
title: "stave inspect compliance"
sidebar_label: "inspect compliance"
sidebar_position: 119
description: "Resolve compliance framework crosswalk"
---

# stave inspect compliance

Resolve compliance framework crosswalk

## Usage

```
stave inspect compliance [flags]
```

## Description

Compliance reads a crosswalk YAML mapping and resolves it against
requested compliance frameworks, producing a filtered mapping from
internal checks to external control references.

Inputs:
  --file, -f    Path to crosswalk YAML file (default: stdin)
  --framework   Compliance frameworks to include (repeatable; default: all)
  --check-id    Check IDs to resolve (repeatable; default: all from file)

Outputs:
  stdout        JSON crosswalk resolution

Exit Codes:
  0   - Resolution completed successfully
  2   - Invalid input (malformed YAML, unknown framework)
  4   - Internal error
  130 - Interrupted (SIGINT)



Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--check-id` | stringSlice | Check IDs to resolve (default: all from file) |
| `-f, --file` | string | Path to crosswalk YAML file (default: stdin) |
| `--framework` | stringSlice | Compliance frameworks to include (default: all) |

## Examples

```bash
stave inspect compliance --file crosswalk.yaml
  stave inspect compliance --file crosswalk.yaml --framework nist_800_53
  cat crosswalk.yaml | stave inspect compliance
  stave inspect compliance --file crosswalk.yaml --check-id CTL.S3.PUBLIC.001 | jq .
```
