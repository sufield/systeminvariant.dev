---
title: "stave inspect exposure"
sidebar_label: "inspect exposure"
sidebar_position: 120
description: "Classify resource exposure vectors"
---

# stave inspect exposure

Classify resource exposure vectors

## Usage

```
stave inspect exposure [flags]
```

## Description

Exposure reads normalized resource inputs and classifies their exposure
vectors, resolving bucket access, visibility, and trust boundaries.

Input: JSON object with resource exposure data from --file or stdin.
Output: JSON with classified exposures, visibility, and governance analysis.

Exit Codes:
  0    Success
  2    Input error
  4    Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --file` | string | Path to exposure input JSON file (default: stdin) |

## Examples

```bash
stave inspect exposure --file resources.json
  cat resources.json | stave inspect exposure
```
