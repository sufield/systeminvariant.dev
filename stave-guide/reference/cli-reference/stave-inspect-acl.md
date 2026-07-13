---
title: "stave inspect acl"
sidebar_label: "inspect acl"
sidebar_position: 117
description: "Analyze S3 ACL grants"
---

# stave inspect acl

Analyze S3 ACL grants

## Usage

```
stave inspect acl [flags]
```

## Description

ACL reads a JSON array of S3 ACL grants and evaluates their security
posture, identifying public, authenticated, and full-control grants.

Input: JSON array of grant objects from --file or stdin.
Output: JSON assessment with permission analysis.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --file` | string | Path to ACL grants JSON file (default: stdin) |

## Examples

```bash
stave inspect acl --file grants.json
  cat grants.json | stave inspect acl
```
