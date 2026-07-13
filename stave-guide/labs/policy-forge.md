---
title: "Scaffolding Controls with the Policy Forge"
sidebar_label: "Policy Forge"
---

# Scaffolding Controls with the Policy Forge

Learn how to create a new security control with test fixtures in under
30 seconds using the Policy Forge.

## Prerequisites

- Stave built from source (`make build`)
- Familiarity with the ctrl.v1 YAML format

## Step 1: Forge a control

Use `make gencontrol` to generate a control with pass/fail test fixtures:

```bash
make gencontrol \
  ID=CTL.S3.LOGGING.002 \
  NAME="CloudTrail Data Events Required" \
  DOMAIN=exposure \
  SEVERITY=high \
  SCOPE_TAGS=aws,s3 \
  ASSET_TYPE=aws_s3_bucket \
  KIND=bucket \
  FIELD=properties.storage.logging.cloudtrail_data_events \
  OP=eq \
  VALUE=false \
  REMEDIATION="Enable CloudTrail S3 data event logging." \
  COMPLIANCE="hipaa=164.312(b)"
```

Output:

```
  control:  testdata/e2e/e2e-forge-s3-logging-fail/controls/CTL.S3.LOGGING.002.yaml
  fail:     testdata/e2e/e2e-forge-s3-logging-fail (exit=3, findings=1)
  pass:     testdata/e2e/e2e-forge-s3-logging-pass (exit=0, findings=0)
```

Three things happened:
1. A ctrl.v1 YAML control was generated and **validated** against the real loader
2. A fail fixture was created (observations where the control fires)
3. A pass fixture was created (observations where the control does not fire)

## Step 2: Review the generated control

```bash
cat testdata/e2e/e2e-forge-s3-logging-fail/controls/CTL.S3.LOGGING.002.yaml
```

```yaml
dsl_version: ctrl.v1
id: CTL.S3.LOGGING.002
name: CloudTrail Data Events Required
description: >
  Detects assets where cloudtrail_data_events is eq false.
domain: exposure
severity: high
compliance:
  hipaa: "164.312(b)"
scope_tags:
  - aws
  - s3
type: unsafe_state
params: {}
remediation:
  description: >
    Detects assets where cloudtrail_data_events is eq false.
  action: >
    Enable CloudTrail S3 data event logging.
unsafe_predicate:
  all:
    - field: properties.storage.kind
      op: eq
      value: bucket
    - field: properties.storage.logging.cloudtrail_data_events
      op: eq
      value: false
```

The `--kind bucket` flag added the `storage.kind` discriminator automatically.
Edit the `description` and `remediation.description` to be more specific.

## Step 3: Generate golden files

```bash
make golden
```

This runs the evaluation against both fixtures and captures the expected output.

## Step 4: Run E2E tests

```bash
make e2e
```

Both the fail and pass fixtures are now part of the regression test suite.

## Step 5: Move to production controls (optional)

If the control should be a built-in:

```bash
# Copy to the canonical controls directory
cp testdata/e2e/e2e-forge-s3-logging-fail/controls/CTL.S3.LOGGING.002.yaml \
   controls/s3/logging/

# Sync, rebuild, regenerate docs
make sync-controls
make build
make docs-controls
make readme
```

## What the forge validates

The generated YAML is loaded through the real control loader
(`UnmarshalControlDefinition` + `Prepare`) before writing to disk.
If the predicate has invalid field paths or unsupported operators,
the forge fails immediately — you never get invalid YAML on disk.

## What you learned

- `make gencontrol` generates a complete policy bundle in one command
- Both pass and fail fixtures are created automatically
- Generated YAML is validated at generation time
- `--kind` adds the discriminator predicate rule
- `make golden && make e2e` integrates the new control into the test suite
