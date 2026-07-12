# Reasoning Engines

Export Stave's raw observation properties as facts, then run a reasoning engine to compute a multi-hop chain (e.g. user -> role -> admin) by tracing specific ARN edges — not by control co-occurrence.

**Time:** \~30 minutes. **No AWS needed** (works off any observation directory).

## Steps[​](#steps "Direct link to Steps")

### 1. Export facts to JSONL[​](#1-export-facts-to-jsonl "Direct link to 1. Export facts to JSONL")

```
./stave export-sir --observations <your-obs-dir> \
  --format jsonl --eval-time 2026-01-02T00:00:00Z > facts.jsonl
grep -c '"source":"observation"' facts.jsonl
```

Each line is `{subject, predicate, object, source}`. The `predicate` is the dot-joined property path (e.g. `identity.escalation.create_access_key.target_user_arn`).

### 2. Export SMT-LIB[​](#2-export-smt-lib "Direct link to 2. Export SMT-LIB")

```
./stave export-sir --observations <your-obs-dir> \
  --format smt2 --eval-time 2026-01-02T00:00:00Z > check.smt2
o=$(grep -o '(' check.smt2 | wc -l)
c=$(grep -o ')' check.smt2 | wc -l)
[ "$o" = "$c" ] && echo "balanced ($o)" || echo "UNBALANCED"
```

The SMT-LIB declares binary per-path predicates and is facts-only (no `(check-sat)`) — you append your own query.

### 3. Install one engine[​](#3-install-one-engine "Direct link to 3. Install one engine")

```
pip install z3-solver --break-system-packages
# OR: sudo apt install souffle
# OR: sudo apt install swi-prolog
```

### 4. Consume the facts[​](#4-consume-the-facts "Direct link to 4. Consume the facts")

**Souffle / Prolog:** Turn the JSONL triples into `observation(s,p,o)` facts, then write rules that chain edges:

```
escalates(U,T) :-
  observation(U, "identity.escalation.create_access_key.present", "true"),
  observation(U, "identity.escalation.create_access_key.target_user_arn", T).
```

**Z3:** Append a query over the emitted binary predicates and assert the negation of the chain, then `(check-sat)`.

### 5. Run and interpret[​](#5-run-and-interpret "Direct link to 5. Run and interpret")

| Engine     | Signal          | Meaning                                     |
| ---------- | --------------- | ------------------------------------------- |
| Souffle    | Emits a tuple   | Chain is connected between those assets     |
| Prolog     | Proves the goal | A path was traversed                        |
| Z3 `unsat` | Unsatisfiable   | Chain is *forced* by the facts (must exist) |
| Z3 `sat`   | Satisfiable     | Not derivable (edges don't connect)         |

This is graph-traversal compound detection: it fires only when the ARNs connect, which per-resource rules cannot express.

## Done[​](#done "Direct link to Done")

You derived a compound chain from observation primitives with a reasoning engine, independent of Stave's own conclusions.

**Next:** [Snapshot Your Account](/docs/labs/skill-track/snapshot-your-account.md)
