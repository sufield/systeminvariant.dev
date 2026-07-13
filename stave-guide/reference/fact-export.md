---
title: "Fact Export Reference"
sidebar_label: "Fact Export"
sidebar_position: 18
description: "The on-disk formats Stave produces for external reasoning engines: JSON / JSONL / SMT-LIB v2. Schema, predicate vocabulary, closed-world semantics, exit codes."
---

# Fact Export Reference

Stave evaluates CEL controls and **exports facts**. Two roles, one
binary. This page documents the export side: the `stave export-sir`
command, the three output formats, the predicate vocabulary, and the
closed-world axioms emitted in SMT-LIB.

## Command

```
stave export-sir [flags]
```

Computes the **Stave Intermediate Representation (SIR)** — the
vendor-neutral fact set built by Stave's evaluation pipeline — and
writes it to stdout in the requested format.

### Flags

| Flag | Default | Purpose |
|---|---|---|
| `--controls, -i` | `controls` | Control definitions directory |
| `--observations, -o` | `observations` | Observation snapshot directory |
| `--format, -f` | `json` | One of `json`, `jsonl`, `smt2` |
| `--eval-time` | (current time) | RFC3339 override for deterministic output |
| `--strip-catalog` | `false` | Omit control catalog metadata (`has_severity`, `has_type`, `has_domain`) — reduces SMT2/JSONL to observation-derived facts only |
| `--closed-world` | `false` | Emit closed-world `forall` axioms in SMT2 (needed for negative proofs; can cause solver timeout on large fact sets) |

### Outputs

| Stream | Content |
|---|---|
| stdout | SIR document in the requested format |
| stderr | Errors and progress (suppressed when not a TTY) |

### Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 2 | Input error (bad flag, malformed `--eval-time`, missing files) |
| 4 | Internal error (load failure, builder error) |
| 130 | SIGINT |

## Format: `json` (default)

Full nested SIR document. One top-level object with `controls`,
`assets`, `identities`, `temporal`, and `lifecycle` sections.
Lossless, suitable for tooling that wants the structured shape.

```json
{
  "controls": [{ "id": "CTL.S3.PUBLIC.001", "type": "unsafe_state", "classification": "state_assertion" }],
  "assets":   [{ "id": "res:aws:s3:bucket:example", "type": "storage_bucket", "vendor": "aws" }],
  "identities": [],
  "temporal": { "windows": [...] },
  "lifecycle": { "now": "2026-01-02T00:00:00Z" }
}
```

## Format: `jsonl`

One `(subject, predicate, object)` triple per line. Lossy projection
optimised for **Datalog/Soufflé** and **ASP/Clingo** consumers that
prefer flat `predicate(s, o)` facts.

Each line:

```json
{"subject":"<id>","predicate":"<name>","object":"<value>","source":"<origin>","evidence":"<json-path>"}
```

Example excerpt from a public-bucket fixture:

```jsonl
{"subject":"CTL.S3.PUBLIC.001","predicate":"has_type","object":"unsafe_state","source":"control","evidence":"controls[0].type"}
{"subject":"res:aws:s3:bucket:example-public-bucket","predicate":"has_type","object":"storage_bucket","source":"asset","evidence":"assets[0].type"}
{"subject":"res:aws:s3:bucket:example-public-bucket","predicate":"has_vendor","object":"aws","source":"asset","evidence":"assets[0].vendor"}
{"subject":"res:aws:s3:bucket:example-public-bucket","predicate":"has_exposure_window","object":"true","source":"exposure","evidence":"temporal.windows[0]"}
{"subject":"res:aws:s3:bucket:example-public-bucket","predicate":"contributed_by","object":"CTL.S3.PUBLIC.001","source":"exposure","evidence":"temporal.windows[0].contributing_controls"}
```

`source` and `evidence` carry provenance — the kernel section the
fact came from and a JSON-pointer-style locator into the original
SIR — useful when an engine's output flags a triple and a human
needs to track it back to its origin.

### Loading into Soufflé

```souffle
.decl has_type(s: symbol, o: symbol)
.input has_type(IO=file, filename="facts.jsonl")
```

The example under [`stave/examples/souffle-reachability/`](https://github.com/sufield/stave/tree/main/examples/souffle-reachability)
ships a `transform.sh` that converts the JSONL into Soufflé's
positional `.facts` format if you prefer that over the JSON loader.

## Format: `smt2`

SMT-LIB v2 declarations + assertions. The output contains **facts
only** — no `(check-sat)`, no queries — so any SMT solver (Z3, cvc5,
Yices) reads the same file. Reasoning programs append their own
query to the file before invoking the solver.

```smt
; Stave SIR facts export — SMT-LIB v2
; Predicates declared as Bool functions over String args.
; Closed-world axioms emitted per predicate: the predicate is true
; ONLY for the (subject, object) pairs explicitly asserted; for
; every other input it is false. This is the standard fact-base
; encoding for SAT/SMT consumers.
; This file contains FACTS ONLY. Append your query (check-sat / get-model / etc.) before invoking the solver.
(set-logic ALL)

; --- Predicate declarations ---
(declare-fun allows_unauthenticated (String String) Bool)
(declare-fun can_assume (String String) Bool)
...

; --- Positive assertions ---
(assert (has_type "res:aws:s3:bucket:example" "storage_bucket"))
...

; --- Closed-world axioms ---
(assert (forall ((s String) (o String))
  (=> (has_type s o)
      (or (and (= s "res:aws:s3:bucket:example") (= o "storage_bucket"))
          ...))))
```

### Closed-world semantics

For every declared predicate, the exporter emits a universally
quantified axiom that constrains the predicate to be true **only**
for the explicitly asserted `(subject, object)` pairs. This is
foundational: without it, an SMT solver can pick arbitrary
interpretations of `can_assume`, `allows_unauthenticated`, etc.,
and your reachability queries return spurious satisfying
assignments.

This is the standard "completion" / "domain-closure" pattern for
encoding a finite fact base into first-order logic. Engines like
Soufflé and Clingo enforce closed-world by default; SMT solvers
do not, hence the explicit axioms.

## Predicate vocabulary

The predicate set is determined by the kernel projection — what
Stave's evaluation pipeline produces — not by individual controls.
Adding a control does not extend the predicate set; adding a fact
type to the kernel does.

| Predicate | Arity | Domain | Meaning |
|---|---|---|---|
| `allows_unauthenticated` | (resource, "true"\|"false") | identity | Identity pool admits unauthenticated principals |
| `can_assume` | (from, to) | identity | Trust edge admits the `from` principal into the `to` role |
| `contributed_by` | (asset, control_id) | exposure | This control fired on this asset within an exposure window |
| `cross_account_assumes` | (from, to) | identity | `from` is in a different account than `to` |
| `first_seen_at` | (asset, RFC3339) | lifecycle | Earliest snapshot the asset appears in |
| `has_action` | (statement, action) | policy | IAM policy statement grants this action |
| `has_exposure_window` | (asset, "true") | exposure | Asset has at least one open unsafe-duration window |
| `has_forbidden_state` | (asset, value) | control | Forbidden-state control's metadata |
| `has_intent_rationale` | (asset, text) | control | Author-supplied justification when a control would otherwise fire |
| `has_permission_action` | (identity, action) | identity | Effective permission edge action |
| `has_permission_resource` | (identity, arn) | identity | Effective permission edge resource |
| `has_privilege_level` | (identity, low\|medium\|high) | identity | Coarse privilege classification |
| `has_resource` | (statement, arn) | policy | IAM policy statement targets this resource |
| `has_severity` | (control, low\|medium\|high\|critical) | control | Control's severity metadata |
| `has_tag` | (asset, tag_key:tag_value) | asset | Provider tag on the asset |
| `has_type` | (id, type) | universal | Asset / control / identity type |
| `has_vendor` | (asset, aws\|gcp\|...) | asset | Cloud provider of the asset |
| `is_decommissioned` | (asset, "true") | lifecycle | Asset has been removed since first seen |
| `is_provisioned` | (asset, "true") | lifecycle | Asset is currently provisioned |
| `last_seen_at` | (asset, RFC3339) | lifecycle | Most recent snapshot the asset appears in |
| `maps_auth_to` | (pool, role) | identity | Cognito authenticated-role mapping |
| `maps_unauth_to` | (pool, role) | identity | Cognito unauthenticated-role mapping |
| `self_registration_unrestricted` | (pool, "true") | identity | User pool admits self-registration without scope |
| `trusts_service` | (role, service) | identity | Trust policy admits a service principal |

The current count is 24 predicates. Run `stave export-sir --format smt2 ... | grep '^(declare-fun'`
on any fixture to enumerate what got declared (only predicates that
have at least one positive assertion appear in the output).

## Scope of the exported fact set

The SIR is a curated projection, not a complete dump of every property a
control reads. The CEL evaluation pipeline inside `stave apply` consumes
the full property tree of every observation; the fact export ships a
subset selected for the domains where external reasoning (Z3, cvc5,
Soufflé, Clingo, Prolog) was prioritised.

**Domain coverage measurement** (against the embedded control catalog at
the time of writing — re-derive with `stave forge paths` for a current
snapshot):

| | Top-level domains | Property paths |
|---|---|---|
| Catalog (all controls combined) | 102 | 2,954 |
| Reached by at least one SIR projector | 13 | 1,301 (44%) |
| **Zero coverage** | 89 | 1,653 (56%) |

### Domains with SIR projector coverage

  `ai`, `api`, `auth`, `compute`, `delegation`, `encryption`,
  `identity`, `k8s`, `network`, `s3_ref`, `s3_upload`, `storage`,
  `trail`

Within these domains the projectors emit both the 59-entry scalar
allowlist (`cmd/exportsir/facts.go::propertyAllowlist`) and relational
predicates produced by 19 specialised projectors (IAM policy walk,
trust-policy walk, Cognito mapping, role-chain edges, trail logging,
delegation principals, etc.). The boundary inside each domain is
intentional: e.g. `properties.identity.policies.attached_policies`
is fully exported, but `properties.identity.access_advisor.last_used_at`
is only exported when the `unusedServiceFacts` projector touches it.

### Domains with zero SIR coverage

Top-of-list (highest control-path count first):

  `database` (172), `azure` (154), `search_service` (151),
  `governance` (117), `messaging` (87), `gcp` (85), `cdn` (85),
  `m365` (78), `monitoring` (71), `cryptography` (51),
  `container` (51), `compliance` (51), `secret` (47),
  `audit` (37), `cloudflare` (31), `github` (26),
  plus 73 smaller domains.

Three entire cloud vendors (`azure`, `gcp`, `m365`) and one cloud
service domain (`database`, covering RDS / DynamoDB / Cosmos /
Cloud SQL) have no SIR projector. Their controls evaluate normally
inside `stave apply`; their property values do NOT enter any external
proof. A Z3 `(check-sat)` against `stave export-sir --format smt2`
output reports satisfiability of the chains it can model — it cannot
report satisfiability of a chain whose member predicates live in
an uncovered domain.

### Implication for proof claims

> A solver verdict of UNSAT on the exported facts is a proof that
> the queried chain cannot fire **given the predicates the SIR
> exposes**. It is not a proof that the underlying infrastructure
> is safe along dimensions the SIR does not project.

Practitioners reading a UNSAT result must know which domains the
proof covers. The fact export's coverage is the proof's coverage,
no more.

## Determinism

The exported file is byte-stable for a fixed `(controls,
observations, --eval-time)` triple. The exporter sorts:

- predicate declarations alphabetically
- positive assertions by `(predicate, subject, object)`
- closed-world axiom branches in the same order

This means commits that change the export — for any reason — show
up as targeted diffs in code review, not as gigabyte-of-noise
shuffles. Run the export twice on the same input and compare with
`diff` to confirm.

## What is NOT exported

- **Control predicate bodies** (the CEL expressions). Those stay
  inside the `stave` binary and run during `apply`.
- **Observation raw fields** that didn't make it into the kernel
  projection. The SIR is the projected surface — provider-specific
  noise (timestamps in non-RFC3339 formats, regional ARNs the
  kernel didn't know about) is dropped.
- **Findings**. Findings are the output of `stave apply`, not
  `export-sir`. The SIR is the *input* an external engine needs
  to compute its own verdict; findings are Stave's own verdict.

## See also

- [How to use a reasoning engine with Stave facts](../how-to/controls/reasoning-engines.md) — task-oriented walk-through
- Tutorial: your first multi-engine analysis
- [Explanation: files as the language boundary](../explanation/files-as-the-boundary.md)
- [Z3 Question Catalogue](../explanation/z3-question-catalogue.md) — what kinds of questions SMT can answer
