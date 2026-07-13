---
title: "stave controls aliases"
sidebar_label: "controls aliases"
sidebar_position: 61
description: "List built-in semantic predicate aliases"
---

# stave controls aliases

List built-in semantic predicate aliases

## Usage

```
stave controls aliases [flags]
```

## Description

List all built-in semantic predicate aliases that can be used in
control definitions via the unsafe_predicate_alias field. Optionally
filter by category.

Exit Codes:
  0    Success
  4    Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--category` | string | Filter by category (e.g. Encryption, Logging) |

## Examples

```bash
stave controls aliases
  stave controls aliases --category Encryption
```
