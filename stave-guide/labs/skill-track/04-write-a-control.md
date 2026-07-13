---
title: "Write a Control"
sidebar_label: "4. Write a Control"
sidebar_position: 4
description: "Author, test, and verify a custom control using the forge toolchain."
---

# Write a Control

Author a new control using the `forge` toolchain, then prove it fires on the positive case and stays quiet on the negative case.

**Time:** ~20 minutes. **No AWS needed.**

## Steps

### 1. State the property to detect

Example: "An S3 bucket must have access logging enabled."

### 2. Discover available fields

```bash
./stave forge paths \
  --snapshot examples/demo-s3-public-read/fixtures/writeup-config/observations/2026-01-10T000000Z.json \
  --asset-type aws_s3_bucket
```

Lists every property path, its type, and values. Find the field for your property.

### 3. Test the predicate

```bash
./stave forge preview --snapshot <same-snapshot> \
  --field properties.storage.logging.enabled --op eq --value false
```

`FAIL` = the predicate catches the unsafe state. `PASS` = the asset is safe. If nothing fires on a known-unsafe snapshot, revise the predicate.

### 4. Generate the control + fixtures

```bash
./stave forge new --non-interactive \
  --id CTL.S3.LOG.CUSTOM.001 \
  --name "S3 buckets must have access logging" \
  --field properties.storage.logging.enabled \
  --op eq --value false \
  --severity high \
  --domain exposure \
  --remediation "Enable S3 server access logging" \
  --out ~/my-controls/
```

Generates the control YAML and pass/fail test fixtures.

### 5. Hand-edit the YAML

Open the generated file and add:
- `classification: state_assertion`
- `applicable_asset_types: [aws_s3_bucket]`
- `scope_tags: [aws, s3]`
- `observation_fields:` listing every field the predicate reads
- `defect:` / `infection:` / `failure:` narrative
- `tests:` with VIOLATION and PASS inline fixtures

Use an existing control as reference:

```bash
cat controls/s3/logging/CTL.S3.LOG.001.yaml
```

### 6. TDD — verify pass/fail

```bash
./stave forge test \
  --control ~/my-controls/.../CTL.S3.LOG.CUSTOM.001.yaml \
  --pass <pass-fixture>.json \
  --fail <fail-fixture>.json
```

The fail fixture must produce VIOLATION. The pass fixture must not fire.

### 7. Lint

```bash
./stave forge lint --control ~/my-controls/ --semantic --strict
```

Must pass with 0 errors, 0 warnings. `--semantic` catches always-firing and never-firing predicates.

### 8. End-to-end proof

```bash
./stave apply --controls ~/my-controls --observations <obs-dir>/ \
  --eval-time 2026-01-02T00:00:00Z
```

Your control fires alongside the built-in catalog.

## Done

You authored a control using the forge pipeline, gave it pass/fail tests, linted it, and watched it fire on the positive case only.

**Next:** [Reasoning Engines](05-reasoning-engines.md)
