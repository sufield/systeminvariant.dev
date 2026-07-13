---
title: "stave config explain"
sidebar_label: "config explain"
sidebar_position: 53
description: "Explain resolved config values and sources"
---

# stave config explain

Explain resolved config values and sources

## Usage

```
stave config explain
```

## Description

Explain is an alias of "stave config show". It prints effective values and
their resolution source (flag/env/project/user/default).

Exit Codes:
  0   - Success
  2   - Input error
  4   - Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples

```bash
stave config explain max_unsafe
```
