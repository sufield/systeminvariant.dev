---
title: "Evaluate"
description: "Is Stave easy to use, are there red flags, and is pricing a barrier? Use cases and FAQs."
---

# Evaluate

## What it finds

Output from a single `stave apply` run:

```text
FINDINGS:

  HIGH  CTL.S3.BUCKET.VERSIONING.001
        Bucket "prod-data" does not have versioning enabled
        evidence: versioning.status = "Disabled"

  CRITICAL  CTL.CLOUDTRAIL.GHOST.DEST.001          ★ STAVE ONLY
        CloudTrail trail "prod-trail" references destination bucket
        "prod-logs-2024" which does not appear in this account snapshot
        evidence: trail.s3_bucket_name has no matching asset

  CRITICAL  CTL.IAM.CHAIN.ROLE_ESCALATION.001      ★ STAVE ONLY
        Role "ci-deploy" can assume "admin-role" via 2-hop trust chain
        evidence: sts:AssumeRole path through "staging-role"
```

The ★ findings are configuration-graph findings — they reason across
resources, relationships, and time. Single-resource scanners cannot produce
them because they check one setting at a time and miss how settings combine.

**First finding on your own account in under fifteen minutes.** Under five if
you already run AWS Config or Steampipe.

## Ease of use

One binary, one command. No agent, no account wiring, no daemon:

```bash
stave apply --observations ./snapshot/ --format text
```

Inputs are plain files — observation JSON and control YAML. Output is text,
JSON, or SARIF. If you can run a CLI and produce a config snapshot, you can run
Stave.

## Limitations

- **It evaluates snapshots.** You produce the snapshot; Stave never touches your
  account or credentials. Air-gapped, zero supply-chain risk — but coverage is
  only as complete as your snapshot.
- **It reasons over configuration.** Runtime-only behaviour visible only in
  CloudTrail is outside its scope.
- **Controls are explicit.** Detection is as good as the control catalog plus any
  controls you write.

## Pricing

Open source and free — clone, build, run. No licence key, no seat count,
no telemetry.

## Use cases

- **Pre-merge CI gate** — fail the build when a Terraform change would create a
  latent public bucket.
- **Audit evidence** — deterministic, reproducible findings with reasoning traces
  for compliance.
- **Incident reasoning** — "would this control have prevented that breach?" against
  a captured config.
- **Drift / time-travel** — compare two snapshots to find when a control flipped.

## FAQs

- *Does it need cloud credentials?* No — it reads snapshots.
- *Is the output stable?* Yes — deterministic; pin time with `--eval-time`.
- *How is it different from a scanner?* It reasons across settings, time, and
  resources — the edges between them.

---

**Next:** [Learn](learn) — get your first finding.
