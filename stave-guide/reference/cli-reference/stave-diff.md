---
title: "stave diff"
sidebar_label: "diff"
sidebar_position: 72
description: "Compare two observation snapshots or control catalogs"
---

# stave diff

Compare two observation snapshots or control catalogs

## Usage

```
stave diff [flags]
```

## Description

Compare two observation snapshots or two control catalog versions.

Snapshot mode (default):
  Shows property changes, new/removed assets between two snapshots.

Catalog mode (--catalogs):
  Shows new/removed controls and severity changes between catalog versions.

Inputs:
  --snapshot-before PATH   Earlier snapshot JSON
  --snapshot-after PATH    Later snapshot JSON
  --catalogs               Compare control catalogs instead of snapshots
  --catalog-before PATH    Earlier catalog directory (with --catalogs)
  --catalog-after PATH     Later catalog directory (with --catalogs)

Exit Codes:
  0   Diff produced
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--catalog-after` | string | path to after catalog (with --catalogs) |
| `--catalog-before` | string | path to before catalog (with --catalogs) |
| `--catalogs` | bool | compare control catalogs instead of snapshots |
| `-f, --format` | string | output format: text \| json (default: `text`) |
| `--no-pager` | bool | never page output, even on a terminal |
| `--snapshot-after` | string | path to after snapshot JSON |
| `--snapshot-before` | string | path to before snapshot JSON |

## Examples

```bash
stave diff --snapshot-before snap1.json --snapshot-after snap2.json
  stave diff --catalogs --catalog-before ./controls-v1/ --catalog-after ./controls-v2/
```
