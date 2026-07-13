---
title: "stave pack list"
sidebar_label: "pack list"
sidebar_position: 127
description: "List available concern packs and their control counts"
---

# stave pack list

List available concern packs and their control counts

## Usage

```
stave pack list [flags]
```

## Description

List the available concern packs and how many controls each resolves to from
the active catalog.

A concern pack is a named, cross-cutting grouping of controls (e.g. "entropy",
"quick"). Use a pack name with "stave pack show <name>" to see its data
requirements, or with "stave apply --pack <name>" to scope an evaluation.

Inputs:  --format, -f (text|json); --controls, -i (catalog to resolve against).
Outputs: pack names, titles, and resolved control counts on stdout.

Exit codes: 0 = success, 2 = input error (bad --format), 4 = internal.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | control definitions directory (default: built-in catalog) (default: `controls`) |
| `-f, --format` | string | output format: text, json (default: `text`) |

## Examples

```bash
# List all concern packs
  stave pack list

  # Machine-readable output
  stave pack list --format json
```
