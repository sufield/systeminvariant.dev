---
title: "stave ci baseline save"
sidebar_label: "ci baseline save"
sidebar_position: 35
description: "Save evaluation findings as baseline"
---

# stave ci baseline save

Save evaluation findings as baseline

## Usage

```
stave ci baseline save [flags]
```

## Description

Save captures the current evaluation findings as a baseline snapshot.
Subsequent runs of 'baseline check' compare new findings against this
baseline so CI only fails on newly introduced violations.

Inputs:
  --in     Path to evaluation JSON from 'stave apply --format json'
  --out    Output path for the baseline file (default: output/baseline.json)

Exit Codes:
  0    Baseline saved successfully
  2    Input error (missing or invalid evaluation file)
  4    Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--in` | string | Path to evaluation JSON (required) |
| `--out` | string | Path to baseline output JSON (default: `output/baseline.json`) |

## Examples

```bash
stave ci baseline save --in output/evaluation.json
  stave ci baseline save --in output/evaluation.json --out baselines/2026-03.json
```
