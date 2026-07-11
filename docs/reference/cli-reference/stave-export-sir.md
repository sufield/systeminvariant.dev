# stave export-sir

Export the Stave Intermediate Representation as JSON

## Usage[​](#usage "Direct link to Usage")

```
stave export-sir [flags]
```

## Description[​](#description "Direct link to Description")

Export the Stave Intermediate Representation (SIR) for the configured controls and observations as a deterministic document.

The SIR is the vendor-neutral fact set the Z3 solver consumes for compound risk reasoning. It carries every control fact, asset, identity (with transitive role chains), effective-permission edge, and exposure window that the engine's evaluation pipeline produces — but stripped of infrastructure noise (file paths, git metadata, tool versions).

Scope: the SIR is a curated projection, not a complete dump of every property a control reads. The export currently covers 13 top-level configuration domains (IAM, Cognito, S3 storage policies, Bedrock AI agents, delegation, credential lifecycle, trail logging, network, and a subset of compute / k8s). Properties in uncovered domains (Azure, GCP, M365, databases, messaging, secrets, monitoring, and 80+ others) are evaluated by CEL controls inside 'stave apply' but are NOT in the export. A solver UNSAT verdict is valid for chains the SIR can express; it is silent about chains whose members live in uncovered domains. See the Fact Export reference in stave-guide for the full domain table.

Three output formats are supported:

json — full nested SIR document (default). jsonl — one (subject, predicate, object) triple per line. Lossy projection optimised for Datalog/Soufflé and ASP/Clingo consumers that prefer flat predicate(s, o) facts. smt2 — SMT-LIB v2 declarations + assertions. The output contains facts only — no (check-sat), no queries — so any SMT solver (Z3, cvc5, Yices) reads the same file. Reasoning programs append their own query to the file before invoking the solver.

Inputs: --controls, -i Control definitions directory (default: controls) --observations, -o Observation snapshots directory (default: observations) --format, -f Output format: json | jsonl | smt2 (default: json) --eval-time RFC3339 timestamp for deterministic output

Outputs: stdout: SIR document in the requested format. stderr: errors and progress (when stderr is a TTY).

Exit codes: 0 success 2 input error (bad flag, malformed --eval-time) 4 internal error (load failure, builder error) 130 SIGINT

## Flags[​](#flags "Direct link to Flags")

| Flag                 | Type   | Description                                                                                                                                                                                                                                                                                      |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--allowlist-mode`   | string | scalar projector mode: curated (default — 59 hand-authored entries) \| full (experimental — emit one auto\_prop\_ triple per control-read property path the predicate index advertises; measures coverage gain, no downstream solver consumes the auto\_prop\_\* names yet) (default: `curated`) |
| `--closed-world`     | bool   | emit closed-world forall axioms in SMT2 output (restricts each predicate to its asserted tuples only; needed for negative proofs but causes solver timeout on large fact sets)                                                                                                                   |
| `-i, --controls`     | string | control definitions directory (default: `controls`)                                                                                                                                                                                                                                              |
| `--eval-time`        | string | Evaluation reference timestamp (RFC3339) for deterministic output                                                                                                                                                                                                                                |
| `-f, --format`       | string | output format: json \| jsonl \| smt2 (default: `json`)                                                                                                                                                                                                                                           |
| `-o, --observations` | string | observation snapshots directory (default: `observations`)                                                                                                                                                                                                                                        |
| `--strip-catalog`    | bool   | omit control catalog metadata (has\_severity, has\_type, has\_domain) from the fact stream; reduces SMT2/JSONL output to observation-derived facts only                                                                                                                                          |
| `--validate`         | bool   | check SIR coverage against CEL controls and warn on stderr about projection gaps (controls that fire in CEL but evaluate properties not projected as SIR facts)                                                                                                                                  |

## Examples[​](#examples "Direct link to Examples")

```
# Export SIR for the project's default controls + observations
  stave export-sir > sir.json

  # Pin --eval-time for byte-identical reproduction
  stave export-sir --eval-time 2026-05-01T12:00:00Z > sir.json

  # Pretty-print for inspection
  stave export-sir | jq .

  # Triple form for Datalog / ASP consumers
  stave export-sir --format jsonl > facts.jsonl

  # SMT-LIB v2 facts; append a query before piping into z3 / cvc5
  stave export-sir --format smt2 > facts.smt2
  cat facts.smt2 query.smt2 | z3 -in
```
