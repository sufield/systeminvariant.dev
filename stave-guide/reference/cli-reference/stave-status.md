---
title: "stave status"
sidebar_label: "status"
sidebar_position: 152
description: "Show project context and the next recommended command"
---

# stave status

Show project context and the next recommended command

## Usage

```
stave status [flags]
```

## Description

Status inspects local project artifacts and prints a quick "where to continue"
summary plus one recommended next command.

Inputs:
  --dir, -d     Directory to inspect for Stave project context (default: .)
  --format, -f  Output format: text or json (default: text)

Outputs:
  stdout        Project status summary and next recommended command
  stderr        Error messages (if any)

Exit Codes:
  0   - Status retrieved successfully
  2   - Invalid input or configuration error
  130 - Interrupted (SIGINT)

Examples:
  stave status
  cd ./stave-project && stave status
  stave status --format json

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-d, --dir` | string | Directory to inspect for Stave project context (default: `.`) |
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples

```bash
stave status
```
