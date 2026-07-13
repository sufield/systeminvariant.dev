---
title: "stave readiness"
sidebar_label: "readiness"
sidebar_position: 143
description: "Report what Stave can/can't evaluate given the supplied observations"
---

# stave readiness

Report what Stave can/can't evaluate given the supplied observations

## Usage

```
stave readiness [flags]
```

## Description

Readiness produces a pre-evaluation coverage report. It loads the
control catalog, the chain catalog, and the observation snapshots,
then reports — without running the evaluation engine — what
fraction of the catalog can fire against the observed asset surface.

Distinct from 'stave apply --dry-run', which checks input schema
validity (does it load? is the shape right?). Readiness measures
catalog effectiveness: of the ~2,600 controls and ~580 chains in
the catalog, how many can fire given what the collector captured?
Which asset types are absent? Which collection actions unlock the
most coverage?

Readiness is advisory. It does not gate 'stave apply' and it does
not run the engine. Operators can always evaluate what they have,
even if the snapshot exercises only a slice of the catalog.

Inputs:
  --observations DIR    Observation snapshot directory
  --controls DIR        Control catalog (default: embedded built-ins)
  --chains DIR          Chain catalog (default: chains)
  --format FORMAT       Output: text (default) | json
  --top N               Action plan entries (default: 5)

Outputs:
  stdout                The readiness report
  stderr                Loader diagnostics

Exit Codes:
  0   Report produced
  2   Input error
  4   Internal error
  130 SIGINT

Caveats:
  - Phase 1 measures asset-type coverage only. The intent
    dimension (data_classification tags, role-type labels,
    vendor_registry presence) and the foundational dimension
    (CloudTrail enabled, IMDSv2 enforced, GuardDuty baseline)
    are deferred pending catalog metadata.
  - Controls without applicable_asset_types declarations fall
    in the 'indeterminate' bucket. The analyzer cannot
    statically classify them; the engine fires them on any
    asset at evaluation time.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--chains` | string | chain catalog directory (default: `chains`) |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |
| `--no-pager` | bool | never page output, even on a terminal |
| `-o, --observations` | string | observation snapshot directory (required) |
| `--quiet` | bool | suppress output (exit code only) |
| `--top` | int | number of action-plan entries to surface (default: `5`) |

## Examples

```bash
# Default text report against an observation directory
  stave readiness --observations ./my-snapshot

  # Machine-readable for CI or tooling
  stave readiness --observations ./my-snapshot --format json

  # Widen the action plan to the top 10 unblocking asset types
  stave readiness --observations ./my-snapshot --top 10
```
