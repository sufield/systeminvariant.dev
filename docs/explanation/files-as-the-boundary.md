# Files as the language boundary

Stave does **two things**:

1. Evaluates `ctrl.v1` predicates with **Google CEL**, in-process, producing findings.
2. Projects observations + controls into a **vendor-neutral fact base** (the SIR), serialised in JSON / JSONL / SMT-LIB v2.

Everything else — Z3, cvc5, Yices, Soufflé, Clingo, Prolog, PySAT, the probabilistic risk model, the TLA+ Python BFS, the game-theory cost model, the compliance evidence translator — is an **external program** that reads one of those files. None of them is invoked by Stave. None of them invokes Stave. The on-disk file is the only thing they share.

This page explains why that's the right architecture for a multi-engine reasoning surface, what it costs, and where it breaks down.

## What "files as the boundary" means[​](#what-files-as-the-boundary-means "Direct link to What \"files as the boundary\" means")

Concretely, the architecture is:

```
        observations/  +  controls/
              │
              ▼
       ┌─────────────┐
       │   stave     │   evaluator (CEL)  ──▶  findings
       │             │
       │             │   exporter (SIR)   ──▶  facts.jsonl
       │             │                    ──▶  facts.smt2
       └─────────────┘
                                          ───────┐
                                                 ▼
                              ┌─────────┐  ┌─────────┐  ┌─────────┐  …
                              │   z3    │  │ souffle │  │  clingo │
                              └─────────┘  └─────────┘  └─────────┘
                                  │            │            │
                                  ▼            ▼            ▼
                              verdict      verdict      verdict
```

Stave runs once, writes the fact files, exits. Then any number of engines run, independently, against those files. Same input, different reasoners, different verdicts.

## Why files instead of subprocess calls[​](#why-files-instead-of-subprocess-calls "Direct link to Why files instead of subprocess calls")

A naïve design would let `stave apply` shell out to Z3 when a control needs SMT, to Soufflé when a control needs Datalog, etc. That would compose the engines as **plug-ins**. We did not do that. Three reasons:

### 1. The reasoner zoo is unbounded[​](#1-the-reasoner-zoo-is-unbounded "Direct link to 1. The reasoner zoo is unbounded")

A scanner asks "is this setting bad?" An SMT solver asks "is this state mathematically *possible* given the whole system?" A Datalog engine asks "what is the **transitive closure** of this relation?" An ASP solver asks "**enumerate** every assignment that satisfies these constraints." A SAT solver asks "is the boolean compound of these flags satisfiable?" A probabilistic model asks "what is `P(exploitation)`?" A game-theory model asks "what does the *attacker* spend?" And so on.

Each engine has a *different question shape*. There is no one right answer to "what's the unsafe path?" — only a question about reachability that maps onto SMT, a question about full enumeration that maps onto Datalog, a question about probability that maps onto a Markov chain, etc.

Wiring all of them as plug-ins inside Stave would require Stave to know each engine's runtime, library bindings, version compatibility, license terms, OS-level dependencies (libz3, libffi, JVM, …) — an enormous surface that grows every time someone wants to try a new reasoner. **Files as the boundary let new engines arrive and depart without touching Stave.**

### 2. Air-gapped + reproducible analysis[​](#2-air-gapped--reproducible-analysis "Direct link to 2. Air-gapped + reproducible analysis")

Stave is designed to run on snapshots without cloud credentials, in air-gapped or compliance-restricted environments. If Stave needed to spawn Z3 / Soufflé / a Java JVM for TLA+ at evaluation time, every Stave deployment would need every reasoner installed. By exporting facts to disk, the exact same `facts.smt2` file can be archived and re-analysed years later by any contemporary SMT solver — even one that did not exist when Stave produced the file.

The fact base is byte-deterministic for a fixed `(controls, observations, --eval-time)` triple, so commits that change the export show up as targeted diffs, not noise.

### 3. Independent verification[​](#3-independent-verification "Direct link to 3. Independent verification")

When a CEL control says "this is unsafe," it's Stave's verdict. That's enough for many users. For others — auditors, threat modellers, security researchers — "Stave says so" is not a proof.

The fact base lets a third party take the *same* SIR file and run it through a *different* reasoner. If Z3 returns `sat` on the same query Stave's CEL flagged, two engines now agree — that's stronger than one. If they *disagree*, you have a real finding: one of them is encoding the question differently, and the disagreement itself is informative.

## What this costs[​](#what-this-costs "Direct link to What this costs")

There's no free lunch.

**Costs the file boundary pays:**

* **No real-time engine routing.** Stave can't say "this control is too expressive for CEL — fall back to SMT." If an invariant needs SMT, you write a CEL control that flags the *enabling conditions*, then point an external SMT prover at the exported facts. Two passes, on the user's terms.

* **Engine selection is the user's job.** A user with no SMT background sees `examples/z3-multi-hop-can-assume/` and is expected to either (a) follow the `run.sh` recipe blindly or (b) understand SMT enough to compose their own queries. We ship a [decision table](/docs/how-to/controls/reasoning-engines.md) and a [comparison harness](https://github.com/sufield/stave/tree/main/examples/compare-engines) to soften the curve, but the cost is real.

* **No streaming.** The fact base is a file. You can't stream partial results or interleave Stave's evaluation with a long-running solver invocation. For huge snapshots this is the cost of choosing batch over streaming.

**Costs the file boundary avoids:**

* We don't ship Z3 / Soufflé / cvc5 binaries with Stave.
* We don't link libz3 / libcvc5 with cgo.
* We don't track every reasoner's CVE / license / API drift.
* A new engine arriving doesn't bump Stave's version.

## When the boundary breaks[​](#when-the-boundary-breaks "Direct link to When the boundary breaks")

Two cases where files-on-disk is not the right boundary:

1. **Single-pass interactive UX.** A "type a control, see SAT result instantly" UI wants in-process composition. Stave's library API + `aclements/go-z3` cgo binding is appropriate for that case — see [Stave and Z3](/docs/explanation/z3-solver.md). The library API is for tools that *embed* Stave; the file boundary is for tools that *consume* Stave's output.

2. **Engine-internal feedback loops.** If a reasoner needs to query Stave's library to refine its model (e.g., an interactive proof-search where the user clicks an assumption and the prover asks "what asset would make this hold?"), file-on-disk round-tripping is too slow. Embed Stave instead.

The file boundary is the **default** because most engines are batch reasoners with non-trivial install footprints. The library API is available for the cases where files don't fit.

## Why nine engines, not one super-engine[​](#why-nine-engines-not-one-super-engine "Direct link to Why nine engines, not one super-engine")

You might ask: instead of nine engines, why not write the most expressive logic (say, Z3) and encode every question against it?

Two reasons.

**Z3 cannot enumerate.** SMT is satisfiability — "does *some* model exist?" If you want every assignment that satisfies a constraint, you query Z3 N times in a loop, blocking each previous solution. That's strictly weaker than ASP / Datalog, where enumeration is the default semantic.

**Z3 cannot quantify probability.** Z3 has no native notion of "this configuration is 60% likely to be exploited." That's a DTMC question. Encoding probability into SMT is awkward and loses the modelling clarity that makes the probabilistic engine worth running in the first place.

The right engine for a question is the one whose **native semantics** match the question. The file boundary lets every engine speak in its own language without forcing a single encoding to be the lowest common denominator.

## In one sentence[​](#in-one-sentence "Direct link to In one sentence")

Stave evaluates with CEL and exports facts; everything else is an external program reading those facts; the file on disk is the only contract any of them shares.

## See also[​](#see-also "Direct link to See also")

* [Fact Export Reference](/docs/reference/fact-export.md) — what's in the file
* [How to use a reasoning engine with Stave facts](/docs/how-to/controls/reasoning-engines.md) — decision table + commands
* Tutorial: your first multi-engine analysis
* [Stave and Z3](/docs/explanation/z3-solver.md) — the library-API alternative for the embedded-prover case
