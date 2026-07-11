# Resource Ignore Lists

Some resources are intentionally configured in ways that trigger control violations. A public website bucket, a break-glass admin binding, or a staging environment with relaxed settings should not produce findings in every evaluation. Ignore lists let you suppress evaluation for specific resources while maintaining an audit trail.

## Ignore File Format[​](#ignore-file-format "Direct link to Ignore File Format")

The ignore file is a YAML file with version and a list of resource rules:

```
version: ignore.v0.1
resources:
  - pattern: "res:aws:s3:bucket:acme-public-website"
    reason: "Intentional public website bucket — approved by security team 2026-01-10"
  - pattern: "res:aws:s3:bucket:staging-*"
    reason: "Staging buckets have relaxed controls by design"
```

| Field                 | Required | Description                                    |
| --------------------- | -------- | ---------------------------------------------- |
| `version`             | Yes      | Schema version, currently `ignore.v0.1`        |
| `resources`           | Yes      | Array of ignore rules                          |
| `resources[].pattern` | Yes      | Resource ID to match (exact or glob pattern)   |
| `resources[].reason`  | Yes      | Why this resource is ignored (for audit trail) |

## Pattern Matching[​](#pattern-matching "Direct link to Pattern Matching")

Patterns match against the full resource ID string.

### Exact match[​](#exact-match "Direct link to Exact match")

Matches a single, specific resource:

```
resources:
  - pattern: "res:aws:s3:bucket:acme-public-website"
    reason: "Intentional public website bucket"
```

### Glob patterns[​](#glob-patterns "Direct link to Glob patterns")

Use `*` to match any sequence of characters within a single path segment:

```
resources:
  - pattern: "res:aws:s3:bucket:staging-*"
    reason: "Staging buckets have relaxed controls"
  - pattern: "k8s:ClusterRoleBinding/system-*"
    reason: "System-managed cluster role bindings"
```

`*` uses Go's `filepath.Match` semantics — it matches any sequence of non-separator characters.

## Usage[​](#usage "Direct link to Usage")

Pass the ignore file to `apply`:

```
stave apply \
  --controls ./controls \
  --observations ./observations \
  --ignore ignore.yaml
```

## How It Works[​](#how-it-works "Direct link to How It Works")

When `--ignore` is provided:

1. Before evaluating each resource against a control, Stave checks if the resource ID matches any ignore rule
2. If a pattern matches, the resource is skipped for **all** controls (not evaluated at all)
3. The skipped resource is recorded in the output for audit purposes
4. Ignored resources are **not** counted in `resources_evaluated`
5. Ignored resources do **not** affect the exit code

## Output[​](#output "Direct link to Output")

Ignored resources appear in the `skipped_resources` array of the evaluation output:

```
{
  "schema_version": "out.v0.1",
  "kind": "ASSESSMENT",
  "summary": {
    "resources_evaluated": 5,
    "attack_surface": 1,
    "violations": 1
  },
  "findings": [
    {
      "control_id": "CTL.S3.ENCRYPT.001",
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

## Worked Example[​](#worked-example "Direct link to Worked Example")

You have 4 S3 buckets. One is a public website and two are staging buckets that intentionally lack encryption. You want to evaluate only the production bucket.

**1. Check resource IDs in your observations:**

```
stave apply \
  --controls controls/s3 \
  --observations ./observations \
  --format text
```

Note the resource IDs from findings (e.g., `res:aws:s3:bucket:acme-public-website`).

**2. Create the ignore file:**

```
# ignore.yaml
version: ignore.v0.1
resources:
  - pattern: "res:aws:s3:bucket:acme-public-website"
    reason: "Public website bucket — security review JIRA-1234"
  - pattern: "res:aws:s3:bucket:staging-*"
    reason: "Staging environment — relaxed controls accepted per policy"
```

**3. Run evaluation with ignore list:**

```
stave apply \
  --controls controls/s3 \
  --observations ./observations \
  --ignore ignore.yaml \
  --eval-time 2026-02-15T00:00:00Z
```

**4. Verify in output:**

* `findings` contains only violations from the production bucket
* `skipped_resources` lists the website and staging buckets with their reasons
* `resources_evaluated` reflects only the non-ignored count

## Best Practices[​](#best-practices "Direct link to Best Practices")

* **Always include a reason.** Reasons are part of the audit trail. Reference a ticket number, approval date, or policy section.
* **Prefer exact patterns over wildcards** when possible. Wildcards risk accidentally ignoring new resources that match the pattern.
* **Review ignore lists periodically.** A bucket that was intentionally public six months ago may no longer need to be.
* **Commit the ignore file to version control.** Changes to the ignore list should be reviewed like any other security policy change.
