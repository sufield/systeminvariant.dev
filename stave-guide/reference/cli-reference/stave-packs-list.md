---
title: "stave packs list"
sidebar_label: "packs list"
sidebar_position: 130
description: "List available built-in packs"
---

# stave packs list

List available built-in packs

## Usage

```
stave packs list
```

## Description

List all built-in control packs embedded in the binary. Each pack
is a curated set of controls for a specific domain (e.g. s3).

Exit Codes:
  0    Success
  4    Internal error

## Examples

```bash
stave packs list
  stave packs list --output json
```
