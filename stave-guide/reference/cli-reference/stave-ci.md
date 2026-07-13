---
title: "stave ci"
sidebar_label: "ci"
sidebar_position: 32
description: "CI/CD policy and baseline commands"
---

# stave ci

CI/CD policy and baseline commands

## Usage

```
stave ci
```

## Description

Grouped CI/CD commands: baseline, gate, fix-loop, diff, fix.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands

| Command | Description |
|---|---|
| [`stave ci baseline`](stave-ci-baseline.md) | Manage baseline findings for fail-on-new CI workflows |
| [`stave ci diff`](stave-ci-diff.md) | Compare two evaluations and report new findings |
| [`stave ci fix`](stave-ci-fix.md) | Show machine-readable fix plan for a finding |
| [`stave ci fix-loop`](stave-ci-fix-loop.md) | Run apply-before/apply-after/verify in one command |
| [`stave ci gate`](stave-ci-gate.md) | Enforce CI failure policy modes from config or flags |

