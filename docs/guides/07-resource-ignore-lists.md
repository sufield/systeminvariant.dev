---
title: "Resource Ignore Lists"
sidebar_label: "Resource Ignore Lists"
sidebar_position: 7
description: "How to suppress findings for intentionally configured resources using ignore lists."
---

# Resource Ignore Lists

Some resources are intentionally configured in ways that trigger invariant violations. A public website bucket, a break-glass admin binding, or a staging environment with relaxed settings should not produce findings in every evaluation. Ignore lists let you suppress evaluation for specific resources while maintaining an audit trail.

## Ignore File Format

The ignore file is a YAML file with version and a list of resource rules:

```yaml
version: ignore.v0.1
resources:
  - pattern: "res:aws:s3:bucket:acme-public-website"
    reason: "Intentional public website bucket — approved by security team 2026-01-10"
  - pattern: "res:aws:s3:bucket:staging-*"
    reason: "Staging buckets have relaxed controls by design"
```

| Field | Required | Description |
|-------|----------|-------------|
| `version` | Yes | Schema version, currently `ignore.v0.1` |
| `resources` | Yes | Array of ignore rules |
| `resources[].pattern` | Yes | Resource ID to match (exact or glob pattern) |
| `resources[].reason` | Yes | Why this resource is ignored (for audit trail) |

## Pattern Matching

Patterns match against the full resource ID string.

### Exact match

Matches a single, specific resource:

```yaml
resources:
  - pattern: "res:aws:s3:bucket:acme-public-website"
    reason: "Intentional public website bucket"
```

### Glob patterns

Use `*` to match any sequence of characters within a single path segment:

```yaml
resources:
  - pattern: "res:aws:s3:bucket:staging-*"
    reason: "Staging buckets have relaxed controls"
  - pattern: "k8s:ClusterRoleBinding/system-*"
    reason: "System-managed cluster role bindings"
```

`*` uses Go's `filepath.Match` semantics — it matches any sequence of non-separator characters.

## Usage

Pass the ignore file to `apply`:

```bash
stave apply \
  --invariants ./invariants \
  --observations ./observations \
  --ignore ignore.yaml
```

## How It Works

When `--ignore` is provided:

1. Before evaluating each resource against an invariant, Stave checks if the resource ID matches any ignore rule
2. If a pattern matches, the resource is skipped for **all** invariants (not evaluated at all)
3. The skipped resource is recorded in the output for audit purposes
4. Ignored resources are **not** counted in `resources_evaluated`
5. Ignored resources do **not** affect the exit code

## Output

Ignored resources appear in the `skipped_resources` array of the evaluation output:

```json
{
  "schema_version": "out.v0.1",
  "kind": "evaluation",
  "summary": {
    "resources_evaluated": 5,
    "attack_surface": 1,
    "violations": 1
  },
  "findings": [
    {
      "invariant_id": "INV.S3.ENCRYPT.001",
      "resource_id": "res:aws:s3:bucket:acme-prod-data",
      "evidence": {
        "matched_properties": [{"path": "storage.encryption.at_rest_enabled", "value": false}]
      }
    }
  ],
  "skipped_resources": [
    {
      "resource_id": "res:aws:s3:bucket:acme-public-website",
      "matched_pattern": "res:aws:s3:bucket:acme-public-website",
      "reason": "Intentional public website bucket — approved by security team 2026-01-10"
    },
    {
      "resource_id": "res:aws:s3:bucket:staging-data",
      "matched_pattern": "res:aws:s3:bucket:staging-*",
      "reason": "Staging buckets have relaxed controls"
    }
  ]
}
```

The `skipped_resources` field is omitted when no resources are ignored.

## Worked Example

You have 4 S3 buckets. One is a public website and two are staging buckets that intentionally lack encryption. You want to evaluate only the production bucket.

**1. Check resource IDs in your observations:**

```bash
stave apply \
  --invariants invariants/s3 \
  --observations ./observations \
  --format text
```

Note the resource IDs from findings (e.g., `res:aws:s3:bucket:acme-public-website`).

**2. Create the ignore file:**

```yaml
# ignore.yaml
version: ignore.v0.1
resources:
  - pattern: "res:aws:s3:bucket:acme-public-website"
    reason: "Public website bucket — security review JIRA-1234"
  - pattern: "res:aws:s3:bucket:staging-*"
    reason: "Staging environment — relaxed controls accepted per policy"
```

**3. Run evaluation with ignore list:**

```bash
stave apply \
  --invariants invariants/s3 \
  --observations ./observations \
  --ignore ignore.yaml \
  --eval-time 2026-02-15T00:00:00Z
```

**4. Verify in output:**

- `findings` contains only violations from the production bucket
- `skipped_resources` lists the website and staging buckets with their reasons
- `resources_evaluated` reflects only the non-ignored count

## Best Practices

- **Always include a reason.** Reasons are part of the audit trail. Reference a ticket number, approval date, or policy section.
- **Prefer exact patterns over wildcards** when possible. Wildcards risk accidentally ignoring new resources that match the pattern.
- **Review ignore lists periodically.** A bucket that was intentionally public six months ago may no longer need to be.
- **Commit the ignore file to version control.** Changes to the ignore list should be reviewed like any other security policy change.
