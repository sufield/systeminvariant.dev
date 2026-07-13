---
title: "stave config context use"
sidebar_label: "config context use"
sidebar_position: 49
description: "Set active context"
---

# stave config context use

Set active context

## Usage

```
stave config context use <name>
```

## Description

Set the active context. Subsequent commands use this context's default
paths unless overridden by flags. Override with STAVE_CONTEXT env var.

Exit Codes:
  0    Context activated
  2    Input error (unknown context name)
  4    Internal error

## Examples

```bash
stave config context use myproject
```
