---
title: "Retroactive Evaluation"
sidebar_label: "Retroactive Evaluation"
sidebar_position: 5
description: "Run new controls against old snapshots to answer: were we exposed to this in March?"
---

# Retroactive Evaluation

When a new control ships — whether from a security advisory, a
breach postmortem, or an internal policy change — you can evaluate
it against your snapshot archive to answer: **were we exposed to
this before we knew to check?**

## The question

A new bucket-hijacking control ships after the Unit 42 disclosure.
You want to know: was your infrastructure vulnerable to this attack
path three months ago?

## Run new controls against old snapshots

```bash
# Evaluate current catalog (including new controls) against March snapshots
stave apply --observations ./archive/2026-03/ \
            --eval-time 2026-03-31T23:59:59Z \
            --format json > historical-march.json
```

The `--eval-time` flag pins the evaluation timestamp so duration-based
controls (e.g., "key older than 90 days") are calculated relative to
the snapshot's time, not today.

## Compare across time

```bash
# Were we exposed in March but not now?
stave diff --snapshot-before ./archive/2026-03/latest.json \
           --snapshot-after  ./observations/latest.json
```

Findings that appear in March but not today were **latent exposures**
that got fixed (intentionally or accidentally). Findings that appear
in both were exposed then and are still exposed now.

## Why this matters

Every event-driven control release — Unit 42 bucket hijacking, OAuth
namespace controls, new CIS benchmarks — gives operationalized users
a reason to re-run their archive. The mechanic is:

1. New threat intelligence arrives
2. Stave ships controls for it (days, not months)
3. You evaluate against your archive
4. You know whether you were exposed, when, and for how long

This is the retroactive value of maintaining a snapshot archive.
Without the archive, you can only answer "are we vulnerable now."
With it, you can answer "were we ever vulnerable to this."

## Practical requirements

- **Snapshot archive** — keep snapshots on a retention policy (monthly
  minimum for most compliance frameworks, weekly for high-assurance
  environments)
- **Stable observation format** — `obs.v0.1` is versioned; old
  snapshots continue to work with new Stave versions
- **Deterministic evaluation** — same snapshot + same controls + same
  `--eval-time` = same findings, regardless of when you run it
