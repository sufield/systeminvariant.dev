---
title: "stave config delete"
sidebar_label: "config delete"
sidebar_position: 50
description: "Remove a project config key (reverts to default)"
---

# stave config delete

Remove a project config key (reverts to default)

## Usage

```
stave config delete <key>
```

## Description

Delete removes a key from stave.yaml, reverting it to the built-in default.
Supported keys match those of 'config set'.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples

```bash
stave config delete max_unsafe
```
