---
title: "Reasoning Engines"
sidebar_label: "5. Reasoning Engines"
sidebar_position: 5
description: "Export observation facts and derive compound chains with Z3, Souffle, or Prolog."
---

# Reasoning Engines

Export Stave's raw observation properties as facts, then run a reasoning engine to compute a multi-hop chain (e.g. user -> role -> admin) by tracing specific ARN edges — not by control co-occurrence.

**Time:** ~30 minutes. **No AWS needed** (works off any observation directory).

## Steps

### 1. Export facts to JSONL

```bash
./stave export-sir --observations <your-obs-dir> \
  --format jsonl --eval-time 2026-01-02T00:00:00Z > facts.jsonl
grep -c '"source":"observation"' facts.jsonl
```

Each line is `{subject, predicate, object, source}`. The `predicate` is the dot-joined property path (e.g. `identity.escalation.create_access_key.target_user_arn`).

### 2. Export SMT-LIB

```bash
./stave export-sir --observations <your-obs-dir> \
  --format smt2 --eval-time 2026-01-02T00:00:00Z > check.smt2
o=$(grep -o '(' check.smt2 | wc -l)
c=$(grep -o ')' check.smt2 | wc -l)
[ "$o" = "$c" ] && echo "balanced ($o)" || echo "UNBALANCED"
```

The SMT-LIB declares binary per-path predicates and is facts-only (no `(check-sat)`) — you append your own query.

### 3. Install one engine

```bash
pip install z3-solver --break-system-packages
# OR: sudo apt install souffle
# OR: sudo apt install swi-prolog
```

### 4. Consume the facts

**Souffle / Prolog:** Turn the JSONL triples into `observation(s,p,o)` facts, then write rules that chain edges:

```prolog
escalates(U,T) :-
  observation(U, "identity.escalation.create_access_key.present", "true"),
  observation(U, "identity.escalation.create_access_key.target_user_arn", T).
```

**Z3:** Append a query over the emitted binary predicates and assert the negation of the chain, then `(check-sat)`.

### 5. Run and interpret

| Engine | Signal | Meaning |
|--------|--------|---------|
| Souffle | Emits a tuple | Chain is connected between those assets |
| Prolog | Proves the goal | A path was traversed |
| Z3 `unsat` | Unsatisfiable | Chain is *forced* by the facts (must exist) |
| Z3 `sat` | Satisfiable | Not derivable (edges don't connect) |

This is graph-traversal compound detection: it fires only when the ARNs connect, which per-resource rules cannot express.

## Done

You derived a compound chain from observation primitives with a reasoning engine, independent of Stave's own conclusions.

**Next:** [Snapshot Your Account](06-snapshot-your-account.md)
