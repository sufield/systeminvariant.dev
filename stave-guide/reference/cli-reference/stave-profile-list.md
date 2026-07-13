---
title: "stave profile list"
sidebar_label: "profile list"
sidebar_position: 140
description: "List available compliance profiles"
---

# stave profile list

List available compliance profiles

## Usage

```
stave profile list [flags]
```

## Description

Show all built-in profiles and any custom profiles found in the
specified directory.

Exit Codes:
  0   Profiles listed

## Flags

| Flag | Type | Description |
|---|---|---|
| `--profiles-dir` | string | directory of custom profile YAML files |

## Examples

```bash
stave profile list --profiles-dir ./profiles/
```
