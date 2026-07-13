---
title: "Use a reasoning engine with Stave facts"
sidebar_label: "Reasoning Engines"
sidebar_position: 7
description: "Pick the right external reasoning engine for the question you have, export Stave's facts in the format the engine consumes, append a query, and read the verdict back."
---

# How to use a reasoning engine with Stave facts

Stave's CEL evaluator answers per-control questions ("does this
asset violate `CTL.S3.PUBLIC.001`?"). Compound questions — "is
there an attack path from a public Cognito pool to S3?", "what is
the blast radius of compromising this role?", "how much would it
cost an attacker to reach this bucket?" — need a different engine.

This guide is the decision table: pick the engine that matches the
question shape, then run the canonical command.

## Pick the engine

| Question shape | Engine | Format | Why |
|---|---|---|---|
| Per-control violation on a snapshot | **CEL** (built-in) | n/a | Already what `stave apply` does |
| Existence of a configuration that satisfies several constraints simultaneously ("can X happen?") | **Z3** / **cvc5** / **Yices** | `smt2` | SMT solvers are designed for satisfiability over first-order theories |
| Full enumeration of reachable states / blast radius | **Soufflé** | `jsonl` | Datalog evaluates transitive closure bottom-up |
| All combinations of misconfigurations that violate a constraint set | **Clingo** (ASP) | `jsonl` | Stable-model semantics enumerates every solution |
| Boolean compound — "do all five misconfigs co-occur?" | **PySAT** | `jsonl` | SAT is the cheapest engine for boolean compound checks |
| Derivation tree / "why is this reachable?" | **Prolog** | `jsonl` | Backtracking + proof-tree accumulator |
| Probabilistic risk ranking | **Risk model** (Python) | `jsonl` | DTMC over attack-shape probabilities |
| "How far from unsafe?" / drift margin | **TLA+** (Python BFS) | `jsonl` | State-machine + BFS over boolean configuration knobs |
| Attacker cost / remediation ROI | **Game-theory model** | `jsonl` | Maximin over remediation effects on attacker cost |

If the question doesn't fit one row, you probably want to triangulate:
run several engines and look at where they disagree. The
[`compare-engines/`](https://github.com/sufield/stave/tree/main/examples/compare-engines)
harness automates this.

## Three-step workflow

For every engine the workflow is the same:

1. **Export facts** with `stave export-sir --format <jsonl|smt2>`
2. **Append a query** to the exported file (or run a separate
   reasoner script that loads the file)
3. **Invoke the engine** and parse its verdict

Stave never invokes the engine. The engine never invokes Stave.
**Files are the language boundary.**

## Worked example: SMT (Z3)

Question: "Does the snapshot admit an unauthenticated path from a
Cognito pool to an AWS-credentialed S3 read?"

```bash
# 1. Export the facts (closed-world axioms included)
stave export-sir \
  --controls   examples/cognito-self-register-to-aws-creds/controls \
  --observations examples/cognito-self-register-to-aws-creds/fixtures/writeup-config/observations \
  --format smt2 \
  > facts.smt2

# 2. Append the query
cat <<'SMT' >> facts.smt2
(assert (and (allows_unauthenticated "us-east-1:abc" "true")
             (maps_unauth_to "us-east-1:abc" "arn:aws:iam::111:role/auth")))
(check-sat)
(get-model)
SMT

# 3. Invoke the solver
z3 facts.smt2
# => sat
# => (model
#      ... assigns each predicate consistent with the closed-world facts ...)
```

`sat` means the configuration *as exported* admits the unsafe
path. `unsat` means no model satisfies the conjunction — the path
cannot exist given the closed-world fact base. Try the same query
on the `remediated-config` fixture and you'll get `unsat`.

The same `facts.smt2` file works with cvc5 (`cvc5 facts.smt2`) and
Yices (`yices-smt2 facts.smt2`) — none of them know about Stave;
they read the file and apply their solver.

## Worked example: Datalog (Soufflé)

Question: "Which buckets are reachable from any unauthenticated
principal?"

```bash
# 1. Export JSONL triples
stave export-sir --format jsonl \
  --controls   examples/cognito-self-register-to-aws-creds/controls \
  --observations examples/cognito-self-register-to-aws-creds/fixtures/writeup-config/observations \
  > facts.jsonl

# 2. Project to Soufflé positional facts (the example does this for you)
bash stave/examples/souffle-reachability/transform.sh facts.jsonl ./out

# 3. Run Soufflé against the rule program
souffle -F ./out -D ./out stave/examples/souffle-reachability/reachability.dl

cat ./out/reachable.csv
# bucket1
# bucket2
# ...
```

The reachability rules are in `reachability.dl` — Soufflé's bottom-up
evaluator computes the full transitive closure once; querying any
specific question is a CSV lookup against the materialised result.

## Worked example: SAT (PySAT)

Question: "Does this fixture exhibit *all five* compound
misconfigurations of the Capital One pattern simultaneously?"

```bash
# 1. Export JSONL
stave export-sir --format jsonl ... > facts.jsonl

# 2 + 3. The example reasoner reads facts.jsonl and asks the SAT solver
#       to find an assignment of the five compound flags consistent
#       with the facts; UNSAT proves at least one flag is absent.
bash stave/examples/sat-control-regression/run.sh
```

The `run.sh` wrapper activates the `.tools-venv` (which has
`python-sat` installed) and invokes the model script.

## Worked example: ASP (Clingo)

Question: "Enumerate every (subject, kind, object) triple that
violates a structural policy — list, not single witness."

```bash
# 1. Export the facts
./stave export-sir \
  --observations internal/controldata/testdata/s3/delegation/writeup-config/observations \
  --eval-time 2027-01-01T00:00:00Z \
  > /tmp/delegation.jsonl

# 2. Run Clingo with the constraint files
.tools-venv/bin/python3 examples/clingo-constraints/run.py \
  "s3-delegation" /tmp/delegation.jsonl \
  examples/clingo-constraints/constraints.lp \
  examples/clingo-constraints/ai-delegation-shadow.lp
```

The second `.lp` file groups domain-specific rules for AI agent
governance, S3 vendor delegation, IAM role drift / Shadow Admin,
VPC peering, and Shadow EC2. Each `violation/2` or `violation/3`
atom names the structural triple — the triage queue reads the
output verbatim. Where Z3 returns one witness, Clingo's
stable-model semantics enumerates every grounded violation.

## Domain-specific rule files

The catalog ships two domain-grouped rule sets that load
alongside `constraints.lp`:

| File | Rule family | Predicates consumed |
|---|---|---|
| `examples/clingo-constraints/ai-delegation-shadow.lp` | AI agent, S3 delegation, Shadow Admin, VPC peering, Shadow EC2 | `has_agent_*`, `has_delegated_principal`, `has_unknown_delegated_principal`, `has_delegation_scope_exceeded_for`, `has_unused_service`, `has_incompatible_pair`, `has_forbidden_category`, `has_peering_*`, `has_instance_*` |
| `examples/souffle-reachability/delegation-reach.dl` | Per-bucket excessive-reach enumeration + counts | per-principal delegation facts |
| `examples/souffle-reachability/shadow-admin-reach.dl` | Unused-blast-radius count, combined shadow risk join | per-service / per-category facts |

The per-demo `multi-engine-results.md` files
(`examples/{s3-delegation-failure,shadow-admin-detection,demo-ai-security,vpc-peering-exfiltration,shadow-ec2-lateral-movement}/multi-engine-results.md`)
record the actual engine output captured against each writeup +
remediated pair.

## Running them all at once

The comparison harness invokes every available engine on the same
fixture set and reports per-fixture verdict + consensus:

```bash
bash stave/examples/compare-engines/run.sh
```

When the engines agree, you have triangulated evidence. When they
disagree, one of them is encoding a question subtly differently —
that disagreement is itself a finding.

## Troubleshooting

**SMT solver returns `sat` on a remediated fixture.** The
closed-world axiom block is missing — check that the export is
the literal output of `stave export-sir --format smt2`, not a
truncated version. Without closed-world, the solver picks
arbitrary interpretations.

**Soufflé errors with `unrecognized predicate`.** The JSONL
predicate name doesn't match the `.decl` line in your `.dl`
file. Predicate names are stable per the
[Fact Export Reference](../../reference/fact-export.md) — use the
table there.

**`compare-engines/run.sh` skips an engine.** The harness
auto-detects which solvers are on PATH and which Python
extensions are in `.tools-venv`. Run with `--strict` to make
missing engines a hard failure instead of a skip.

## See also

- [Fact Export Reference](../../reference/fact-export.md) — the
  authoritative format / predicate list
- Tutorial: your first multi-engine analysis —
  end-to-end walk-through
- [Files as the language boundary](../../explanation/files-as-the-boundary.md) —
  why the architecture is shaped this way
- The runnable engine examples under
  [`stave/examples/`](https://github.com/sufield/stave/tree/main/examples) —
  every engine has a self-contained `README.md` + `run.sh`
