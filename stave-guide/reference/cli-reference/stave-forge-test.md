---
title: "stave forge test"
sidebar_label: "forge test"
sidebar_position: 109
description: "Run fixture-based assertions against a control"
---

# stave forge test

Run fixture-based assertions against a control

## Usage

```
stave forge test [flags]
```

## Description

Evaluate a control predicate against pass and fail fixture files
and assert the expected verdict. Shows predicate trace on failure.

Exit Codes:
  0   All assertions passed
  1   One or more assertions failed
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--control` | string | path to control YAML file (required) |
| `--fail` | string | fixture that must produce verdict: fail |
| `--pass` | string | fixture that must produce verdict: pass |
| `--snapshot` | string | real snapshot for smoke test |
| `--verbose` | bool | show trace on pass |
| `--watch` | bool | re-run on control file change |

## Examples

```bash
stave forge test \
    --control controls/ad/CTL.AD.PASS.MINLEN.001.yaml \
    --pass testdata/fixture-pass.json \
    --fail testdata/fixture-fail.json
```
