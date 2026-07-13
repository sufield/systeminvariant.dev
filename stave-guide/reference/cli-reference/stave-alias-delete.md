---
title: "stave alias delete"
sidebar_label: "alias delete"
sidebar_position: 3
description: "Delete an alias"
---

# stave alias delete

Delete an alias

## Usage

```
stave alias delete <name>
```

## Description

Delete removes an alias from user config.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples

```bash
stave alias delete ev
```
