---
title: "SadCloud — Multi-Service Misconfiguration Sweep"
sidebar_label: "SadCloud Multi-Service Sweep"
sidebar_position: 13
description: "A hands-on walkthrough: deploy NCC Group's SadCloud — a deliberately-insecure, 22-service AWS lab — capture it as an obs.v0.1 snapshot, evaluate the whole estate with Stave's built-in controls, and read the scorecard (breadth, detection rate, and a compound attack chain) instead of a single finding."
---

# SadCloud — Multi-Service Misconfiguration Sweep

The earlier lab tutorials each focused on **one** scenario. This one is different:
[NCC Group's **SadCloud**](https://github.com/nccgroup/sadcloud) is a Terraform
project that stands up *deliberately insecure* infrastructure across **22 AWS
services** at once — 84 distinct misconfigurations in a single `terraform apply`.
It is the broadest test of Stave's catalog: not "does Stave catch this one bug?"
but "how much of an entire misconfigured estate does Stave see, and how cleanly?"

It is adapted from one of Stave's CTF validation labs, so the layout, commands,
and results below are grounded in the real lab that lives at
**`ctf/nccgroup/`** (`ctf/nccgroup/` in the repo) — including the committed snapshot you can
evaluate **without an AWS account**.

## What you'll learn

- How Stave behaves over a **whole estate** rather than a single asset.
- How to deploy, capture, and tear down a vendor vulnerable-cloud lab using the
  automation harness.
- How to read a **scorecard**: breadth (assets/services), detection rate, false
  positives, and a compound attack **chain** across services.
- Why the same lab supports **two independent experiments** (a manual AWS-CLI
  capture and an automated minimal-collector capture) that must stay separate.

## Prerequisites

- A built `stave` binary. From a clone: `cd stave && make build`. Confirm with
  `stave version`.
- **To evaluate only** (recommended first pass): nothing else — the committed
  snapshot at **`ctf/nccgroup/observations/`** (`ctf/nccgroup/observations/` in the repo)
  lets you run the whole evaluation air-gapped, no credentials.
- **To deploy and capture your own**: an AWS CLI **sandbox** profile (never
  production — SadCloud creates real, exposed resources that cost money) and
  Terraform installed.

> SadCloud bills real AWS resources. If you deploy it, **tear it down the same
> day** (Step 5).

## The scenario

SadCloud's `terraform apply` enables a configurable set of bad defaults per
service — public S3 buckets, CloudTrail without log-file validation, over-broad
IAM, unencrypted volumes, and so on. The committed lab captured **20 of 22**
services (RDS and Redshift were disabled for sandbox compatibility), of which
**58** misconfigurations materialized as resources in the snapshot.

The lab keeps **two experiments side-by-side** under `ctf/nccgroup/`, sharing one
`vendor-repo/` but collecting differently:

| Experiment | Location | Collector |
|---|---|---|
| Manual capture (scored) | `ctf/nccgroup/observations/` | AWS CLI (`aws.cli`) |
| Automated capture | `ctf/nccgroup/automated/observations/` | `aws_minimal_collector.py` |

This walkthrough evaluates the **manual** snapshot (the one the scorecard is
based on); Step 1–2 show how the **automated** harness refreshes its own.

## Step 1 — Deploy the lab (optional; needs AWS sandbox)

The automation harness lives in **`ctf/nccgroup/automated/`** (`ctf/nccgroup/automated/` in the repo).
It is the only place that touches AWS, and it is gated behind manual approval in
CI. To run it yourself against a sandbox account:

```bash
# Clone the vendor Terraform once (if not already present):
#   git clone https://github.com/nccgroup/sadcloud.git ctf/nccgroup/vendor-repo/sadcloud
ctf/nccgroup/automated/deploy.sh      # terraform apply on the SadCloud module
```

## Step 2 — Capture the estate as a snapshot

```bash
ctf/nccgroup/automated/collect.sh     # runs the minimal collector -> automated/observations/
```

This writes `obs.v0.1` JSON to `ctf/nccgroup/automated/observations/`, separate
from the committed manual snapshot. (If you skipped Steps 1–2, just use the
committed `ctf/nccgroup/observations/` in the next step.)

## Step 3 — Evaluate the whole estate

Stave's evaluation is air-gapped — it reads the static snapshot, no credentials:

```bash
stave apply \
  --observations ctf/nccgroup/observations \
  --eval-time 2026-06-01T13:00:00Z
```

```
Run: 2026-06-01 13:00:00 UTC (max-unsafe: 7d, snapshots: 2)

Summary
-------
  Assets evaluated:    36
  Violations:          59
  Issues (consolidated): 49
...
```

Exit code **3** — violations found. One command swept the entire 22-service
estate and returned a finding per unsafe asset, with no rules to write: these are
Stave's **built-in** controls.

## Step 4 — Read the scorecard

For a single finding you read the finding. For an estate you read the
**scorecard** — the lab's **`SCORECARD.md`** (`ctf/nccgroup/SCORECARD.md` in the repo)
records the verified ground-truth comparison:

```
Expected misconfigs:  84 total (across all 22 services)
Actually deployed:    58 (resources exist in snapshot)

Stave findings:       57 individual + 1 compound chain
Controls fired:       30 unique control IDs
Assets on surface:    28 of 35 modeled

Detection rate:       98% (57 / 58 deployed misconfigs)
False positives:      0
New controls authored: 2 (INLINE.003, ADMIN.002)
```

Three things matter here:

- **Breadth.** 30 distinct controls fired across services — CloudTrail
  (`LOG.VALIDATION.001`, `DATAEVENTS.S3.001`), IAM, S3, KMS, and more — from one
  air-gapped run.
- **Precision.** **Zero false positives** against a known ground truth. The
  scorecard's per-service tables map every SadCloud misconfig to the exact
  control that caught it (or explains why it wasn't deployed).
- **A compound chain.** Beyond the 57 individual findings, Stave reported one
  **compound finding** (`cloudwatch_detection_broken`) — a cross-service attack
  path that no single control sees, only the combination.

Authoring this lab also drove real improvements: **2 new controls** and **3 bugs
found** (a Terraform OR-logic issue and two catalog gaps) — which is the point of
a validation lab: it turns "known-bad" infrastructure into permanent catalog
coverage.

## Step 5 — Tear down (if you deployed)

```bash
ctf/nccgroup/automated/destroy.sh     # terraform destroy — run the same day as deploy
```

## What you learned

- Stave evaluates an entire **multi-service estate** in one air-gapped command,
  using built-in controls and emitting one finding per unsafe asset (exit 3).
- A **scorecard** — breadth, detection rate, false-positive count, and compound
  chains — is how you read a whole-estate evaluation, not a single finding.
- Against SadCloud's 58 deployed misconfigurations, Stave detected **98% with
  zero false positives** plus a cross-service compound chain.
- The lab carries **two separate experiments** (manual + automated capture) that
  share the vendor Terraform but never overwrite each other.

## Next steps

- Open **`ctf/nccgroup/SCORECARD.md`** (`ctf/nccgroup/SCORECARD.md` in the repo) for the full
  per-service misconfig→control mapping.
- Compare with the focused single-scenario walkthroughs, e.g.
  [S3 Public Exposure & Long-Lived IAM Keys](s3-public-exposure-long-lived-iam-keys.md).
- See [Stave vs Vulnerable Labs](../explanation/vs-vulnerable-labs.md) for how
  attacker-centered labs and defender-centered evaluation compose.
