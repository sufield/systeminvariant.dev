---
title: "stave packs show"
sidebar_label: "packs show"
sidebar_position: 131
description: "Show one built-in pack and its control IDs"
---

# stave packs show

Show one built-in pack and its control IDs

## Usage

```
stave packs show <name>
```

## Description

Show details of a single built-in control pack including its
control IDs, version, and description.

Exit Codes:
  0    Success
  2    Unknown pack name
  4    Internal error

## Examples

```bash
stave packs show s3
  stave packs show s3 --output json
```
