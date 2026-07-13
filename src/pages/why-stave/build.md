---
title: "Build"
description: "Speed to a proof of concept, the build experience, and how to get support."
---

# Build

## Proof of concept

A working PoC is three steps:

1. **Snapshot your config** — point the AWS CLI, Terraform, or an extractor at
   the resources you care about and emit `obs.v0.1` JSON.
   → [How to create snapshots](/docs/how-to/getting-started/create-snapshots).
2. **Pick or write controls** — start with the built-in catalog; add your own
   when you need to.
   → [Write your first custom control](/docs/labs/writing-controls).
3. **Evaluate + gate** — run `stave apply` in CI and gate on exit code 3.
   → [CI integration](/docs/how-to/integration/ci-cd-integration).

```bash
stave apply --observations ./snapshot/ --format sarif > findings.sarif
# exit 0 = clean, 3 = violations (fail the pipeline), 2 = input error
```

Most teams get a finding on their own config the same afternoon.

## Developer experience

- **Sandbox:** the bundled [demo scenarios](/docs/labs/docker-scenarios) are a ready-made sandbox —
  curated S3 misconfigurations you can run, read, and modify without any cloud
  setup. Clone, `stave apply`, tweak a setting, watch the verdict change.
- Plain-file inputs, deterministic output, grep-friendly text or structured
  JSON/SARIF — it drops into existing pipelines without fuss.
- Fail-loud philosophy: degraded/unknown states are surfaced, never silently
  passed.

## Support

Email **[bparanj@gmail.com](mailto:bparanj@gmail.com)** — bug reports, control-authoring
questions, "is this the right tool for X?". Include the command you ran and the
output. Use `--sanitize` to scrub identifiers before sharing.

---

**Next:** [Scale](scale) — run Stave continuously, expand coverage, generate evidence.
