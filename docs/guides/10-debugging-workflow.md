---
title: "Debugging Workflow"
sidebar_label: "Debugging Workflow"
sidebar_position: 10
description: "How to debug unexpected findings or missing findings using Stave's six diagnostic tools."
---

# Debugging Workflow

When Stave produces a finding you don't expect — or doesn't produce one
you do expect — six tools escalate from broad to narrow. Work down the
list; most problems resolve in the first three steps.

## Overview

```
stave doctor     stave validate    readiness / gaps    stave diagnose    stave trace     stave explain
     ↓                ↓                  ↓                  ↓                ↓                ↓
Environment      Input files        Data coverage      Why results      Clause-by-       What a control
ready?           well-formed?       complete?          are unexpected   clause walk      needs
```

## Step 1: Check Your Environment

```bash
stave doctor
```

Verifies local prerequisites — tools, permissions, project structure.
Run once on first setup or after upgrading. If `doctor` reports issues,
fix them before investigating findings.

## Step 2: Validate Inputs

```bash
# Validate everything
stave validate --controls ./controls --observations ./observations

# Validate a single file
stave validate --in observation.json --kind observation

# Strict mode: warnings become errors
stave validate --controls ./controls --observations ./observations --strict
```

Catches problems before evaluation runs:
- Schema violations (wrong `schema_version`, missing required fields)
- Timestamp issues (`captured_at` in the future, out-of-order snapshots)
- Cross-file inconsistencies (duplicate resource IDs, bundle format mismatches)
- Single-snapshot warnings (duration-based controls need at least 2 snapshots)

If `validate` passes, your inputs are structurally correct. The problem
is either missing data (Step 3) or evaluation logic (Step 4).

## Step 3: Check Data Coverage

Two commands, two levels of detail.

### Asset-type coverage

```bash
stave readiness --observations ./observations
```

Reports which asset types you captured and which are missing entirely.
If an asset type is absent, controls targeting it cannot fire.

### Field-level coverage

```bash
stave gaps --observations ./observations
```

Reports which fields are missing from captured assets. A control that
checks `storage.encryption.at_rest_enabled` won't fire if that field
doesn't exist in the observation.

```bash
# See more gaps
stave gaps --observations ./observations --top 10
```

Gaps ranks missing fields by unlock value — how many controls they
would enable.

### Common resolution

If `readiness` or `gaps` shows missing data, the fix is to capture more.
Use `stave explain` (Step 6) to see exactly what fields a specific
control needs.

## Step 4: Diagnose Unexpected Results

```bash
# Broad diagnosis
stave diagnose --controls ./controls --observations ./observations \
  --eval-time 2026-07-03T00:00:00Z

# Compare against previous output
stave diagnose --controls ./controls --observations ./observations \
  --previous-output eval.json
```

`diagnose` analyzes controls + observations and explains why results
are unexpected:
- Expected violations but got none (threshold too high? resource became
  safe between snapshots?)
- Unexpected violations (stricter threshold? property changed?)
- Empty findings (no matching asset types?)
- Clock skew (is `--eval-time` set correctly?)

### Deep-dive on one control + asset

```bash
stave diagnose finding --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket \
  --controls ./controls --observations ./observations
```

### Remediation playbook

```bash
stave diagnose explain --finding-id <id> --depth detailed --format markdown
```

Generates a remediation playbook from assessment output, including chain
context and deactivation order.

## Step 5: Trace Predicate Evaluation

When you need to see exactly which clause passed or failed:

### Option A: Inline trace

```bash
stave trace --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket \
  --controls ./controls --observations ./observations
```

Walks the predicate clause-by-clause against one asset in one snapshot,
printing the field value, operator, and PASS/FAIL for each clause.

### Option B: Full evaluation trace

```bash
stave apply --controls ./controls --observations ./observations \
  --eval-time 2026-07-03T00:00:00Z \
  --trace trace.json \
  --format json > eval.json
```

Then search the trace file:

```bash
# Find a specific assessment
jq '.assessments[] | select(.policy_id == "CTL.S3.PUBLIC.001" and .resource_id == "my-bucket")' trace.json
```

The trace shows every evaluation step:

```json
{
  "verdict": "VIOLATION",
  "steps": [
    {"name": "exemption_check", "result": {"exempted": false}},
    {"name": "predicate_evaluation", "input": {"currently_unsafe": true}, "result": {"matched": true}},
    {"name": "threshold_check", "input": {"threshold_hours": 168}, "result": {"exceeds_threshold": true}}
  ]
}
```

### Reading the trace

| Step | What it tells you |
|------|-------------------|
| `exemption_check` | Was the asset exempted from this control? |
| `predicate_evaluation` | Did the unsafe predicate match? (`currently_unsafe: true` = asset is unsafe right now) |
| `threshold_check` | Has the asset been unsafe long enough to trigger a finding? |

If the predicate matched but you believe the asset is safe, check the
observation property the control references:

```bash
jq '.assets[] | select(.id == "my-bucket") | .properties.storage.access' observations/latest.json
```

## Step 6: Understand What a Control Needs

```bash
stave explain CTL.S3.PUBLIC.001
```

Prints:
- Which field paths the control checks
- The operator and expected value for each clause
- A minimal `obs.v0.1` snippet you can use as a starting point

Use this when `gaps` tells you a field is missing and you need to know
exactly what to capture.

## Decision Tree

```
Problem: Control didn't fire
  ├─ stave validate → errors?
  │     └─ Fix input files
  ├─ stave readiness → asset type missing?
  │     └─ Capture that asset type
  ├─ stave gaps → field missing?
  │     └─ Capture that field (stave explain shows what's needed)
  ├─ stave diagnose → threshold too high?
  │     └─ Lower --max-unsafe or add older snapshots
  └─ stave trace → predicate didn't match?
        └─ Check observation values vs control YAML

Problem: Unexpected violation
  ├─ stave trace → which clause matched?
  │     └─ Check the observation property value
  ├─ stave diagnose → threshold / clock skew?
  │     └─ Adjust --eval-time or --max-unsafe
  └─ stave validate → property type mismatch?
        └─ Fix observation (string "false" vs boolean false)

Problem: Non-deterministic results
  └─ Add --eval-time to fix the evaluation time
     diff two runs with identical --eval-time → output must be identical
```

## Quick Reference

```bash
# Environment OK?
stave doctor

# Inputs valid?
stave validate --controls ./controls --observations ./observations

# Data complete?
stave readiness --observations ./observations
stave gaps --observations ./observations --top 10

# Why is this happening?
stave diagnose --controls ./controls --observations ./observations

# Deep-dive on one finding
stave diagnose finding --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket

# Clause-by-clause trace
stave trace --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket

# What does this control need?
stave explain CTL.S3.PUBLIC.001

# Full trace file for jq analysis
stave apply --controls ./controls --observations ./observations --trace trace.json
```
