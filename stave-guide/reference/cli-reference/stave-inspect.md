---
title: "stave inspect"
sidebar_label: "inspect"
sidebar_position: 116
description: "Low-level security analysis primitives"
---

# stave inspect

Low-level security analysis primitives

## Usage

```
stave inspect
```

## Description

Inspect provides direct access to Stave's domain analysis engines.

Each subcommand reads JSON from --file or stdin and outputs analysis results
as JSON. These are building blocks for custom tooling and debugging.

Subcommands:
  policy      S3 bucket policy analysis
  acl         S3 ACL grant analysis
  exposure    Exposure classification
  risk        Risk scoring
  compliance  Framework crosswalk
  aliases     Predicate alias listing

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands

| Command | Description |
|---|---|
| [`stave inspect acl`](stave-inspect-acl.md) | Analyze S3 ACL grants |
| [`stave inspect aliases`](stave-inspect-aliases.md) | List predicate aliases with metadata |
| [`stave inspect compliance`](stave-inspect-compliance.md) | Resolve compliance framework crosswalk |
| [`stave inspect exposure`](stave-inspect-exposure.md) | Classify resource exposure vectors |
| [`stave inspect policy`](stave-inspect-policy.md) | Analyze an S3 bucket policy document |
| [`stave inspect risk`](stave-inspect-risk.md) | Score risk from policy statement context |

