---
title: "stave forge scaffold"
sidebar_label: "forge scaffold"
sidebar_position: 108
description: "Generate test fixtures from a real snapshot"
---

# stave forge scaffold

Generate test fixtures from a real snapshot

## Usage

```
stave forge scaffold [flags]
```

## Description

Generate minimal pass and fail fixture files for use with
stave forge test. Extracts only properties referenced by the
control's predicate.

Exit Codes:
  0   Fixtures generated
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--control` | string | path to control YAML file (required) |
| `--out-dir` | string | output directory (default: testdata/<control_id>/) |
| `--snapshot` | string | path to snapshot file (required) |

## Examples

```bash
stave forge scaffold \
    --control controls/ad/CTL.AD.PASS.MINLEN.001.yaml \
    --snapshot snapshots/acme-dc.json
```
