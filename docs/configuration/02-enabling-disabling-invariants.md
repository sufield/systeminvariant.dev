---
title: "Enabling and Disabling Invariants"
sidebar_label: "Enabling/Disabling"
sidebar_position: 2
description: "How to control exactly which invariants Stave evaluates."
---

# Enabling and Disabling Invariants

Stave supports multiple deterministic ways to control evaluated invariants.

## 1) Directory-based selection

```bash
# Evaluate all S3 invariants in this directory
stave apply --invariants invariants/s3 --observations ./obs

# Evaluate only public-exposure invariants
stave apply --invariants invariants/s3/public --observations ./obs
```

## 2) Built-in packs (project config)

Use embedded packs through `stave.yaml`:

```yaml
enabled_invariant_packs:
  - s3
```

Inspect available packs:

```bash
stave packs list
stave packs show s3
stave invariants list --built-in
```

Important behavior:
- If `enabled_invariant_packs` is active and `--invariants` is explicitly passed, evaluation fails fast to avoid ambiguous selection.
- `stave invariants list --built-in` shows the full catalog; `stave packs show <pack>` shows only the curated IDs in that pack.
- Packs are policy profiles, not "all built-ins." This is intentional for safer rollout and stable governance.

## 3) Exclude specific IDs

```yaml
exclude_invariants:
  - INV.S3.PUBLIC.LIST.002
```

This removes specific rules from the selected set.

## 4) CLI filters

```bash
# Keep only critical/high invariants
stave apply --min-severity high --observations ./obs --invariants invariants/s3

# Run one invariant only
stave apply --invariant-id INV.S3.PUBLIC.001 --observations ./obs --invariants invariants/s3

# Exclude one ID from CLI
stave apply --exclude-invariant-id INV.S3.PUBLIC.LIST.002 --observations ./obs --invariants invariants/s3
```

## 5) Ignore resources

```yaml
# ignore.yaml
version: ignore.v0.1
resources:
  - pattern: "res:aws:s3:bucket:acme-public-website"
    reason: "Intentional public website"
```

```bash
stave apply --invariants ./invariants --observations ./obs --ignore ignore.yaml
```

## 6) Scope exclusions in invariant YAML

```yaml
scope:
  exclude:
    any:
      - field: properties.environment
        op: eq
        value: test
```

Resources matching `scope.exclude` are skipped for that invariant.
