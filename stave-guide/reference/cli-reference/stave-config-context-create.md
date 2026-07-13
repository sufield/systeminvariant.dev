---
title: "stave config context create"
sidebar_label: "config context create"
sidebar_position: 45
description: "Create or update a named context"
---

# stave config context create

Create or update a named context

## Usage

```
stave config context create <name> [flags]
```

## Description

Create a named context that stores default paths for a project.
Contexts are saved in the user configuration and selected with
'config context use'. They affect default path resolution only —
evaluation semantics are never changed.

Exit Codes:
  0    Context created or updated
  2    Input error (invalid directory or name)
  4    Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--config` | string | Project config path (absolute or relative to --dir) (default: `stave.yaml`) |
| `--controls` | string | Default controls directory for this context |
| `-d, --dir` | string | Project root directory for this context (default: `.`) |
| `--observations` | string | Default observations directory for this context |

## Examples

```bash
stave config context create myproject --dir /path/to/project
  stave config context create myproject --dir . --controls controls/s3
```
