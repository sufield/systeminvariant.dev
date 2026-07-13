---
title: "Scale"
description: "Doing more with Stave, giving feedback, and how the product grows with you — including Steampipe."
---

# Scale

## Coverage expansion

Yes — the same engine scales up several axes:

- **More resource types** — 4,258 controls across 91 domains: S3, IAM, EC2, KMS,
  Lambda, ECS, EKS, Bedrock, OpenSearch, Cognito, CloudFront, and 74 more.
  Browse the full set under [Reference → Full Control Catalog](/docs/reference).
- **Whole-estate snapshots via Steampipe.** Instead of hand-running AWS CLI calls,
  use **[Steampipe](https://steampipe.io)** to query your cloud as SQL and emit the
  facts Stave evaluates. Steampipe's AWS plugin enumerates resources across
  accounts/regions; a thin mapping turns those rows into `obs.v0.1` observations:

  ```bash
  # Steampipe queries your cloud as SQL; export the rows...
  steampipe query "select arn, policy, tags from aws_s3_bucket" --output json > buckets.json
  # ...then map to obs.v0.1 and evaluate the whole estate
  python3 steampipe_to_obs.py buckets.json > snapshot/s3.json
  stave apply --observations ./snapshot/ --format sarif
  ```

  This is the natural path from "one snapshot" to "every account, on a schedule."
  See [How to create snapshots](/docs/how-to/getting-started/create-snapshots) for the extraction
  patterns — AWS CLI, Terraform, Steampipe.

- **Compound chains** — at estate scale, the high-value findings are the
  cross-resource attack chains; the engine assembles those automatically.

## Feedback

Email **[bparanj@gmail.com](mailto:bparanj@gmail.com)** — feature requests, control gaps,
"Stave missed X" — that's a control-gap signal and exactly what we want — and rough
edges. Concrete snapshots + expected-vs-actual verdicts are the most useful.

## Extensibility

- **Controls are code** — write your own in `ctrl.v1` YAML + CEL; the engine runs
  them alongside the built-ins, so your policy library grows with your needs.
- **Stable contracts** — `obs.v0.1` / `ctrl.v1` / `out.v0.1` are versioned, so your
  snapshots, controls, and pipelines keep working across releases.
- **Reasoning engines** — beyond CEL, facts can be exported to external solvers
  — Z3, Souffle — for heavier reasoning as your questions get harder.
- **Deterministic at any scale** — same inputs, same verdicts, whether it's one
  bucket or ten thousand.

## What's next

- [Contribute a control or template](https://github.com/sufield/stave) — the catalog grows with community contributions.
- [bparanj@gmail.com](mailto:bparanj@gmail.com) — enterprise questions, control-gap signals, partnership.
