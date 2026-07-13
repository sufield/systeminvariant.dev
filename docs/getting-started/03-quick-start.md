---
title: "Quick Start"
sidebar_label: "Quick Start"
sidebar_position: 3
description: "Go from install to seeing findings in under two minutes."
---

# Quick Start

This walkthrough takes you from a fresh install to seeing real evaluation findings.

## 1. Build Stave

```bash
git clone https://github.com/sufield/stave.git
cd stave
make build
```

## 2. Run Against Example Observations

Stave ships with example observations and invariants in the `testdata/` directory. Evaluate a scenario where an S3 bucket has been public for 10 days against a 7-day (168h) threshold:

```bash
./stave apply \
  --invariants testdata/e2e/e2e-01-violation/invariants \
  --observations testdata/e2e/e2e-01-violation/observations \
  --max-unsafe 168h \
  --eval-time 2026-01-11T00:00:00Z
```

Output (abbreviated — `input_hashes` truncated for readability):

```json
{
  "schema_version": "out.v0.1",
  "kind": "evaluation",
  "run": {
    "tool_version": "dev",
    "now": "2026-01-11T00:00:00Z",
    "max_unsafe": "168h0m0s",
    "snapshots": 3,
    "input_hashes": {
      "files": { "2026-01-01T00:00:00Z.json": "26770e3c...", "...": "..." },
      "overall": "8761e974..."
    }
  },
  "summary": {
    "resources_evaluated": 2,
    "attack_surface": 1,
    "violations": 1
  },
  "findings": [
    {
      "invariant_id": "INV.EXP.DURATION.001",
      "invariant_name": "Unsafe Exposure Duration Bound",
      "invariant_description": "A resource must not remain unsafe beyond the configured time window.",
      "resource_id": "res:aws:s3:bucket:public-bucket",
      "resource_type": "storage_bucket",
      "resource_vendor": "aws",
      "source": {"file": "infra/main.tf", "line": 42},
      "evidence": {
        "first_unsafe_at": "2026-01-01T00:00:00Z",
        "last_seen_unsafe_at": "2026-01-11T00:00:00Z",
        "unsafe_duration_hours": 240,
        "threshold_hours": 168,
        "matched_properties": [{"path": "public", "value": true}],
        "why_now": "Resource has been unsafe for 240 hours (threshold: 168 hours). Unsafe since 2026-01-01T00:00:00Z."
      },
      "mitigation": {
        "description": "Invariant violation detected.",
        "action": "Review the unsafe configuration and remediate."
      }
    }
  ]
}
```

Stave exits with code `3` because it found a violation: the bucket `public-bucket` has been publicly accessible for 240 hours, exceeding the 168-hour threshold.

## 3. Validate Inputs First

Before evaluation, check that your inputs are well-formed:

```bash
./stave validate \
  --invariants testdata/e2e/e2e-01-violation/invariants \
  --observations testdata/e2e/e2e-01-violation/observations
```

## 4. Diagnose Unexpected Results

If results don't match expectations, use `diagnose`:

```bash
./stave diagnose \
  --invariants testdata/e2e/e2e-01-violation/invariants \
  --observations testdata/e2e/e2e-01-violation/observations \
  --eval-time 2026-01-11T00:00:00Z
```

## 5. Use S3 Invariants with Real Configurations

For evaluating real S3 configurations, point Stave at the S3 invariant pack:

```bash
./stave apply \
  --invariants invariants/s3 \
  --observations ./your-observations \
  --max-unsafe 7d
```

Selection note:
- `stave invariants list --built-in` shows the full embedded catalog.
- `stave packs list` / `stave packs show s3` show curated starter policy packs.
- Packs are intentionally smaller than the full catalog.

## Next Steps

- [Recipes cookbook](https://github.com/sufield/stave/blob/main/docs/recipes.md) — Reusable multi-command workflows (CI fix-loops, Terraform ingestion, jq filtering)
- [Docker Demo](../demo/README.md) — See 7 real-world S3 misconfiguration scenarios without any setup
- [Core Concepts: Invariants](../core-concepts/01-invariants.md) — Understand the invariant model
- [Configuration Export](../core-concepts/03-configuration-export.md) — Get your AWS data into Stave's format
- [Invariants Reference](../invariants-reference/_index.md) — Browse all 43 invariants
