---
title: "Common Issues"
sidebar_label: "Common Issues"
sidebar_position: 1
description: "Troubleshooting guide for common Stave errors and unexpected behavior."
---

# Common Issues

This page covers error messages you may encounter when running Stave and how to resolve them.

## Input Errors (Exit Code 2)

### "schema validation failed" / "schema validation error"

**Cause:** An observation or control file doesn't conform to the expected JSON Schema.

**Resolution:** Check that:
- Observations use `"schema_version": "obs.v0.1"` (not `obs.v1` or other variants)
- Controls use `"dsl_version": "ctrl.v1"`
- Observation files use one of two accepted shapes: flat per-timestamp JSON (one snapshot per file) or a bundle file with `{"schema_version":"obs.v0.1","snapshots":[…]}`. The directory loader detects bundle-shaped files and routes them through the bundle parser; per-timestamp files run the strict `obs.v0.1` schema (`additionalProperties: false`).
- All required fields are present (`schema_version`, `captured_at`, `resources` for observations; `dsl_version`, `id`, `name`, `description`, `unsafe_predicate` for controls)

### "no controls in `<path>` (expected .yaml files with dsl_version: ctrl.v1)"

**Cause:** The controls directory is empty or contains no valid `.yaml`/`.yml` files.

**Resolution:** Verify the path contains control YAML files and that they have `dsl_version: ctrl.v1`.

### "no snapshots in `<path>` (expected .json files with schema_version: obs.v0.1)"

**Cause:** The observations directory is empty or contains no valid `.json` files.

**Resolution:** Verify the path contains observation JSON files and that they have `schema_version: obs.v0.1`.

### "invalid control ID format"

**Cause:** A control's `id` field doesn't match the pattern `CTL.<DOMAIN>.<CATEGORY>.<SEQ>`.

**Resolution:** Use the format `CTL.S3.PUBLIC.001`, `CTL.EXP.DURATION.001`, etc. The ID must match the regex `^CTL\.[A-Z0-9]+\.[A-Z0-9]+(\.[A-Z0-9]+)*\.[0-9]+$`.

### "--eval-time must be >= latest snapshot timestamp"

**Cause:** The `--eval-time` value is earlier than the most recent observation's `captured_at`.

**Resolution:** Set `--eval-time` to a time at or after the latest snapshot timestamp.

## Validation Warnings

Run `stave validate` to see these warnings before evaluation.

### "SINGLE_SNAPSHOT — Add at least 2 snapshots to enable duration tracking"

**Cause:** Only one observation file was found. Duration-based controls need multiple snapshots to calculate how long a resource has been unsafe.

**Resolution:** Add at least two observation files with different `captured_at` timestamps.

### "SPAN_LESS_THAN_MAX_UNSAFE — Add older snapshots or reduce --max-unsafe"

**Cause:** The time span between your oldest and newest snapshots is shorter than the `--max-unsafe` threshold.

**Resolution:** Either add older snapshots or reduce `--max-unsafe`. For example, if your snapshots cover 3 days but `--max-unsafe` is `7d`, Stave can't determine if a resource has been unsafe for 7 days.

### "CONTROL_NEVER_MATCHES"

**Cause:** A control's unsafe predicate didn't match any resource in any snapshot.

**Resolution:** This is often expected — it means all resources are safe for that control. If unexpected, check that your observations include the resource properties the control references.

### "DUPLICATE_RESOURCE_ID"

**Cause:** Two resources in the same snapshot have the same `id`.

**Resolution:** Ensure each resource has a unique ID within a snapshot.

## Unexpected Results

### Expected violations but got none

**Common causes:**
1. **Threshold too high:** The `--max-unsafe` duration is longer than the observation span. Try `--max-unsafe 0s` for state-based checks.
2. **Resource became safe:** The resource was fixed between snapshots, resetting the duration timer.
3. **Wrong control directory:** You're pointing at controls that don't cover this resource type.

Use `diagnose` to investigate:

```bash
stave diagnose --controls ./ctl --observations ./obs --eval-time 2026-01-15T00:00:00Z
```

### Got violations when none were expected

**Common causes:**
1. **Stricter threshold than expected:** Check `--max-unsafe` and per-control `params.max_unsafe_duration`.
2. **Resource property changed:** A snapshot introduced a property change you weren't aware of.
3. **Clock skew:** The `--eval-time` time is later than expected, increasing the calculated duration.

### INCONCLUSIVE findings

**Cause:** Stave doesn't have enough data to make a determination. This happens when:
- The observation span is shorter than `max_unsafe_duration`
- Gaps between observations exceed 12 hours
- A resource appears in only one snapshot

**Resolution:** Add more observation snapshots with closer time intervals.

## Build Issues

### "go:embed: pattern matches no files"

**Cause:** Running bare `go build ./cmd/stave` without syncing schemas first.

**Resolution:** Use `make build` instead. The `sync-schemas` step copies schema files into the embed directory:

```bash
cd stave
make build
```

### "stave version" returns an error

**Cause:** `version` is not a subcommand. It's a flag.

**Resolution:** Use `stave --version`, not `stave version`.

## Performance

### Evaluation is slow with many snapshots

Stave processes all snapshots in the observations directory. If you have hundreds of historical snapshots:
- Keep only the snapshots needed to cover your `--max-unsafe` window
- Archive older snapshots separately
- For `unsafe_state` controls, a single snapshot is sufficient
