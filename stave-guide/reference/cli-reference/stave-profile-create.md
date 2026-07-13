---
title: "stave profile create"
sidebar_label: "profile create"
sidebar_position: 139
description: "Generate a starter profile YAML"
---

# stave profile create

Generate a starter profile YAML

## Usage

```
stave profile create [flags]
```

## Description

Generate a starter custom compliance profile YAML file. Edit the
generated file to add sections and control requirements.

Exit Codes:
  0   Profile created
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--description` | string | profile description |
| `--name` | string | profile name (required) |
| `--out` | string | output file path (required) |

## Examples

```bash
stave profile create --name "acme-internal" --out profiles/acme.yaml
```
