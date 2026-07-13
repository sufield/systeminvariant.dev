---
title: "Severity Thresholds"
sidebar_label: "Severity Thresholds"
sidebar_position: 3
description: "How severity levels work and how to tune duration thresholds."
---

# Severity Thresholds

This page explains how to tune duration thresholds and per-control overrides. For reading evaluation output (JSON shape, finding fields, fix plans) see [Output and Severity](output-and-severity.md).

Stave has two related but distinct concepts: control severity (risk classification) and duration thresholds (how long a resource can be unsafe before it's a violation).

## Severity Levels

Each control has a `severity` field set in its YAML definition:

| Severity | Count | Meaning |
|----------|-------|---------|
| `critical` | 19 controls | Immediate risk. PHI exposure, public write, missing encryption for sensitive data. |
| `high` | 22 controls | Significant gap. Public read, missing logging, no versioning on important data. |
| `medium` | 4 controls | Defense-in-depth. Missing lifecycle rules, unversioned buckets, unintended listing. |

Severity is informational — it does not affect whether Stave reports a violation. All control violations are reported regardless of severity. Use severity to prioritize remediation in your workflow.

## Duration Thresholds

For `unsafe_duration` controls, the `--max-unsafe` flag sets how long a resource can remain in an unsafe state before Stave reports a violation:

```bash
# 7-day threshold (default)
stave apply --controls ./ctl --observations ./obs --max-unsafe 168h

# 72-hour threshold (stricter)
stave apply --controls ./ctl --observations ./obs --max-unsafe 72h

# Zero tolerance (any current violation)
stave apply --controls ./ctl --observations ./obs --max-unsafe 0s

# 30-day threshold (more lenient)
stave apply --controls ./ctl --observations ./obs --max-unsafe 30d
```

**Duration format:** Supports hours (`72h`), days (`7d`), and combinations (`1d12h`).

## Per-Control Overrides

Individual controls can set their own threshold via `params.max_unsafe_duration`, overriding the CLI default:

```yaml
dsl_version: ctrl.v1
id: CTL.S3.PUBLIC.004
name: No Public Read via ACL
type: unsafe_duration
params:
  max_unsafe_duration: "0h"  # Zero tolerance for PHI ACL exposure
unsafe_predicate:
  any:
    - field: properties.storage.visibility.public_read_via_acl
      op: eq
      value: true
```

With this configuration, `CTL.S3.PUBLIC.004` always uses a zero-tolerance threshold, regardless of the `--max-unsafe` CLI flag.

## Recurrence Thresholds

For `unsafe_recurrence` controls, thresholds are set in the control YAML:

```yaml
params:
  recurrence_limit: 3    # Maximum allowed episodes
  window_days: 30         # Within this time window
```

A resource that toggles between safe and unsafe 3 or more times within 30 days triggers a violation.

## Choosing Thresholds

| Use Case | Recommended `--max-unsafe` |
|----------|---------------------------|
| PHI/healthcare data | `0s` (zero tolerance) |
| Production infrastructure | `24h` to `72h` |
| Pre-production / staging | `7d` (default) |
| Development environments | `30d` or skip evaluation |
