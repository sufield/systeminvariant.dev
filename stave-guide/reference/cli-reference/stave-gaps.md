---
title: "stave gaps"
sidebar_label: "gaps"
sidebar_position: 110
description: "Report which observation properties are absent + what they unlock"
---

# stave gaps

Report which observation properties are absent + what they unlock

## Usage

```
stave gaps [flags]
```

## Description

Gaps produces a field-level coverage report. For each
(asset_type, property_path) the catalog declares — i.e., paths
the predicate AST walker discovers from controls that carry
applicable_asset_types — it reports:

  - missing_count / total_count    how many observed assets of
                                   the type lack the property
  - controls_blocked               which controls would fire if
                                   the property were populated
  - chains_blocked                 chain count via member-control
                                   inheritance (deduplicated)
  - max_severity                   highest severity among readers
  - is_intent_property             tags + role-type label paths
                                   sort to the top of the plan
  - remediation.type               "tag" (seconds-per-asset) or
                                   "collector" (code change)
  - remediation.command            CLI template (tag) or doc
                                   pointer (collector)

Distinct from stave readiness, which reports asset-type-level
coverage ("did the collector emit any IAM roles at all?"). Gaps
goes one level deeper ("of the 22 buckets you emitted, 19 lack
data_classification, and that's blocking 98 chains").

Inputs:
  --observations DIR    Observation snapshot directory
  --controls DIR        Control catalog (default: controls)
  --chains DIR          Chain catalog (default: chains)
  --format FORMAT       Output: text (default) | json
  --top N               Action plan entries (default: 5)

Outputs:
  stdout                The gap report
  stderr                Loader diagnostics

Exit Codes:
  0   Report produced
  2   Input error
  4   Internal error
  130 SIGINT

Caveats:
  - Controls without applicable_asset_types declarations cannot
    surface gaps here. Their count appears in the summary so the
    operator knows the report is partial; run 'stave readiness'
    to see asset-type-level coverage.
  - Intent properties are currently a hardcoded canonical set
    (data_classification, role-type, environment for storage and
    compute). A future commit reads them from
    internal/controldata/taxonomy/intent_properties.yaml.
  - Per-asset-ID listings are not emitted by default. The
    aggregate counts ("19 of 22 buckets") are the scannable
    format; a future --verbose flag will expand them.



## Flags

| Flag | Type | Description |
|---|---|---|
| `--chains` | string | chain catalog directory (default: `chains`) |
| `-i, --controls` | string | control catalog directory (default: `controls`) |
| `-f, --format` | string | output format: text \| json (default: `text`) |
| `--no-pager` | bool | never page output, even on a terminal |
| `-o, --observations` | string | observation snapshot directory (required) |
| `--quiet` | bool | suppress output (exit code only) |
| `--top` | int | number of top gaps to emphasise in the summary (default: `5`) |

## Examples

```bash
# Top 5 field-level gaps against an observation directory
  stave gaps --observations ./my-snapshot

  # Machine-readable for CI or tooling
  stave gaps --observations ./my-snapshot --format json

  # Widen the surfaced gap list to the top 10 by unlock value
  stave gaps --observations ./my-snapshot --top 10
```
