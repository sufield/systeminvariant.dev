---
title: "Discover"
description: "What Stave is, whether it fits your problem, and why you can trust it."
---

# Discover

Stave answers the query no other tool does: **audit AWS security from a
configuration snapshot you already have — no credentials, no agent, no
network access.**

You feed it a point-in-time snapshot of your config — S3, IAM, CloudTrail,
KMS, Lambda, and 80+ more domains — plus a control catalog, and it proves
which resources are unsafe **now** and **latently**: safe today, one
setting-change from exposed.

It is a *reasoning* engine: it evaluates how settings **combine** — a
permissive policy neutralised by a Public Access Block, an exposure that
needs two independent paths closed, a compound attack chain across
resources — the **edges** between resources, across time.

## Problem fit

Use Stave if you need to:

- Prove a bucket / role / key is safe from **static config alone** — no
  credentials, no live account, no network.
- Catch **latent** exposure — safe now, unsafe after the next `terraform apply`.
- Find **compound** risk a single-setting scanner misses.
- Produce **deterministic, reproducible** evidence for audits and CI gates.

If you only need a one-setting "is this flag on?" check, a conventional scanner
may be enough. Stave's wedge is the reasoning across settings, time, and
resources.

## Credibility

- **Validated against real breaches and bug bounties** — 30 HackerOne reports
  reconstructed as reasoning challenges. See the
  [case studies](/docs/labs/case-studies).
- **100% detection across validation labs** — SadCloud: 57 findings, 3 engines,
  0 disagreements. Bishop Fox IAM Vulnerable: 30/30 paths. CloudGoat: 13
  findings + 1 compound chain.
- **Deterministic & auditable** — same input, same verdict, byte-for-byte; every
  finding carries an evidence line and a reasoning trace.
- **Open source** — read the engine, the controls, and the test corpus yourself.

---

**Next:** [Evaluate](evaluate) — install, run, see output.
