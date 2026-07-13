---
title: "stave pack"
sidebar_label: "pack"
sidebar_position: 126
description: "Concern packs — named control groupings and their data requirements"
---

# stave pack

Concern packs — named control groupings and their data requirements

## Usage

```
stave pack
```

## Description

Inspect concern packs: named, cross-cutting groupings of controls (e.g.
"entropy", "quick") plus a requirements manifest describing the exact AWS API
calls and observation signals the pack needs.

A pack is distinct from a compliance --profile (which evaluates a snapshot
against a framework) and from a filesystem domain (-i path): membership is
resolved by control ID, ID-glob pattern, and minimum severity.

Subcommands:
  list           list available packs and their control counts
  show <name>    show a pack's requirements manifest (the data you must collect)

Exit codes: 0 = success, 2 = input error (unknown pack/format), 4 = internal.

## Subcommands

| Command | Description |
|---|---|
| [`stave pack list`](stave-pack-list.md) | List available concern packs and their control counts |
| [`stave pack show`](stave-pack-show.md) | Show a pack's requirements manifest (AWS calls, signals, collector permissions) |

