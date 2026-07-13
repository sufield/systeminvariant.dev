---
title: "stave compliance"
sidebar_label: "compliance"
sidebar_position: 42
description: "Evaluate a snapshot against a compliance framework and report coverage"
---

# stave compliance

Evaluate a snapshot against a compliance framework and report coverage

## Usage

```
stave compliance [flags]
```

## Description

Evaluate a configuration snapshot against a compliance framework.

For each framework control, Stave runs the mapped Stave controls against the
snapshot and reports one of three actionable lists:

  COVERED      framework control has Stave verification — PASS or FAIL
  GAPS         in scope, but no Stave control exists yet (build one)
  OUT OF SCOPE organizational / runtime / physical — a different team's job

A coverage percentage (verified ÷ in-scope) makes progress visible: add a
control, re-run, watch it climb.

The report also runs a mapping-integrity self-check: the framework mapping must
reference only controls that exist in the catalog, have unique framework IDs,
and carry well-formed confidence/uncovered_aspects metadata. Errors are shown
after the report; --strict turns them into a non-zero exit for CI. Use
--verify-mapping to run only this check (no snapshot needed).

Inputs:
  --framework       compliance framework to evaluate (default: aicm-v1.1)
  --snapshot        observation snapshot directory, or - for stdin
  --controls        control directory (default: built-in catalog)
  --format          text | json | markdown (default: text)
  --eval-time             Evaluation reference timestamp (RFC3339) for deterministic output
  --verify-mapping  check the mapping against the catalog and exit (no snapshot)
  --strict          fail (exit 2) on mapping-integrity errors

Outputs:
  stdout        the three-list report (+ integrity section) in the chosen format
  exit code     0 = no failures, 3 = a covered control failed,
                2 = input error or (with --strict) mapping-integrity error,
                4 = internal error

  Note: integrity errors use exit 2, not 1 — exit 1 is reserved for
  security-audit gating across the CLI.

Examples:
  stave compliance --framework aicm-v1.1 --snapshot ./my-config/
  stave compliance --snapshot ./snap --format json > coverage.json
  stave compliance --snapshot ./snap --format markdown > COMPLIANCE.md
  stave compliance --verify-mapping --strict   # CI gate, no snapshot

## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | control definitions directory (default: built-in catalog) (default: `controls`) |
| `--eval-time` | string | Evaluation reference timestamp (RFC3339) for deterministic output |
| `-f, --format` | string | output format: text, json, markdown (default: `text`) |
| `--framework` | string | compliance framework: aicm-v1.1 (default: `aicm-v1.1`) |
| `--snapshot` | string | observation snapshot directory (or - for stdin) |
| `--strict` | bool | fail (exit 2) on mapping-integrity errors (dangling refs, duplicate IDs, invalid confidence) |
| `--verify-mapping` | bool | check the framework mapping against the catalog and exit (no snapshot needed) |

## Examples

```bash
# Coverage report against the default framework
  stave compliance --snapshot ./my-config/

  # Machine-readable output for an auditor
  stave compliance --framework aicm-v1.1 --snapshot ./snap --format json > coverage.json
```
