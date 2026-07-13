---
title: "Stave and Z3"
sidebar_label: "Stave and Z3"
sidebar_position: 6
description: "Stave's evaluator is in-process Google CEL. A small Go example under examples/ shows how to compose Stave's library API with libz3 to answer SAT/UNSAT questions. They are different shapes of analysis."
---

# Stave and Z3

Stave's evaluator is **Google CEL** — an in-process,
deterministic predicate engine. Every shipped control fires
through the CEL path; there is no alternate backend to opt into.

External reasoning engines — Z3, cvc5, Yices, Soufflé, Clingo,
Prolog, PySAT, and others — are the natural complement. Stave
hands them facts via `stave export-sir` (JSON / JSONL / SMT-LIB
v2 on disk); each engine reads the file in its native format and
answers a question CEL can't. See [Files as the Boundary](files-as-the-boundary.md)
for the architectural framing and [Fact Export](../reference/fact-export.md)
for the schema.

This page focuses on the **Z3-specific** integration. There are
two ways to compose Stave with Z3:

| Path | When to use | Example |
|---|---|---|
| **File boundary** (`export-sir --format smt2` → `z3 facts.smt2`) | Default. No cgo. Works with cvc5 / Yices identically. | [`examples/z3-multi-hop-can-assume/`](https://github.com/sufield/stave/tree/main/examples/z3-multi-hop-can-assume) |
| **Library API + cgo libz3** | Embedded use, tight feedback loop, building a custom prover on top of Stave's structured types | [`examples/z3-public-exposure/`](https://github.com/sufield/stave/tree/main/examples/z3-public-exposure) |

The cgo path was historically the only one. The file-boundary
path is now the recommended default — it scales to any SMT
solver, ships no extra dependencies, and is what every other
external engine (Soufflé, Clingo, …) follows.

The rest of this page covers what Google CEL does well (the
in-process work) and what an SMT solver adds (the question
shapes CEL can't express).

## The split

| Component | Role | What it does |
|-----------|------|--------------|
| **Stave** | Librarian + Judge | Collects facts from the snapshot; evaluates `ctrl.v1` predicates with Google CEL. Produces findings + Logic Trace. |
| **examples/z3-public-exposure** | SMT illustration | A standalone Go program that loads a Stave snapshot via the library API and uses libz3 to reason over a tiny logical model. |

Stave's release pipeline produces only the `stave` Go binary
(see [Release Security](release-security.md)). The Z3 example
ships through `examples/`, builds independently, and adds no
dependency to the main binary.

## What Google CEL does well

The control catalogue, the chain walker, the property
projector, and the risk-reasoning engine all run inside Stave
on the CEL path:

- **Per-control safety predicates** — one CEL expression per
  control YAML, evaluated against the asset's `Properties`.
- **Effective-permission resolution** — combining identity
  policies, SCPs, and permission boundaries into the actual
  effective allow / deny set per principal. Conditioned Denies
  that narrow scope to a subset of principals are surfaced
  rather than trusted (the fail-loud rule).
- **Layered policy reconciliation** — PublicAccessBlock takes
  precedence over bucket policies; SCPs cap permissions;
  boundaries intersect. A bucket policy that grants public
  access while PAB is enabled is flagged as an *incompatible
  configuration*.
- **Transitive role-chain detection** — the chain walker emits
  `RoleChainFact[]` into the report; a property projector folds
  chain hop types and TOCTOU annotations into per-identity
  booleans (e.g. `identity.escalation.confused_lambda_invoke.present`)
  that CEL controls read like any other property.
- **Compound chain reasoning** — the risk-reasoning engine
  composes multi-control chain definitions across findings
  AFTER evaluation, emitting derived findings for compound
  patterns the per-control predicates miss.
- **ABAC, account-root trust, confused deputy, TOCTOU**, and the
  full set of transitive primitives
  — all driven by the chain walker; CEL sees the projected
  results.
- **Lifecycle and temporal reasoning** — exposure windows,
  coverage gaps, scheduled-deletion annotations across
  snapshot history. Catches "future ghost references" — chains
  pointing at roles scheduled for deletion.
- **Logic Trace** — step-by-step audit trail of every
  evaluation decision, exported as `trace.v0.1` JSON. Air-gap-
  safe and deterministic. See
  [The Logic Trace](logic-trace.md).

## What the Z3 example shows

The example is intentionally tiny — it reasons over two boolean
facts per S3 bucket and asks "is there any way for public access
to be possible?" The point is the SHAPE of the pipeline, not
feature parity with Stave's own evaluator:

```
observations dir
  -> Stave loader (library API)
  -> []asset.Snapshot
  -> per-bucket Z3 model
  -> Z3 solver SAT/UNSAT verdict
```

When the unsafe predicate is satisfiable Z3 can do something CEL
cannot: extract the **satisfying assignment** — the specific
principal / condition / value tuple that makes the predicate
true. A production solver would render that as a
counterexample-derived suggested fix. The example stops at
SAT/UNSAT; extending it is a project decision.

## When you might want SMT-shaped reasoning

The Z3 example is a starting point for cases where Stave's
predicate-engine model isn't expressive enough:

- **Cross-resource composition** — Z3 reasons over the whole
  policy graph (bucket policy + IAM + PAB + ACL) as one
  constraint system. Stave's per-control predicates evaluate
  one asset at a time.
- **UNSAT proofs** — Z3 can prove a configuration is
  *unsatisfiable* under the actual policy graph (e.g., PAB
  conclusively blocks the policy), where CEL's per-asset
  boolean check cannot prove the negation.
- **Counterexample-derived suggested fixes** — the satisfying
  tuple Z3 returns is a remediation diff. CEL findings ship
  hand-written remediation text from the control YAML.
- **First-class condition encoding** — Z3 can evaluate AWS
  condition operators (`aws:PrincipalOrgID`, `aws:SourceVpce`,
  IPv4 ranges, etc.) with full semantics. CEL handles these
  as opaque boolean property reads requiring upstream
  pre-computation.

For each of those, the path forward is the same: copy the
example's pattern into a new program, add the model and
encoding you need, link libz3, and run. The Stave release
itself is unaffected.

## Confused deputy: the use-existing pattern

The confused deputy is a privilege-escalation pattern where an
attacker tricks a *legitimate, more-privileged* service into
acting on the attacker's behalf. The attacker doesn't need the
privileged permissions directly — they only need the ability to
*invoke* the service that already holds them.

Two distinct shapes of confused deputy exist on AWS, and Stave
detects both via its chain walker:

1. **Create-and-pass** — the attacker has `iam:PassRole` plus a
   service trigger (`lambda:CreateFunction`,
   `cloudformation:CreateStack`, ...). The chain walker emits
   hops named `lambda_exec`, `ecs_exec`, `cfn_exec`,
   `glue_exec`, or `codebuild_exec`.

2. **Invoke-existing** — the privileged role is already bound to
   an existing service resource. The attacker has only the
   trigger action on that specific resource ARN. The chain
   walker emits `lambda_invoke_existing` and
   `cfn_update_existing`.

The invoke-existing variant is the more dangerous of the two: it
hides behind permissions that look harmless in policy review
("only read-only access to one specific function") yet
effectively grant whatever the attached execution role can do.

## Where to read more

- The [Z3 Question Catalogue](z3-question-catalogue.md) — the
  question shapes SMT reasoning is well-suited to answer,
  organised by attack stage (initial access → persistence →
  privilege escalation → lateral movement → exfiltration), plus
  three deeper analysis patterns (unsat-core conflict
  diagnosis, redundancy via subsumption, least-privilege
  optimization).
- The [example's own README](https://github.com/sufield/stave/tree/main/examples/z3-public-exposure)
  for build and run instructions, including the Docker-image
  shortcut (`docker compose run --rm stave --z3-example`).
