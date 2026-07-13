---
title: "Learn"
description: "Time to Hello World, the docs experience, building confidence, and the community."
---

# Learn

## Hello World

Install, then evaluate a bundled fixture — first finding in well under a minute:

```bash
# build the binary (syncs schemas, then go build)
cd stave && make build

# evaluate a snapshot against the built-in controls
stave apply --observations ./examples/challenge-fixtures/ --format text --eval-time 2025-01-01T00:00:00Z
```

You'll see findings like:

```text
CTL.S3.PUBLIC.001  NON_COMPLIANT
  asset:    s3://acme-prod-assets
  evidence: bucket policy grants s3:GetObject to Principal:* ; no Public Access Block
  verdict:  publicly readable
security_state: NON_COMPLIANT
```

A control is just YAML with a CEL predicate — here's the shape:

```yaml
dsl_version: ctrl.v1
id: CTL.S3.PUBLIC.001
applicable_asset_types: [aws_s3_bucket]
unsafe_predicate:
  all:
    - field: properties.storage.access.public_read
      op: eq
      value: true
```

→ Full walkthrough: **[Your First Evaluation](/docs/getting-started/first-evaluation)**.

## Your environment: first finding in 15 minutes

If you have data already, skip the fixture and go straight to a finding:

**Already running AWS Config?**
```bash
# Sync Config snapshots from your delivery bucket
aws s3 sync s3://your-config-bucket/AWSLogs/ACCOUNT/Config/ ./config-snapshots/
stave transform --source aws-config --input ./config-snapshots/ --output ./observations/
stave apply --observations ./observations/
```
→ See [Import Config Snapshots](/docs/how-to/getting-started/import-config-snapshots).

**Have Steampipe installed?**
```bash
steampipe query "select arn, policy, tags from aws_s3_bucket" --output json > buckets.json
python3 steampipe_to_obs.py buckets.json > observations/s3.json
stave apply --observations ./observations/
```
→ See [From Steampipe to Stave](/docs/labs/from-steampipe-to-stave).

**Starting from scratch?**
```bash
./examples/collectors/aws_minimal_collector.py --services s3,iam,cloudtrail > observations/snapshot.json
stave apply --observations ./observations/
```
→ See [Create Snapshots](/docs/how-to/getting-started/create-snapshots).

The `critical-findings` template targets S3, IAM, and CloudTrail first —
the services with the highest expected findings per minute:

```bash
stave recommend --snapshot ./observations/
stave template init critical-findings
stave apply --values ./stave-values.yaml --observations ./observations/
```

### Zero findings?

A clean run is a **negative-assurance artifact**:
the controls were evaluated, the services were covered, and no unsafe
state was found. In audit and diligence framing, this is a positive
deliverable.

## Documentation

The docs are organised by the [Diátaxis](https://diataxis.fr) model so you can
find what you need by intent:

- [Getting Started](/docs/getting-started/first-evaluation) — guided path from install to CI
- [How-to Guides](/docs/how-to) — task recipes
- [Reference](/docs/reference) — control catalog, CLI, schemas
- [Explanation](/docs/explanation) — concepts and the reasoning model

## Confidence

- Every finding includes an **evidence line** and a **reasoning trace** via `--verbose`
  — you can see *why*.
- Output is **deterministic** — reproducible in review and CI.
- The [case studies](/docs/labs/case-studies) show the engine against 30 real incidents.

---

**Next:** [Build](build) — fix a finding, write a custom control, gate a pipeline.
