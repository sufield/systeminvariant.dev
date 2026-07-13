---
title: "stave config context"
sidebar_label: "config context"
sidebar_position: 44
description: "Named project context commands"
---

# stave config context

Named project context commands

## Usage

```
stave config context
```

## Description

Context manages named project pointers. Context only affects default path
resolution and never changes evaluation semantics.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands

| Command | Description |
|---|---|
| [`stave config context create`](stave-config-context-create.md) | Create or update a named context |
| [`stave config context delete`](stave-config-context-delete.md) | Delete a context |
| [`stave config context list`](stave-config-context-list.md) | List available contexts |
| [`stave config context show`](stave-config-context-show.md) | Show selected context |
| [`stave config context use`](stave-config-context-use.md) | Set active context |

