---
title: "Invariants"
sidebar_label: "Invariants"
sidebar_position: 1
description: "What invariants are, how they differ from rules, and how Stave evaluates them."
---

# Invariants

An invariant in Stave is a safety property that must hold true for your infrastructure at all times.

## Built-ins vs Packs (Explicit Model)

Stave exposes invariant selection as two distinct layers:

- **Built-in catalog**: every embedded invariant available in the binary. Discover with `stave invariants list --built-in`.
- **Packs**: curated, opinionated bundles of invariant IDs for specific starting policies. Discover with `stave packs list` and inspect with `stave packs show <pack>`.

Packs are intentionally a subset view of the full catalog. For example, seeing fewer IDs in `stave packs show s3` than `stave invariants list --built-in` is expected behavior.

Why this split exists:

- Faster onboarding: start with a small high-signal baseline.
- Lower noise: avoid enabling the entire catalog on day one.
- Policy control: different teams/environments can pin different packs.
- Governance clarity: "we run pack X" is easier to review than a long ad hoc ID list.
- Compatibility control: new built-ins can be added to the catalog without automatically changing every workflow.

## Invariants vs. Rules

Traditional security tools use rules: "if X then alert." A rule fires once and produces a one-time finding. An invariant is different — it defines a property that must always be true, and Stave tracks whether that property has been continuously satisfied over time.

For example, the invariant "No S3 bucket may be publicly readable" (`INV.S3.PUBLIC.001`) isn't just checked once. Stave evaluates it across multiple observation snapshots, building a timeline of when each bucket was safe or unsafe. This enables duration-based enforcement: a bucket that was accidentally public for 5 minutes and immediately fixed is different from one that's been public for 3 weeks.

## Invariant Types

Stave defines several invariant evaluation modes. The following types are **evaluated in MVP 1.0**:

| Type | Behavior |
|------|----------|
| `unsafe_state` | Violation if the resource is currently unsafe, regardless of duration |
| `unsafe_duration` | Violation if the resource has been continuously unsafe longer than the threshold |
| `unsafe_recurrence` | Violation if the resource has toggled unsafe repeatedly within a time window |
| `prefix_exposure` | Violation if protected S3 prefixes are publicly readable |

The following types are **defined in the schema but not yet evaluated** in MVP 1.0. Invariants using these types will appear in the `skipped` section of the output with reason "type not supported in MVP 1.0":

| Type | Planned Behavior |
|------|------------------|
| `justification_required` | Violation if a public resource lacks a business justification |
| `visibility_required` | Violation if exposure status is unknown |
| `ownership_required` | Violation if a public resource has no owner |
| `authorization_boundary` | Violation if a boundary control is not declared |
| `audience_boundary` | Violation if actual audience doesn't match intended audience |

## Anatomy of an Invariant

Invariants are YAML files following the `inv.v0.1` schema:

```yaml
dsl_version: inv.v0.1
id: INV.S3.ENCRYPT.001
name: Encryption at Rest Required
description: S3 buckets must have server-side encryption enabled.
domain: exposure
scope_tags:
  - aws
  - s3
type: unsafe_state
severity: high
unsafe_predicate:
  any:
    - field: properties.storage.encryption.at_rest_enabled
      op: eq
      value: false
mitigation:
  description: Bucket does not have server-side encryption enabled.
  action: >
    Enable default bucket encryption using SSE-S3 (AES256) or SSE-KMS.
```

**Key fields:**

- **`id`**: Unique identifier in the format `INV.<DOMAIN>.<CATEGORY>.<SEQ>` (e.g., `INV.S3.PUBLIC.001`)
- **`unsafe_predicate`**: Conditions that make a resource unsafe. Uses `any` (OR) and `all` (AND) logic with field comparisons.
- **`type`**: Determines how Stave evaluates the invariant (state-based, duration-based, etc.)
- **`severity`**: `critical`, `high`, `medium`, or `low`
- **`mitigation`**: Remediation guidance included in findings

## Unsafe Predicates

The `unsafe_predicate` defines when a resource is considered unsafe. Stave supports these operators:

| Operator | Description |
|----------|-------------|
| `eq` | Equals (string, bool, numeric) |
| `ne` | Not equals |
| `gt`, `lt`, `gte`, `lte` | Numeric comparisons |
| `missing` | Field is absent or empty |
| `present` | Field exists and is non-empty |
| `in` | Value is in a list |
| `contains` | String contains substring |
| `list_empty` | List field is empty or missing |
| `neq_field` | Value not equal to another field's value |
| `not_in_field` | Value not found in another field's list |
| `not_subset_of_field` | List has elements not in another field's list |
| `any_match` | Any element in an array matches a nested predicate |

Predicates compose with `any` (OR) and `all` (AND):

```yaml
unsafe_predicate:
  all:
    - field: properties.storage.tags.data-classification
      op: eq
      value: "phi"
    - any:
        - field: properties.storage.encryption.algorithm
          op: ne
          value: "aws:kms"
        - field: properties.storage.encryption.kms_key_id
          op: eq
          value: ""
```

## Scope and Exclusions

Invariants can define a `scope.exclude` predicate to skip certain resources:

```yaml
scope:
  exclude:
    any:
      - field: properties.environment
        op: eq
        value: test
```

Resources matching the exclude predicate are silently skipped during evaluation for that invariant.

## Duration Thresholds

For `unsafe_duration` invariants, the threshold can be set at two levels:

1. **Per-invariant** via `params.max_unsafe_duration` in the YAML
2. **Globally** via the `--max-unsafe` CLI flag (default: `168h` / 7 days)

Per-invariant settings take precedence over the CLI flag.
