---
title: "Running in CI/CD"
sidebar_label: "Running in CI/CD"
sidebar_position: 2
description: "How to integrate Stave into GitHub Actions and GitLab CI pipelines."
---

# Running in CI/CD

Stave is a standard CLI tool with stable exit codes, making it straightforward to run in any CI/CD pipeline.

This guide covers running the Stave CLI in CI environments. Stave does not have dedicated CI integration features — it runs the same way in CI as it does locally.

## GitHub Actions (Docker)

Build the demo image in CI and use it to run evaluations:

```yaml
name: Stave Safety Check
on:
  pull_request:
    paths:
      - 'terraform/**'
      - 'observations/**'

jobs:
  stave-evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Stave image
        run: docker compose -f stave/docker-compose.yaml build demo

      - name: Validate inputs
        run: |
          docker compose -f stave/docker-compose.yaml run --rm -v ${{ github.workspace }}:/work -w /work demo \
            stave validate \
              --invariants ./invariants \
              --observations ./observations \
              --strict

      - name: Evaluate safety
        run: |
          docker compose -f stave/docker-compose.yaml run --rm -v ${{ github.workspace }}:/work -w /work demo \
            stave apply \
              --invariants ./invariants \
              --observations ./observations \
              --max-unsafe 7d \
              --format json \
              > evaluation.json

      - name: Upload findings
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: stave-findings
          path: evaluation.json
```

## GitHub Actions (Build from Source)

If you need to build from source, cache the binary to avoid rebuilding on every run:

```yaml
name: Stave Safety Check
on:
  pull_request:
    paths:
      - 'terraform/**'
      - 'observations/**'

jobs:
  stave-evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: '1.26.0'

      - name: Cache Stave binary
        id: cache-stave
        uses: actions/cache@v4
        with:
          path: /usr/local/bin/stave
          key: stave-${{ hashFiles('.stave-version') }}

      - name: Build Stave
        if: steps.cache-stave.outputs.cache-hit != 'true'
        run: |
          git clone https://github.com/sufield/stave.git /tmp/stave
          cd /tmp/stave && make build
          cp /tmp/stave/stave /usr/local/bin/

      - name: Validate inputs
        run: |
          stave validate \
            --invariants ./invariants \
            --observations ./observations \
            --strict

      - name: Evaluate safety
        run: |
          stave apply \
            --invariants ./invariants \
            --observations ./observations \
            --max-unsafe 7d \
            --format json \
            > evaluation.json

      - name: Upload findings
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: stave-findings
          path: evaluation.json
```

### Exit Code Handling

Stave exits with code `3` when violations are found, which GitHub Actions treats as a failure. Use this to gate merges:

```yaml
      - name: Check for violations
        run: |
          stave apply \
            --invariants ./invariants \
            --observations ./observations \
            --max-unsafe 7d \
            --quiet
          # Exit 0 = safe, exit 3 = violations (fails the step)
```

To capture violations without failing the build:

```yaml
      - name: Evaluate (non-blocking)
        id: evaluate
        run: |
          stave apply \
            --invariants ./invariants \
            --observations ./observations \
            --max-unsafe 7d \
            > evaluation.json || rc=$?
          echo "violations=$(jq '.summary.violations' evaluation.json)" >> "$GITHUB_OUTPUT"
          exit 0  # Don't fail the step

      - name: Comment on PR
        if: steps.evaluate.outputs.violations != '0'
        run: |
          echo "Stave found ${{ steps.evaluate.outputs.violations }} violations"
```

## GitLab CI

Build Stave from source in the CI job:

```yaml
stave-evaluate:
  stage: test
  image: golang:1.26.0
  before_script:
    - git clone https://github.com/sufield/stave.git /tmp/stave
    - cd /tmp/stave && make build
    - cp /tmp/stave/stave /usr/local/bin/
  script:
    - stave validate --invariants ./invariants --observations ./observations --strict
    - stave apply --invariants ./invariants --observations ./observations --max-unsafe 7d
  artifacts:
    when: on_failure
    paths:
      - evaluation.json
  rules:
    - changes:
        - terraform/**/*
        - observations/**/*
```

## Deterministic Evaluation

For reproducible CI runs, use `--eval-time` with a fixed timestamp. This ensures the same inputs always produce the same output:

```yaml
      - name: Deterministic evaluation
        run: |
          stave apply \
            --invariants ./invariants \
            --observations ./observations \
            --max-unsafe 7d \
            --eval-time 2026-01-15T00:00:00Z \
            > evaluation.json
          diff evaluation.json expected/evaluation.json
```

## Using `--strict` Validation

In CI, use `--strict` with `validate` to treat warnings as errors. This catches issues like single snapshots (insufficient for duration tracking) or unsorted timestamps:

```bash
stave validate --invariants ./invariants --observations ./observations --strict
```

## Quiet Mode for Scripts

Use `--quiet` to suppress all output and rely only on exit codes:

```bash
if stave apply --quiet --invariants ./invariants --observations ./observations --max-unsafe 7d; then
  echo "All resources safe"
else
  echo "Violations found (exit $?)"
  exit 1
fi
```

## Parsing Results with jq

```bash
# Count violations
stave apply --invariants ./inv --observations ./obs | jq '.summary.violations'

# List violated invariant IDs
stave apply --invariants ./inv --observations ./obs | jq -r '.findings[].invariant_id' | sort -u

# Extract resource IDs with violations
stave apply --invariants ./inv --observations ./obs | jq -r '.findings[].resource_id'
```
