---
title: "stave inspect aliases"
sidebar_label: "inspect aliases"
sidebar_position: 118
description: "List predicate aliases with metadata"
---

# stave inspect aliases

List predicate aliases with metadata

## Usage

```
stave inspect aliases [flags]
```

## Description

Aliases lists all registered semantic predicate aliases with their
descriptions, categories, and supported operators. Optionally filter
by category.

Output: JSON array of alias info entries.

Exit Codes:
  0    Success
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--category` | string | Filter by category (e.g. Encryption, Logging) |

## Examples

```bash
stave inspect aliases
  stave inspect aliases --category Encryption
```
