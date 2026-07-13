---
title: "Enabling and Disabling Controls"
sidebar_label: "Enabling/Disabling"
sidebar_position: 4
description: "How to control exactly which controls Stave evaluates."
---

# Enabling and Disabling Controls

Stave supports multiple deterministic ways to select which controls are evaluated.

## 1) Directory-based selection

```bash
# Evaluate all S3 controls in this directory
stave apply --controls controls/s3 --observations ./obs

# Evaluate only public-exposure controls
stave apply --controls controls/s3/public --observations ./obs
```

## 2) Built-in packs (project config)

Use embedded packs through `stave.yaml`:

```yaml
enabled_control_packs:
  - s3
```

Inspect available packs:

```bash
stave packs list
stave packs show s3
stave controls list --built-in
```

Important behavior:
- If `enabled_control_packs` is active and `--controls` is explicitly passed, evaluation fails fast to avoid ambiguous selection.
- `stave controls list --built-in` shows the full catalog; `stave packs show <pack>` shows only the curated IDs in that pack.
- Packs are policy profiles, not "all built-ins." This is intentional for safer rollout and stable governance.

## 3) Exclude specific IDs

```yaml
exclude_controls:
  - CTL.S3.PUBLIC.LIST.002
```

This removes specific rules from the selected set.

## 4) CLI filters

```bash
# Keep only critical/high controls
stave apply --min-severity high --observations ./obs --controls controls/s3

# Run one control only
stave apply --control-id CTL.S3.PUBLIC.001 --observations ./obs --controls controls/s3

# Exclude one ID from CLI
stave apply --exclude-control-id CTL.S3.PUBLIC.LIST.002 --observations ./obs --controls controls/s3
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
stave apply --controls ./controls --observations ./obs --ignore ignore.yaml
```

## 6) Scope exclusions in control YAML

```yaml
scope:
  exclude:
    any:
      - field: properties.environment
        op: eq
        value: test
```

Resources matching `scope.exclude` are skipped for that control.
