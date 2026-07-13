---
title: "stave capabilities catalog taxonomy"
sidebar_label: "capabilities catalog taxonomy"
sidebar_position: 21
description: "List taxonomy categories with control counts"
---

# stave capabilities catalog taxonomy

List taxonomy categories with control counts

## Usage

```
stave capabilities catalog taxonomy [flags]
```

## Description

Taxonomy lists all security concept categories found in the control
catalog, with the number of controls tagged in each category.

Inputs:
  --format F       text (default) | json
  --controls DIR   Control catalog directory (default: controls)

Exit codes:
  0   Success
  4   Internal error


## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |

## Examples

```bash
stave catalog taxonomy
  stave catalog taxonomy --format json | jq '.[] | select(.count > 100)'
```
