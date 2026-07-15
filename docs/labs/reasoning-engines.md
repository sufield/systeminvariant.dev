# Tutorial: Your first multi-engine analysis

This tutorial walks you through using Stave in its **two roles**:

1. **As an evaluator** — `stave apply` reads a snapshot and tells you which controls fired (the CEL path).
2. **As a fact exporter** — `stave export-sir` projects the same snapshot into a vendor-neutral fact set, which an external reasoning engine (Z3, Soufflé, Clingo, …) reads to answer compound questions Stave's CEL evaluator cannot.

By the end you will have run **three different reasoning engines against one snapshot** and seen the same compound risk surface through three different lenses.

This is a learning tutorial — every step is concrete. For the authoritative format reference, see [Fact Export](/docs/reference/fact-export.md).

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

| Tool    | Why                        | Install                                                               |
| ------- | -------------------------- | --------------------------------------------------------------------- |
| Stave   | The evaluator and exporter | `cd stave && make build`                                              |
| Z3      | SMT solver                 | `apt install z3` / `brew install z3`                                  |
| Soufflé | Datalog engine             | [souffle-lang.github.io](https://souffle-lang.github.io/install.html) |

If you'd rather skip local install, click the **Open in GitHub Codespaces** badge on the [Stave README](https://github.com/sufield/stave) — the dev container provisions all three tools automatically.

## Step 1 — get a snapshot to analyse[​](#step-1--get-a-snapshot-to-analyse "Direct link to Step 1 — get a snapshot to analyse")

Use the bundled `cognito-self-register-to-aws-creds` example. It ships two fixtures: `writeup-config` (the unsafe configuration modelled on the Capital One credential-bypass pattern) and `remediated-config` (one knob flipped).

```
cd stave
ls examples/cognito-self-register-to-aws-creds/fixtures/
# remediated-config  writeup-config
```

## Step 2 — Stave's own verdict (CEL)[​](#step-2--staves-own-verdict-cel "Direct link to Step 2 — Stave's own verdict (CEL)")

Run the regular evaluator first. This is the baseline — what Stave itself thinks of the snapshot.

```
./stave apply \
  --controls   examples/cognito-self-register-to-aws-creds/controls \
  --observations examples/cognito-self-register-to-aws-creds/fixtures/writeup-config/observations \
  --max-unsafe 12h --eval-time 2026-01-02T00:00:00Z
```

You'll see one or more findings, each tied to a control ID. Exit code 3 means "violations found." This is per-control evaluation — each control evaluates its CEL predicate against each asset, in isolation.

**The question CEL cannot answer**: "Given all five misconfigurations on this snapshot, can an unauthenticated principal *reach* AWS-credentialed S3 reads?" That is a reachability question — composition of facts across controls — and needs a different shape of reasoner.

## Step 3 — export the fact base[​](#step-3--export-the-fact-base "Direct link to Step 3 — export the fact base")

Same snapshot, different command:

```
./stave export-sir \
  --controls   examples/cognito-self-register-to-aws-creds/controls \
  --observations examples/cognito-self-register-to-aws-creds/fixtures/writeup-config/observations \
  --format smt2 > facts.smt2

wc -l facts.smt2
# 200ish lines
head -25 facts.smt2
```

`facts.smt2` contains:

* predicate declarations (`(declare-fun allows_unauthenticated (String String) Bool)` …)
* positive assertions (`(assert (allows_unauthenticated "..." "true"))` …)
* closed-world axioms (`(forall ((s String) (o String)) (=> (allows_unauthenticated s o) ...))`)

It contains **no query** — that's deliberate. The exported file is a fact base; you append a query.

## Step 4 — Z3 answers the reachability question[​](#step-4--z3-answers-the-reachability-question "Direct link to Step 4 — Z3 answers the reachability question")

Append a query that asks "does there exist an unauthenticated identity-pool that maps to a role with broad S3 access?":

```
cat <<'SMT' >> facts.smt2
(assert (exists ((pool String) (role String))
  (and (allows_unauthenticated pool "true")
       (maps_unauth_to pool role)
       (has_permission_action role "s3:*"))))
(check-sat)
SMT

z3 facts.smt2
# sat
```

`sat` is the proof: the closed-world fact base admits a model satisfying the conjunction. Z3 has just told you the path is *possible* given the snapshot — a question CEL never asked.

Re-export with the `remediated-config` fixture instead and the same query returns `unsat`.

## Step 5 — Soufflé enumerates blast radius[​](#step-5--soufflé-enumerates-blast-radius "Direct link to Step 5 — Soufflé enumerates blast radius")

The same snapshot, a different question — "**every** asset that some unauthenticated principal can reach":

```
./stave export-sir \
  --controls   examples/cognito-self-register-to-aws-creds/controls \
  --observations examples/cognito-self-register-to-aws-creds/fixtures/writeup-config/observations \
  --format jsonl > facts.jsonl

bash examples/souffle-reachability/run.sh
```

Soufflé's bottom-up evaluator computes the transitive closure of the reachability relation once and emits **every** reachable asset. Z3 told you "yes, at least one path exists"; Soufflé tells you "here are all of them."

## Step 6 — interpret the three verdicts[​](#step-6--interpret-the-three-verdicts "Direct link to Step 6 — interpret the three verdicts")

You now have three answers to three different questions on the same snapshot:

| Engine                        | Question shape                    | What it told you        |
| ----------------------------- | --------------------------------- | ----------------------- |
| CEL (`stave apply`)           | Per-control violations            | N findings, exit code 3 |
| Z3 (`facts.smt2 + query`)     | "Does an unsafe path *exist*?"    | `sat` (yes)             |
| Soufflé (`facts.jsonl + .dl`) | "**Which** assets are reachable?" | enumerated CSV          |

Each engine is the right tool for one question shape. You picked the engine. Stave handed each one the *same* fact base, in the *format that engine expects*. No subprocess calls between components — the file on disk is the boundary.

## Where to go next[​](#where-to-go-next "Direct link to Where to go next")

* **Run all engines at once.** The [`compare-engines/`](https://github.com/sufield/stave/tree/main/examples/compare-engines) harness invokes every engine on every bundled fixture and reports consensus / disagreement. When engines disagree on the same fixture, that disagreement is itself a finding — one of them is modelling the question subtly differently.
* **Add your own engine.** Drop a `run.sh` and a reasoner script under `stave/examples/<your-engine>/`, consume `facts.jsonl` or `facts.smt2`, emit a verdict. No Stave changes required.
* **Read the format reference.** [Fact Export Reference](/docs/reference/fact-export.md) enumerates the 24 predicates and explains the closed-world axiom block.
* **Read the architecture explanation.** [Files as the language boundary](/docs/explanation/files-as-the-boundary.md) covers why this is shaped as nine engines instead of nine plug-ins.
