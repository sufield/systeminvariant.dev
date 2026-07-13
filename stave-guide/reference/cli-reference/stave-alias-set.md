---
title: "stave alias set"
sidebar_label: "alias set"
sidebar_position: 5
description: "Create or update an alias"
---

# stave alias set

Create or update an alias

## Usage

```
stave alias set <name> <command>
```

## Description

Set creates or updates a command alias.

Alias names must match [a-zA-Z0-9_-]+ and must not collide with
existing command names.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples

```bash
stave alias set ev "apply --controls controls/s3 --eval-time 2026-01-11T00:00:00Z"
```
