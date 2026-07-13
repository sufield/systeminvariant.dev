---
title: "stave ci baseline"
sidebar_label: "ci baseline"
sidebar_position: 33
description: "Manage baseline findings for fail-on-new CI workflows"
---

# stave ci baseline

Manage baseline findings for fail-on-new CI workflows

## Usage

```
stave ci baseline
```

## Description

Baseline helps CI/CD fail only on newly introduced findings.

Use:
  - baseline save: capture current findings as baseline
  - baseline check: compare current findings against a baseline

Example:
  stave apply --controls ./controls --observations ./observations --format json > output/evaluation.json
  stave ci baseline save --in output/evaluation.json --out output/baseline.json
  stave ci baseline check --in output/evaluation.json --baseline output/baseline.json

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands

| Command | Description |
|---|---|
| [`stave ci baseline check`](stave-ci-baseline-check.md) | Compare evaluation findings against baseline and detect new findings |
| [`stave ci baseline save`](stave-ci-baseline-save.md) | Save evaluation findings as baseline |

