---
title: "stave config"
sidebar_label: "config"
sidebar_position: 43
description: "Configuration commands"
---

# stave config

Configuration commands

## Usage

```
stave config
```

## Description

Project configuration commands.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Subcommands

| Command | Description |
|---|---|
| [`stave config context`](stave-config-context.md) | Named project context commands |
| [`stave config delete`](stave-config-delete.md) | Remove a project config key (reverts to default) |
| [`stave config env`](stave-config-env.md) | Manage environment variables |
| [`stave config explain`](stave-config-explain.md) | Explain resolved config values and sources |
| [`stave config get`](stave-config-get.md) | Get a config value |
| [`stave config set`](stave-config-set.md) | Set a project config value in stave.yaml |
| [`stave config show`](stave-config-show.md) | Show effective project configuration and value sources |

