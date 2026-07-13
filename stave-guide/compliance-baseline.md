# CLI Compliance Baseline

Established 2026-03-27. Updated 2026-03-30.

## Coverage Summary

| Layer | Coverage | Purpose |
|-------|----------|---------|
| Unit tests (`make test`) | 71.4% | All internal logic, pure functions, domain services |
| Behavioral tests (`make script-test`) | 37.1% | 21 testscripts verify core commands work as documented |
| **Combined (unit + testscript)** | **80.8%** | Merged coverage profiles uploaded to Codecov |

## What 80.8% Covers

### Unit Tests (71.4%)
- Core domain logic: evaluation engine, exposure classifier, diagnosis
- Value objects: Severity, ControlID, Digest, Schema, all kernel types
- Aggregates: Snapshot, Result, Timeline, EpisodeHistory, ProfileReport
- Domain services: Evaluate, ClassifyExposure, Detect compound risks
- Config resolution across all 4 layers (default/user/project/env)
- HIPAA controls, compound rules, profile evaluation
- Security audit builders, evidence parsers, report formatters
- Output adapters: JSON, text, SARIF, markdown formatters
- CLI helpers: options validation, flag parsing, output rendering

### Behavioral Tests (37.1%)

- All output formats (JSON, text, SARIF) for the apply command
- Exit codes: 0 (clean), 3 (violations), non-zero (bad input)
- Stdout/stderr separation: data to stdout, messages to stderr
- Determinism: identical inputs produce byte-identical output
- `--quiet` suppresses non-essential output
- `--sanitize` redacts infrastructure identifiers
- Built-in controls, aliases, and packs respond
- CI workflow: baseline save/check, gate, diff
- Snapshot operations: diff, quality, plan, archive, hygiene, upcoming
- Diagnose, trace, explain, validate, lint, fmt
- Report and prompt from evaluation output
- Profile mode with built-in controls
- Doctor and bug-report
- Help discovery on root and all command groups
- Config show, env list, context help

## What the Remaining ~19% Contains

- Cobra `RunE` handlers requiring full command lifecycle
- Bootstrap/executor code (CLI entrypoints, signal handling)
- I/O-heavy adapters (git info, file watchers, bundle writers)
- Interactive terminal paths (TTY prompts, progress bars)
- Rare error paths (filesystem failures, corrupt input)

## When to Add More Scripts

1. **New subcommand added** -- add a happy-path script immediately
2. **Bug found** -- write a testscript that reproduces it, then fix
3. **Destructive command** -- 100% coverage of dry-run and confirmation

## Makefile Targets

```
make clig-check       # Metadata: all commands have required fields
make script-test      # Behavior: 21 testscripts exercise real commands
make test-compliance  # Both layers + coverage percentage
make cover-report     # HTML report for browser inspection
```

## 21 Testscripts

| Script | What it verifies |
|--------|------------------|
| smoke | Version and help respond |
| help_discovery | --help/-h on root + all command groups |
| exit_codes | Exit 0/3/non-zero for expected scenarios |
| streams | JSON to stdout, messages to stderr |
| json_validity | apply/doctor/capabilities produce valid JSON |
| determinism | Two runs produce identical output |
| quiet_verbose | --quiet suppresses stderr |
| sarif_output | --format sarif produces SARIF structure |
| sanitize | --sanitize redacts identifiers |
| controls_packs | Built-in controls, aliases, packs |
| config_lifecycle | Config show, env list, context help |
| snapshot_commands | All snapshot subcommand help texts |
| lint_fmt_graph | lint/fmt/graph help texts |
| doctor_bug_report | Doctor JSON, bug-report creates bundle |
| apply_pipeline | Full apply with JSON/text/SARIF + clean/violations |
| diagnose_trace_explain | Diagnose, trace predicate, explain control |
| validate_lint_fmt | Validate, lint, fmt against real controls |
| snapshot_operations | diff, quality, plan, archive, hygiene, upcoming |
| ci_workflow | Baseline save/check, gate, diff |
| report_prompt | Report from eval JSON, prompt from finding |
| profile_builtin | apply --profile aws-s3 with built-in controls |
