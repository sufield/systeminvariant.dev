---
title: "stave config context delete"
sidebar_label: "config context delete"
sidebar_position: 46
description: "Delete a context"
---

# stave config context delete

Delete a context

## Usage

```
stave config context delete <name>
```

## Description

Delete a named context from the user configuration. If the deleted
context was active, no context will be selected until you run
'config context use' again.

Exit Codes:
  0    Context deleted
  2    Input error (unknown context name)
  4    Internal error

## Examples

```bash
stave config context delete myproject
```
