---
title: "stave lint"
sidebar_label: "lint"
sidebar_position: 123
description: "Lint control files for design quality"
---

# stave lint

Lint control files for design quality

## Usage

```
stave lint <path>
```

## Description

Lint checks control design quality rules independent of schema validity.
It is deterministic, offline, and file-based.

Rules:
  - ID namespace format
  - Required metadata (name/description/remediation)
  - Determinism key constraints
  - Stable ordering hints for list-like sections

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Examples

```bash
stave lint --controls controls/s3
```
