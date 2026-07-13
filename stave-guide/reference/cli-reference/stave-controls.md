---
title: "stave controls"
sidebar_label: "controls"
sidebar_position: 59
description: "Work with control definitions"
---

# stave controls

Work with control definitions

## Usage

```
stave controls
```

## Description

Controls groups commands for discovering and understanding control
definitions used by Stave.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands

| Command | Description |
|---|---|
| [`stave controls alias-explain`](stave-controls-alias-explain.md) | Show expanded predicate for an alias |
| [`stave controls aliases`](stave-controls-aliases.md) | List built-in semantic predicate aliases |
| [`stave controls explain`](stave-controls-explain.md) | Explain a specific control |
| [`stave controls list`](stave-controls-list.md) | List control IDs and names |
| [`stave controls quality`](stave-controls-quality.md) | Analyze control catalog metadata completeness and coverage gaps |
| [`stave controls search`](stave-controls-search.md) | Search the built-in control catalog |

## Examples

```bash
stave controls list --controls ./controls
  stave controls explain CTL.S3.PUBLIC.001 --controls ./controls
```
