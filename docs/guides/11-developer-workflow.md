---
title: "Developer Workflow"
sidebar_label: "Developer Workflow"
sidebar_position: 11
description: "Day-to-day developer workflow: capture snapshots, validate inputs, evaluate controls, interpret findings, fix violations, and integrate with CI/CD."
---

# Developer Workflow

The developer workflow is the day-to-day path for engineers who already
know what infrastructure they have and want to find and fix safety
violations. Unlike the [compliance workflow](09-compliance-workflow.md)
(which starts with "what should I collect?"), this workflow starts with
observations you already have.

## Overview

```
Capture            Validate          Evaluate           Interpret          Fix
snapshots          inputs            controls           findings           violations
   ↓                  ↓                 ↓                  ↓                 ↓
AWS CLI / jq      stave validate    stave apply        Read evidence     Remediate,
Steampipe                                              and fix plans     re-evaluate
Terraform
```

Four steps. Capture → validate → evaluate → fix. Then repeat.

## Step 1: Capture Observation Snapshots

Any tool that produces JSON works. Stave never calls cloud APIs — you
bring the data.

### AWS CLI + jq

```bash
#!/bin/bash
SNAPSHOT_DIR="./aws-snapshot-$(date +%Y-%m-%d)"
mkdir -p "$SNAPSHOT_DIR"

aws s3api list-buckets > "$SNAPSHOT_DIR/list-buckets.json"

for bucket in $(jq -r '.Buckets[].Name' "$SNAPSHOT_DIR/list-buckets.json"); do
  aws s3api get-public-access-block --bucket "$bucket" \
    > "$SNAPSHOT_DIR/$bucket-public-access.json" 2>/dev/null || true
done
```

Then convert to `obs.v0.1` format:

```bash
stave ingest --profile mvp1-s3 --input "$SNAPSHOT_DIR" > observations/$(date -u +%Y-%m-%dT%H:%M:%SZ).json
```

### Steampipe

```bash
steampipe query "select * from aws_s3_bucket" --output json \
  | stave ingest --profile steampipe-s3 > observations/$(date -u +%Y-%m-%dT%H:%M:%SZ).json
```

### Key rules

- **At least 2 snapshots** — duration-based controls need two points in
  time. One snapshot only supports `unsafe_state` controls.
- **Use real timestamps** — `captured_at` must reflect when the data was
  actually collected.
- **One file per snapshot** — each file is one point-in-time view.

## Step 2: Validate Inputs

Before evaluation, check that your inputs are well-formed:

```bash
stave validate --controls ./controls --observations ./observations
```

| Exit code | Meaning |
|-----------|---------|
| 0 | Inputs are valid |
| 2 | Schema errors — fix before continuing |

### Common validation warnings

| Warning | What to do |
|---------|-----------|
| `SINGLE_SNAPSHOT` | Add a second snapshot for duration tracking |
| `SPAN_LESS_THAN_MAX_UNSAFE` | Add older snapshots or reduce `--max-unsafe` |
| `CONTROL_NEVER_MATCHES` | Usually fine — means all resources are safe for that control |

### Validate a single file

```bash
stave validate --in observation.json --kind observation
```

### Strict mode

Promote warnings to errors:

```bash
stave validate --controls ./controls --observations ./observations --strict
```

## Step 3: Evaluate

```bash
stave apply \
  --controls ./controls \
  --observations ./observations \
  --max-unsafe 168h \
  --eval-time 2026-07-03T00:00:00Z
```

| Exit code | Meaning |
|-----------|---------|
| 0 | No violations — all resources are safe |
| 3 | Violations found — review findings in stdout |
| 2 | Input error — run `stave validate` |

### Common flags

| Flag | Purpose | Example |
|------|---------|---------|
| `--max-unsafe` | How long a resource can be unsafe before it's a violation | `168h`, `7d`, `0s` |
| `--eval-time` | Fix evaluation time for deterministic output | `2026-07-03T00:00:00Z` |
| `--format` | Output format | `text`, `json`, `sarif` |
| `--quiet` | Exit code only, no output | |
| `--trace` | Write evaluation trace for debugging | `trace.json` |
| `--sanitize` | Strip infrastructure identifiers from output | |

### Scope to specific controls

```bash
# Use a specific control pack
stave apply --controls controls/s3 --observations ./observations --max-unsafe 7d

# List available built-in controls
stave controls list --built-in

# List curated packs
stave packs list
stave packs show s3
```

### State-based checks (no duration)

For checks that should fire immediately (not after a time window):

```bash
stave apply --controls ./controls --observations ./observations --max-unsafe 0s
```

## Step 4: Interpret Findings

Each finding answers four questions:

1. **Which control failed?** → `control_id`
2. **Which resource failed?** → `resource_id`
3. **What evidence proves it?** → `evidence`
4. **What's the fix?** → `fix_plan`

### Anatomy of a finding

```json
{
  "control_id": "CTL.S3.PUBLIC.001",
  "resource_id": "res:aws:s3:bucket:example",
  "evidence": {
    "unsafe_duration_hours": 240,
    "threshold_hours": 168,
    "matched_properties": [
      {"path": "properties.storage.visibility.public_read", "value": true}
    ],
    "why_now": "Resource has been unsafe for 240 hours (threshold: 168 hours)."
  },
  "fix_plan": {
    "actions": [
      {"action_type": "set", "path": "properties.storage.controls.block_public_policy", "value": true}
    ]
  }
}
```

### Filter findings

```bash
# Critical findings only
stave apply --controls ./controls --observations ./observations \
  --format json | jq '.findings[] | select(.severity == "critical")'

# Findings for a specific resource
stave apply --controls ./controls --observations ./observations \
  --format json | jq '.findings[] | select(.resource_id | contains("my-bucket"))'
```

### Read the summary

```bash
stave apply --controls ./controls --observations ./observations \
  --format json | jq '.summary'
```

```json
{
  "resources_evaluated": 22,
  "attack_surface": 3,
  "violations": 1
}
```

- **resources_evaluated** — total resources seen across snapshots
- **attack_surface** — resources currently in an unsafe state
- **violations** — resources that have been unsafe longer than the threshold

## Step 5: Fix and Re-evaluate

### Apply fixes

Use the `fix_plan` from findings to guide remediation. Fix the
infrastructure, then capture a new snapshot and re-evaluate:

```bash
# Fix the issue in AWS
aws s3api put-public-access-block --bucket my-bucket \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Capture a new snapshot
# ... (your capture script)

# Re-evaluate — violation should be gone
stave apply --controls ./controls --observations ./observations \
  --max-unsafe 168h --eval-time 2026-07-04T00:00:00Z
```

### Use enforce fix for automated remediation

```bash
stave enforce fix \
  --controls ./controls \
  --observations ./observations \
  --format json
```

### Dry-run first

Check what `apply` would do without running the full evaluation:

```bash
stave apply --dry-run --controls ./controls --observations ./observations
```

## CI/CD Integration

### Basic pipeline step

```bash
stave validate --controls ./controls --observations ./observations --strict
stave apply \
  --controls ./controls \
  --observations ./observations \
  --max-unsafe 168h \
  --eval-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --format json > evaluation.json
```

Exit code 3 (violations found) fails the pipeline — that's the intended
behavior.

### SARIF for GitHub Advanced Security

```bash
stave apply --controls ./controls --observations ./observations --format sarif > results.sarif
```

Upload `results.sarif` to GitHub's code scanning API for findings in
pull request annotations.

### Pre-commit hook

```bash
# .pre-commit-config.yaml
stave validate --controls ./controls --observations ./observations --strict
```

See the [CI/CD integration guide](02-running-in-ci-cd.md) for complete
pipeline examples.

## When Something Goes Wrong

If results are unexpected, use the [debugging workflow](10-debugging-workflow.md):

```bash
# Quick check: inputs OK?
stave validate --controls ./controls --observations ./observations

# Data coverage complete?
stave readiness --observations ./observations
stave gaps --observations ./observations

# Why is this happening?
stave diagnose --controls ./controls --observations ./observations

# Clause-by-clause trace
stave trace --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket
```

## Developer vs Compliance Workflow

| Concern | Developer | Compliance |
|---------|-----------|------------|
| Starting point | Already have observations | Start with `stave discover` |
| Coverage check | Usually skip | Essential (`readiness` + `gaps`) |
| Profile | Default (all controls) or specific pack | Framework-specific (`hipaa`, `pci_dss_v4`) |
| Output | Text or JSON for human review | OSCAL, OCSF, SARIF for auditors |
| Time focus | Latest snapshot | Multiple snapshots proving continuous compliance |
| Goal | Find and fix violations | Produce evidence packages |

See the [compliance workflow](09-compliance-workflow.md) for the
compliance officer's path.

## Quick Reference

```bash
# Capture (your own tools)
stave ingest --profile mvp1-s3 --input ./raw > observations/snapshot.json

# Validate
stave validate --controls ./controls --observations ./observations

# Evaluate
stave apply --controls ./controls --observations ./observations --max-unsafe 168h

# Interpret
stave apply ... --format json | jq '.findings[]'

# Fix, re-capture, re-evaluate
stave apply --controls ./controls --observations ./observations --max-unsafe 168h

# Debug unexpected results
stave diagnose --controls ./controls --observations ./observations
stave trace --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket
```
