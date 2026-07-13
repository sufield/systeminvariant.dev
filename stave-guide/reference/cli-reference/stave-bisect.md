---
title: "stave bisect"
sidebar_label: "bisect"
sidebar_position: 11
description: "Find when a control was first violated"
---

# stave bisect

Find when a control was first violated

## Usage

```
stave bisect [flags]
```

## Description

Bisect searches through timestamped snapshot history to find the exact
point in time when a control was first violated. Like git bisect for commits,
it binary-searches through a snapshot archive.

Modes:
  bisect (default)    Binary search — O(log N), finds the transition into the
                      current violation window. Fast for large archives.
  scan                Linear scan — O(N), finds ALL violation windows including
                      the earliest. Correct for non-monotonic histories.

Inputs:
  --controls, -i      Path to control definitions directory
  --observations, -o  Path to snapshot archive directory
  --control-id        ID of the single control to bisect (required)
  --mode              Search strategy: bisect or scan (default: bisect)
  --format, -f        Output format: text or json (default: text)
  --eval-time               Evaluation reference timestamp (RFC3339) for deterministic evaluation
  --resource          Scope to a specific resource ARN (optional)

Output:
  Text mode shows the transition point with a property delta between
  the last PASS and first VIOLATION snapshots. Timestamps use "between
  A and B" language — Stave operates on snapshots and cannot attribute
  changes to specific events within a window.

Exit Codes:
  0   No violation found in the archive
  2   Input error (missing flags, no snapshots)
  3   Violation window(s) found
  4   Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--control-id` | string | Control ID to bisect (required) |
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `--eval-time` | string | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock. |
| `-f, --format` | string | Output format: text or json (default: `text`) |
| `--mode` | string | Search strategy: bisect or scan (default: `bisect`) |
| `-o, --observations` | string | Path to snapshot archive directory (default: `observations`) |
| `--resource` | string | Scope to a specific resource ARN |

## Examples

```bash
# Find when a bucket became public
  stave bisect -i controls/s3 -o snapshots/ --control-id CTL.S3.PUBLIC.001

  # Scan for all violation windows over 12 months
  stave bisect -i controls/s3 -o snapshots/ --control-id CTL.S3.PUBLIC.001 --mode scan

  # Scope to a specific resource
  stave bisect -i controls/ -o snapshots/ --control-id CTL.S3.ENCRYPT.001 --resource arn:aws:s3:::prod-bucket
```
