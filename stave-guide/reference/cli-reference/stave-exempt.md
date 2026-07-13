---
title: "stave exempt"
sidebar_label: "exempt"
sidebar_position: 76
description: "Manage risk acceptances (acknowledgments, exceptions, exemptions)"
---

# stave exempt

Manage risk acceptances (acknowledgments, exceptions, exemptions)

## Usage

```
stave exempt
```

## Description

CRUD interface for managing formal risk acceptance records.

Subcommands:
  acknowledge   Add a formal risk acceptance
  except        Add an operational suppression
  exempt        Add a scope exclusion
  list          List all active entries
  remove        Mark an acknowledgment as revoked
  upcoming      Show entries approaching expiry
  validate      Validate the acceptance file
  suggest       Suggest exemptions for chronic/oscillating findings

## Subcommands

| Command | Description |
|---|---|
| [`stave exempt acknowledge`](stave-exempt-acknowledge.md) | Add a formal risk acceptance |
| [`stave exempt asset`](stave-exempt-asset.md) | Add a scope exclusion (exemption) |
| [`stave exempt except`](stave-exempt-except.md) | Add an operational suppression |
| [`stave exempt export`](stave-exempt-export.md) | Export risk register as OSCAL POA&M |
| [`stave exempt history`](stave-exempt-history.md) | Show full audit trail including expired entries |
| [`stave exempt list`](stave-exempt-list.md) | List all active risk acceptances |
| [`stave exempt remove`](stave-exempt-remove.md) | Mark an acknowledgment as revoked |
| [`stave exempt suggest`](stave-exempt-suggest.md) | Suggest exemptions for chronic/oscillating findings |
| [`stave exempt upcoming`](stave-exempt-upcoming.md) | Show acceptances approaching expiry |
| [`stave exempt validate`](stave-exempt-validate.md) | Validate the acceptance file |

