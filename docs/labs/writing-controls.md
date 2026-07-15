# Writing Custom Controls

Stave ships with 2,891 built-in controls across 85 domains, but you can write your own to encode your organization's specific safety policies. This guide walks through creating a control from scratch, testing it, and adding it to your evaluation.

## Supported Control Types[​](#supported-control-types "Direct link to Supported Control Types")

Custom controls must use one of the types evaluated in MVP 1.0:

| Type                | Use When                                                                |
| ------------------- | ----------------------------------------------------------------------- |
| `unsafe_state`      | Any match in the current snapshot is a violation (no duration tracking) |
| `unsafe_duration`   | A resource must not remain unsafe longer than a threshold               |
| `unsafe_recurrence` | A resource must not toggle between safe and unsafe too many times       |

Other types defined in the schema (`justification_required`, `visibility_required`, `ownership_required`, `authorization_boundary`, `audience_boundary`) are not yet evaluated and will be skipped.

## Step 1: Define the Safety Property[​](#step-1-define-the-safety-property "Direct link to Step 1: Define the Safety Property")

Start with a plain-language statement of what must always be true:

> "All S3 buckets tagged `environment=production` must have versioning enabled."

This maps to:

* **Unsafe condition**: bucket is tagged `production` AND versioning is not enabled
* **Type**: `unsafe_state` (any current violation is immediately flagged)

## Step 2: Write the Control YAML[​](#step-2-write-the-control-yaml "Direct link to Step 2: Write the Control YAML")

Create a file `CTL.CUSTOM.PROD.VERSION.001.yaml`:

```
dsl_version: ctrl.v1
id: CTL.CUSTOM.PROD.VERSION.001
name: Production Buckets Must Have Versioning
description: >
  S3 buckets tagged environment=production must have versioning enabled
  to protect against accidental deletion.
domain: exposure
scope_tags:
  - aws
  - s3
type: unsafe_state
params: {}
mitigation:
  description: >
    Production bucket does not have versioning enabled. Objects cannot
    be recovered if accidentally deleted or overwritten.
  action: >
    Enable versioning on the bucket using aws s3api put-bucket-versioning
    or the equivalent Terraform resource.
unsafe_predicate:
  all:
    - field: properties.storage.tags.environment
      op: eq
      value: "production"
    - field: properties.storage.versioning.enabled
      op: eq
      value: false
```

### Fields[​](#fields "Direct link to Fields")

* **`id`**: Must match pattern `CTL.<DOMAIN>.<CATEGORY>.<SEQ>` (e.g., `CTL.CUSTOM.PROD.VERSION.001`)

* **`type`**: One of the supported types above

* **`unsafe_predicate`**: Conditions that make a resource unsafe

  * `all`: AND logic — all conditions must match
  * `any`: OR logic — at least one must match

* **`mitigation`**: Included in findings to guide remediation

### Available Operators[​](#available-operators "Direct link to Available Operators")

| Operator                 | Description                | Example                           |
| ------------------------ | -------------------------- | --------------------------------- |
| `eq`                     | Equals                     | `{op: eq, value: true}`           |
| `ne`                     | Not equals                 | `{op: ne, value: "aws:kms"}`      |
| `gt`, `lt`, `gte`, `lte` | Numeric comparison         | `{op: lt, value: 2190}`           |
| `missing`                | Field absent or empty      | `{op: missing, value: true}`      |
| `present`                | Field exists and non-empty | `{op: present, value: true}`      |
| `in`                     | Value in list              | `{op: in, value: ["phi", "pii"]}` |
| `contains`               | String contains            | `{op: contains, value: "admin"}`  |
| `list_empty`             | List is empty or missing   | `{op: list_empty, value: true}`   |

## Step 3: Create Test Observations[​](#step-3-create-test-observations "Direct link to Step 3: Create Test Observations")

Create two observation snapshots to test against. You need at least two for duration-based controls (one is enough for `unsafe_state`).

`observations/2026-01-14T00:00:00Z.json`:

```
{
  "schema_version": "obs.v0.1",
  "generated_by": {
    "source_type": "custom",
    "tool": "manual"
  },
  "captured_at": "2026-01-14T00:00:00Z",
  "resources": [
    {
      "id": "res:aws:s3:bucket:prod-data",
      "type": "storage_bucket",
      "vendor": "aws",
      "properties": {
        "storage": {
          "kind": "bucket",
          "name": "prod-data",
          "tags": {
            "environment": "production"
          },
          "versioning": {
            "enabled": false
          }
        }
      }
    },
    {
      "id": "res:aws:s3:bucket:staging-data",
      "type": "storage_bucket",
      "vendor": "aws",
      "properties": {
        "storage": {
          "kind": "bucket",
          "name": "staging-data",
          "tags": {
            "environment": "staging"
          },
          "versioning": {
            "enabled": false
          }
        }
      }
    }
  ]
}
```

TODO

Confusing: not (not

The `prod-data` bucket should trigger the control (production + no versioning). The `staging-data` bucket should not (not tagged production).

## Step 4: Validate and Evaluate[​](#step-4-validate-and-evaluate "Direct link to Step 4: Validate and Evaluate")

```
# Validate that the control and observations are well-formed
stave validate \
  --controls ./my-controls \
  --observations ./observations

# Evaluate
stave apply \
  --controls ./my-controls \
  --observations ./observations \
  --eval-time 2026-01-15T00:00:00Z
```

Expected output: one finding for `res:aws:s3:bucket:prod-data` violating `CTL.CUSTOM.PROD.VERSION.001`. The `staging-data` bucket should not appear in findings because its `environment` tag is `staging`, not `production`.

## Step 5: Add to Your Evaluation[​](#step-5-add-to-your-evaluation "Direct link to Step 5: Add to Your Evaluation")

Once tested, add the control to your control directory alongside the built-in ones:

```
# Copy alongside built-in S3 controls
cp CTL.CUSTOM.PROD.VERSION.001.yaml controls/s3/

# Or keep custom controls separate and evaluate both
stave apply \
  --controls ./all-controls \
  --observations ./observations \
  --max-unsafe 7d
```

To keep custom controls in a separate directory, copy the built-in controls you want plus your custom ones into a single directory, since `--controls` takes one path.

## Duration-Based Example[​](#duration-based-example "Direct link to Duration-Based Example")

For controls that should only fire after a resource has been unsafe for a period:

```
dsl_version: ctrl.v1
id: CTL.CUSTOM.LOG.001
name: Production Logging Required Within 24h
description: >
  Production buckets must enable access logging within 24 hours of creation.
domain: exposure
scope_tags:
  - aws
  - s3
type: unsafe_duration
params:
  max_unsafe_duration: "24h"
mitigation:
  description: Production bucket has not enabled access logging.
  action: Enable S3 server access logging.
unsafe_predicate:
  all:
    - field: properties.storage.tags.environment
      op: eq
      value: "production"
    - field: properties.storage.logging.enabled
      op: eq
      value: false
```

This control uses `type: unsafe_duration` with a per-control threshold of 24 hours. The `params.max_unsafe_duration` overrides the CLI `--max-unsafe` flag for this control only. You need at least two observation snapshots spanning more than 24 hours for this control to fire.

## Tips[​](#tips "Direct link to Tips")

* **Start with `unsafe_state`** for your first custom control. It's the simplest type — no duration tracking, no multiple snapshots needed.
* **Use `validate` first.** It catches schema errors, missing fields, and predicate issues before you run evaluation.
* **Check field paths against your observations.** The `unsafe_predicate` fields must match the property paths in your observation JSON exactly. Use `jq '.resources[0].properties' observations/*.json` to inspect available fields.
* **Commit controls to version control.** Treat them like infrastructure code — review changes, track history.
