---
title: "stave config env"
sidebar_label: "config env"
sidebar_position: 51
description: "Manage environment variables"
---

# stave config env

Manage environment variables

## Usage

```
stave config env
```

## Description

Env groups commands for discovering STAVE_* environment variables
supported by Stave.

Examples:
  stave env list
  stave env list --format json

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands

| Command | Description |
|---|---|
| [`stave config env list`](stave-config-env-list.md) | List supported STAVE_* environment variables |

