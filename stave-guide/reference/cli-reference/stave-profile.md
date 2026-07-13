---
title: "stave profile"
sidebar_label: "profile"
sidebar_position: 138
description: "Manage compliance profiles"
---

# stave profile

Manage compliance profiles

## Usage

```
stave profile
```

## Description

Create, list, and validate custom compliance profile files.

Subcommands:
  list       Show built-in and custom profiles
  validate   Validate a profile file
  create     Generate a starter profile YAML

Exit Codes:
  0   Success
  1   Validation errors
  2   Invalid input

## Subcommands

| Command | Description |
|---|---|
| [`stave profile create`](stave-profile-create.md) | Generate a starter profile YAML |
| [`stave profile list`](stave-profile-list.md) | List available compliance profiles |
| [`stave profile validate`](stave-profile-validate.md) | Validate a profile file |

