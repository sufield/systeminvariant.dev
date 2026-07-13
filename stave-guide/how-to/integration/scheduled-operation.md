---
title: "Scheduled Operation"
sidebar_label: "Scheduled Operation"
sidebar_position: 3
description: "Run Stave on a schedule: cron + snapshot capture + diff between consecutive runs."
---

# Scheduled Operation

Run Stave on a cadence to detect configuration drift between
snapshots. This turns a one-shot assessment into continuous
monitoring — the "Black Box Flight Recorder" pattern.

## The pattern

```
Cron job (daily/weekly):
  1. Capture a fresh snapshot
  2. Run stave apply against it
  3. Run stave diff against the previous snapshot
  4. Alert on new findings or regressions
```

## Example: daily cron

```bash
#!/bin/bash
set -euo pipefail

SNAPSHOT_DIR="./observations"
TODAY=$(date +%Y-%m-%d)
LATEST=$(ls -1 "$SNAPSHOT_DIR"/*.json 2>/dev/null | sort | tail -1)

# 1. Capture
./collect.sh > "$SNAPSHOT_DIR/$TODAY.json"

# 2. Evaluate
stave apply --observations "$SNAPSHOT_DIR" --format json > "assessments/$TODAY.json"

# 3. Diff against previous (if one exists)
if [ -n "$LATEST" ]; then
  stave diff --snapshot-before "$LATEST" \
             --snapshot-after "$SNAPSHOT_DIR/$TODAY.json" \
             --format json > "diffs/$TODAY.json"
fi

# 4. Alert on new findings
NEW_COUNT=$(jq '.new | length' "diffs/$TODAY.json" 2>/dev/null || echo "0")
if [ "$NEW_COUNT" -gt 0 ]; then
  echo "ALERT: $NEW_COUNT new findings detected" >&2
  # Send to Slack, PagerDuty, email, etc.
fi
```

## With GitHub Actions (scheduled)

```yaml
name: Stave Scheduled Evaluation
on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly, Monday 6am UTC

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: sufield/stave-action@v1
        with:
          observations: ./observations/
          format: json
          output: assessments/latest.json
      - name: Diff against previous
        run: |
          stave diff --snapshot-before observations/previous.json \
                     --snapshot-after observations/latest.json
```

## Retroactive evaluation

When new controls ship (e.g., Unit 42 bucket hijacking, OAuth
namespace controls), re-run against your snapshot archive:

```bash
# "Were we exposed to this in March?"
stave apply --observations ./archive/2026-03/ --format json
```

New controls evaluated against old snapshots answer questions about
historical exposure. Every event-driven control release gives
operationalized users a reason to re-run their archive.

## What this achieves

- **Drift detection** — configuration changes that introduce findings
  are caught within one cycle
- **Regression prevention** — a fix that gets reverted is detected on
  the next snapshot
- **Audit continuity** — the evidence archive demonstrates continuous
  monitoring with no gaps (required for SOC 2, HIPAA)
- **No agent, no runtime** — runs entirely in your infrastructure on
  your schedule
