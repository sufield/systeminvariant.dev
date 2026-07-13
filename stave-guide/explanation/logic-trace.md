---
title: "Why the Logic Trace Exists"
sidebar_label: "Logic Trace"
---

# Why the Logic Trace Exists

## The problem with black-box verdicts

Most security tools produce verdicts: "this bucket is non-compliant." But they
don't explain *why*. The finding says what's wrong. It doesn't say how the tool
reached that conclusion.

This creates three problems:

1. **Debugging false positives**: When a finding is wrong, you can't tell if
   the control's predicate is bad, the observation data is missing, or the
   threshold calculation is off. You retry, change inputs, and guess.

2. **Auditor trust**: An auditor asks "how do you know this bucket is
   compliant?" Your tool says exit code 0. That's not evidence — it's a
   boolean. The auditor needs to see the reasoning chain: what was checked,
   what values were observed, what thresholds were applied.

3. **Offline remediation**: In air-gapped environments, you can't connect to
   an AI assistant from the evaluation machine. You need to carry the
   reasoning to a different machine as text.

## The solution: trace.v0.1

The Logic Trace records one assessment per control × asset pair. Each
assessment contains ordered steps showing what the engine examined and
what it concluded:

```
exemption_check → predicate_evaluation → threshold_check → verdict_decision
```

Every step has typed `input` and `result` fields. The trace is deterministic —
same inputs always produce the same trace.

## Proof of Pass

The trace's most underrated feature: it explains *passing* verdicts.

A finding says "this is broken." Absence of a finding says nothing. Was the
control evaluated? Was the asset in scope? Was it exempted? Without the trace,
you don't know.

With the trace:

```json
{
  "verdict": "PASS",
  "steps": [
    {"name": "exemption_check", "result": {"exempted": false}},
    {"name": "predicate_evaluation", "input": {"currently_unsafe": false}, "result": {"matched": false}}
  ]
}
```

The control was evaluated. The asset was not exempted. The predicate didn't
match because the asset is in a safe state. This is the "Proof of Pass" —
auditable evidence that compliance was verified, not just assumed.

## The explainability loop

The trace feeds the prompt generator:

```
stave apply --trace → trace.v0.1 JSON → stave prompt --trace-file → Markdown prompt → AI assistant
```

The prompt includes the reasoning chain alongside the finding details and
control YAML. An AI assistant receiving this prompt can explain:

- Why the predicate matched (which field, which value)
- Why the threshold was exceeded (how many hours, what the SLA is)
- What the remediation should be (grounded in the actual evidence)

This works offline. Generate the prompt on the evaluation machine, carry it
as text to any machine with an AI assistant.

## Air-gap safe, zero overhead when off

The trace deliberately writes a single local JSON file and makes no
network calls — it has no OpenTelemetry dependency, so it is safe to
enable inside air-gapped evaluation environments. When `--trace` (or
`STAVE_TRACE=1`) is not set, the engine uses a zero-allocation no-op
tracer, so there is no performance cost for ordinary runs. The trace is
opt-in observability, not an always-on tax.

## Three layers of trust

| Feature | What it proves |
|---|---|
| `security-audit` | The tool itself is trustworthy (SBOM, build integrity) |
| `apply --trace` | The verdict is justified (step-by-step reasoning) |
| `prompt --trace-file` | The remediation is grounded (AI prompt with evidence) |

Together they form a chain: trust the tool → trust the verdict → trust the fix.

## Logic Trace and SMT-shaped reasoning

The Logic Trace and an SMT solver such as Z3 (illustrated by
`examples/z3-public-exposure/` — see [Stave and Z3](z3-solver.md))
answer different questions. They are not alternatives.

| Question | Answered by |
|----------|-------------|
| **What did Stave's evaluator do, step by step, to reach this verdict?** | Logic Trace (`trace.v0.1`) |
| **Is there any combination of inputs that makes this unsafe predicate satisfiable?** | An SMT solver, run by a separate program that reads Stave's library output |

The Logic Trace is *observability* about Stave's own evaluation
pipeline (Google CEL): exemption check, predicate evaluation,
threshold check, verdict decision. It always fires, every run.

SMT-shaped questions are different — they ask about logical
reachability across a model, not about whether a specific
predicate fires per asset. A program that loads Stave's
snapshot data and runs an SMT solver against it (the example
pattern) does not produce a Logic Trace; it produces SAT/UNSAT
verdicts plus, on SAT, a satisfying assignment that can be
rendered as a counterexample-derived suggested fix.

Use the Logic Trace when you need to explain or audit a Stave
verdict. Use SMT-shaped reasoning when you need
counterexample-derived fix suggestions, full AWS
condition-key semantics, or SAT-grade cross-resource
composition that goes beyond what per-control predicates can
express.

## See also

- [How to Debug Unexpected Findings with the Logic Trace](../how-to/results/logic-trace-debugging.md) —
  the practical recipe, including the `trace.v0.1` step names
  (`exemption_check`, `predicate_evaluation`, `threshold_check`,
  `verdict_decision`) and their typed `input`/`result` fields shown
  against real assessments.
