---
sidebar_position: 1
title: "Stave Docs"
description: "Offline-first infrastructure safety checks using snapshots, invariants, and deterministic CLI workflows."
---

# Stave Documentation

Stave evaluates infrastructure snapshots against safety invariants with no cloud credentials and deterministic outputs.
When commands fail, Stave prints a proactive `Next: ...` fix command and `More info: ...` docs link directly in terminal output.

## I want to...

| I want to... | Run this command | Read next |
|--------------|------------------|-----------|
| Initialize a project with defaults | `stave init --profile mvp1-s3` | [CLI Reference](/docs/cli-reference/stave-init) |
| Validate before evaluating | `stave validate --invariants ./invariants --observations ./observations` | [CLI Reference](/docs/cli-reference/stave-validate) |
| Evaluate current findings | `stave apply --invariants ./invariants --observations ./observations --format json > output/evaluation.json` | [CLI Reference](/docs/cli-reference/stave-evaluate) |
| See chronological upcoming snapshot actions | `stave snapshot upcoming --invariants ./invariants --observations ./observations --out output/upcoming.md` | [CLI Reference](/docs/cli-reference/stave-snapshot) |
| Check snapshot quality before CI gate | `stave snapshot quality --observations ./observations --strict` | [CLI Reference](/docs/cli-reference/stave-snapshot) |
| Apply CI policy and baseline checks | `stave ci gate --in output/evaluation.json --baseline output/baseline.json` | [CLI Reference](/docs/cli-reference/stave-ci) |
| Run before/after fix verification loop | `stave ci fix-loop --before ./obs-before --after ./obs-after --invariants ./invariants --out output` | [CLI Reference](/docs/cli-reference/stave-ci) |
| Search docs from terminal | `stave docs search "snapshot upcoming"` | [CLI Reference](/docs/cli-reference/stave-docs) |
| Open one best docs page for a topic | `stave docs open "snapshot upcoming"` | [CLI Reference](/docs/cli-reference/stave-docs) |
| Continue from last known state | `stave status` then `stave status` | [CLI Reference](/docs/cli-reference/stave-status) |

| Format invariant/observation files deterministically | `stave fmt ./invariants` | [CLI Reference](/docs/cli-reference/stave-fmt) |
| Generate invariant/observation templates | `stave generate invariant s3.public-read` | [CLI Reference](/docs/cli-reference/stave-generate) |
| Set context default paths for a project | `stave context use prod --invariants ./invariants --observations ./observations --config ./stave.yaml` | [CLI Reference](/docs/cli-reference/stave-context) |

Missing an "I want to..." row?
- [Suggest it here](https://github.com/sufield/stave/issues/new?template=docs_feedback.yml&title=docs%3A%20missing%20intent%20-%20)

## Path inference

When `--invariants` or `--observations` is omitted, Stave infers paths from context defaults first, then conventional directories under the project root (or `STAVE_PROJECT_ROOT`). On failure, Stave prints searched locations, candidates, and exact fix flags. See [CLI Reference](/docs/cli-reference/stave-evaluate) for details.

```bash
# From a project root with conventional layout (invariants/ and observations/):
stave apply          # both paths inferred automatically
stave validate          # same inference
stave diagnose          # same inference
```

## Core workflow

```bash
# 1) Validate inputs
stave validate --invariants ./invariants --observations ./observations

# 2) Evaluate
stave apply --invariants ./invariants --observations ./observations --format json > output/evaluation.json

# 3) Diagnose unexpected results
stave diagnose --invariants ./invariants --observations ./observations --previous-output output/evaluation.json
```

## Lifecycle and CI workflow

```bash
# Snapshot lifecycle
stave snapshot upcoming --invariants ./invariants --observations ./observations
stave snapshot diff --observations ./observations
stave snapshot prune --observations ./observations --dry-run
stave snapshot archive --observations ./observations --archive-dir ./observations/archive --dry-run
stave snapshot quality --observations ./observations --strict
stave snapshot hygiene --invariants ./invariants --observations ./observations --out output/weekly-hygiene.md

# CI policy + remediation loop
stave ci baseline save --in output/evaluation.json --out output/baseline.json
stave ci gate --in output/evaluation.json --baseline output/baseline.json
stave ci fix-loop --before ./obs-before --after ./obs-after --invariants ./invariants --out output
```

## Next

- Read [Design Philosophy](/docs/design-philosophy) for standards-first and vendor-neutral architecture choices.
- Browse the [Recipes cookbook](https://github.com/sufield/stave/blob/main/docs/recipes.md) for reusable multi-command workflows (CI fix-loops, Terraform ingestion, jq filtering).
- Use **CLI Reference** for command/flag details.
- Use the **How-To** and **Tutorial** sections for end-to-end setup and CI integration.
