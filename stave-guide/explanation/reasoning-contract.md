---
title: "The Reasoning Contract"
sidebar_label: "Reasoning Contract"
sidebar_position: 9
description: "Stave is the fact-producing substrate that any reasoning engine can target via a YAML spec format. Validated end-to-end with five independent paradigms (Z3, Soufflé, Clingo, Prolog, PRISM)."
---

# The Reasoning Contract

Stave's most distinctive architectural property isn't compound
risk detection. It's that the same snapshot evaluates correctly
through five structurally different reasoning paradigms — SMT
solvers, Datalog evaluators, answer-set programs, Prolog proof
trees, probabilistic model checkers — without any engine reading
Stave's source code.

This page explains how that contract works, why it matters, and
what it unlocks for community contributors.

## The thesis in one sentence

A security invariant is a YAML file containing (a) a declarative
predicate over snapshot facts, and (b) reasoning-engine bindings
that let any of N engines verify the predicate. **The same artifact
serves as specification, implementation, and test.**

## Why this matters

Most cloud security tools couple their reasoning engine tightly to
their data model. A CSPM has one rule format; a framework-coverage
mod has one query language; an analyzer has one analysis pass.
Adding a new reasoning paradigm means re-implementing the entire
catalog in the new engine's idiom.

Stave decouples them. The catalog lives in YAML + CEL. The export
format is JSON Lines / SMT-LIB / RDF / JSON-LD — engine-agnostic
fact representations. Each reasoning engine reads the fact export
and answers a structurally different question.

| Engine | Question shape |
|---|---|
| **CEL** (built-in) | Does this predicate hold on this asset right now? |
| **Z3 / SMT** | Does there exist any assignment of variables that satisfies this constraint? Show me the witness or prove none exists. |
| **Soufflé / Datalog** | Compute the complete transitive closure. How wide is the blast radius? |
| **Clingo / ASP** | Which assets satisfy this stable-model constraint set? |
| **Prolog** | Trace the proof chain — root, edges, leaves — for this conclusion. |
| **PRISM** | Given the observed configuration, what's the probability the failure path is exploitable? |

One snapshot. Five engines. Five structurally distinct security
questions answered from the same fact base.

## The contract layer

The contract layer between Stave and each engine has three
components:

### 1. A reproducible export pipeline

Each engine consumes a deterministic Stave export:

```bash
# SMT-LIB for Z3, cvc5, Yices
stave export-sir --format smt2 --controls controls/ --observations obs/

# JSON Lines for Soufflé, Clingo, Prolog
stave export-sir --format jsonl --controls controls/ --observations obs/

# JSON-LD / RDF for graph reasoners
stave export-sir --format jsonld --controls controls/ --observations obs/
```

Same snapshot → byte-identical export. Re-running produces
byte-identical output. The contract is anchored by a snapshot,
not by live API state.

### 2. A reasoning spec

For each engine + question pair, a YAML spec at
`reasoning-specs/trials/<name>/` carries:

- `question` — the security question in plain English
- `input` — which export format, which required fields
- `reasoning.steps[]` — the step-by-step chain from input to output
- `output.schema` + `expected_result` — the golden answer for a
  specific fixture
- `validation` — exact_match / semantic_match / ignore rules for
  the trial harness

The spec is engine-agnostic in its structure. Each engine's
spec is concrete enough that an agent with no access to Stave's
source can implement the reasoning correctly.

### 3. A committed golden answer

For each spec, a `golden.yaml` containing the verified output for
one specific fixture. The trial harness diffs an agent's output
against the golden using the spec's validation rules.

## The trial result — what's been validated

`reasoning-specs/TRIAL-RESULTS.md` records the first-round trial.
Five specs, five engines, two trial rounds.

**Round 1 (same-session):**

| # | Trial | Outcome |
|---|---|---|
| 1 | z3-public-read-bucket | **PASS** (exact match on verdict + witness) |
| 2 | souffle-anonymous-reachability | **PASS** (`anonymous_reachable_count: 12` byte-identical) |
| 3 | clingo-violation-atoms | **FAIL → fixed → PASS** (spec bug: wrong predicate name) |
| 4 | prolog-proof-chain | **FAIL → fixed → PASS** (golden transcription bug) |
| 5 | prism-risk-probability | **PASS** (step probs exact, aggregate ±0.005) |

3 PASS straight, 2 caught real defects, 0 unfixable. The trial
harness distinguished the two failure categories cleanly:
- **Category A** (spec bug, Clingo): agent couldn't derive
  engine's output from spec → spec is wrong
- **Category C** (golden bug, Prolog): agent's output matched
  engine's actual output but not golden → golden is wrong

**Round 2 (blind re-run):** A fresh sub-agent with no prior
context re-ran the two trials with spec changes. Both PASSED:

- **Prolog (blind):** the fresh agent derived 12 proofs via the
  cartesian-product semantic — the post-fix golden count —
  without seeing the explanation comment in `spec.yaml`.
- **Clingo (blind):** the fresh agent correctly used
  `has_mfa_enforced` (with the `has_` prefix) — the naming-
  convention rule the post-fix spec added. The convention was
  recoverable from the spec alone.

Full results: `reasoning-specs/TRIAL-RESULTS.md` +
`reasoning-specs/BLIND-TRIAL-RESULTS.md`.

## What the trial proves

The contract layer between Stave and external reasoning engines is
**validated for five paradigms**:

1. **Reasoning specs are sufficient for agent execution.** Blind
   agents produced correct answers from spec + input + export-
   schema alone. No source code access required.

2. **The spec YAML format works.** All five specs parsed cleanly;
   agents followed reasoning steps to completion on every trial.

3. **Stave's export contracts are complete (for the five engines).**
   No missing-input-field warnings from any trial agent.

The failure modes were informative — Category A (spec authoring
discipline) and Category C (golden transcription discipline) were
each surfaced precisely. Future specs that pass Round 1 are
trustworthy; future specs that fail Round 1 fall into one of
those two named categories, with the fix path clear.

## The contribution surface this unlocks

Writing a Stave control means writing YAML + a CEL predicate. The
contributor pool: anyone who can articulate a security property in
a declarative predicate language.

Writing a Stave reasoning spec means writing YAML + reasoning steps
+ a golden answer for one fixture. The contributor pool: anyone who
can articulate a security question + the reasoning chain the engine
should follow + the answer for one snapshot.

In both cases, the contributor pool is roughly *everyone in cloud
security*, not just *people who can read Go and Stave's internals*.

Compare to the typical security-tool contribution surface:

| Tool category | Contribution surface | Contributor pool |
|---|---|---|
| Standard CSPM | Go / Python / TypeScript plugin | "people who can read the tool's codebase" |
| Open-source framework mods | SQL queries against a SQL plugin's tables | "people who can write SQL against the right tables" |
| Falco | YAML rules with condition expressions | "anyone who knows YAML + Falco's condition syntax" |
| Semgrep | YAML rules with pattern syntax | "anyone who knows YAML + Semgrep's pattern syntax" |
| **Stave** | **YAML controls (CEL) + reasoning specs (engine-agnostic)** | **anyone who knows YAML + the security property they want to encode** |

The contribution surface is the predicate language plus the spec
format — neither requires understanding Stave's evaluation
internals.

## What this doesn't mean

This isn't a claim that Stave's compound detection is unnecessary or
that the reasoning-spec layer replaces it. The CEL evaluator
running compound chains is the *primary* path for most operators
most of the time. It's deterministic, fast, ships in the binary,
and produces findings the existing Stave UI surfaces consume.

The reasoning-spec layer is the *secondary* path that comes in two
shapes:

1. **Operators with formal-verification requirements** (regulated
   industries, safety-critical systems) running SMT-LIB exports
   through Z3 or cvc5 to get mathematical proofs of safety
   properties — distinct from "no violation detected today."

2. **Contributors authoring detection logic without writing Go.**
   They author a spec + golden; the spec's engine binding handles
   the evaluation. Their contribution ships exactly the same as if
   it came from the maintainer.

Both shapes coexist with the primary CEL path. None of them
preempt the others.

## Why other tools haven't shipped this

The most common pattern across security tools is a single
hard-coded reasoning paradigm. A CSPM's rule engine is its own
internal codebase; the rules are written against that engine. A
framework-coverage mod's rules are SQL against the mod's chosen
SQL plugin. An analyzer's analysis pass is one specific
abstract interpretation.

To ship a multi-engine contract, two architectural commitments are
required up front:

1. **Snapshot anchoring.** The reasoning engine must see a
   deterministic fact base, not live API state. Live state is
   too fluid for cross-engine comparison; the same query against
   two solvers minutes apart might return different answers
   because the underlying configuration changed between runs.

2. **Engine-agnostic fact export.** The fact set must be
   expressible in formats the target engines natively consume.
   This means SMT-LIB for SMT solvers, ground atoms for ASP /
   Datalog, RDF / JSON-LD for graph reasoners. Stave's
   `internal/core/sirfacts/` package handles this projection
   from the SIR (Stave Intermediate Representation) into each
   engine's native input shape.

Most tools weren't built with these commitments. Adding them
retroactively means rebuilding the data path. Stave was built
this way from the start (the snapshot-anchored evaluation was
present in P0 of the original design; the multi-engine export
was added once the snapshot anchoring was solid).

## What this looks like at fwd:cloudsec

A demonstrable form of the substrate claim: take one snapshot, ask
one security question, and produce three structurally distinct
answers from three independent solvers.

For the question *"can any unauthorized principal reach this
high-sensitivity bucket via some chain of role assumptions?"*:

- **Z3** returns a witness if reachable; `unsat` if provably not.
  The witness names the specific principal + path.
- **Soufflé** computes the complete transitive closure and
  returns the count of (principal, action, resource) tuples plus
  every tuple. Answers "how many?" and "which?"
- **PRISM** returns the probability the reachable path is
  exploitable given the observed configuration's protection
  factors. Answers "how likely?"

Three engines, three perspectives on the same question, one
snapshot. The auditor sees the witness; the architect sees the
blast radius; the risk officer sees the probability. The substrate
serves all three.

## Pointers

- `reasoning-specs/` — five trial-validated specs, one per
  engine
- `reasoning-specs/TRIAL-RESULTS.md` — first-round trial outcomes
- `reasoning-specs/BLIND-TRIAL-RESULTS.md` — fresh-sub-agent
  re-run results
- `reasoning-specs/INVENTORY.md` — engine inventory + gap list
  (7 engines without working examples yet — extension targets)
- `examples/engines/souffle/`, `examples/s3-public-read-policy/`,
  etc. — the working examples each spec is anchored to
- `internal/core/sirfacts/facts.go` — the projection layer that
  produces the engine-agnostic fact set

## The comparison story

Stave's complementary positioning relative to
`turbot/steampipe-mod-aws-compliance` (and framework-coverage mods
generally) extends naturally from the substrate framing.

The original comparison frame: *Stave's compound chain detection
is complementary to AWS Compliance Mod's framework coverage*.
That's still true and still defensible. The substrate frame is
larger: *AWS Compliance Mod implements one reasoning paradigm
(per-resource SQL against framework requirements). Stave is the
substrate any reasoning paradigm can target.*

Both framings are correct. The per-feature framing serves the
operator deciding which tools to install. The substrate framing
serves the architect deciding what category Stave occupies.

See `docs/comparison/aws-compliance-mod.md` for the per-feature
side-by-side; see this page for the substrate framing.
