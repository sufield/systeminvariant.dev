---
title: "Security and Trust"
sidebar_label: "Security and Trust"
sidebar_position: 1
description: "Technical security assessment of the Stave CLI for security engineers and compliance officers."
---

# Security and Trust

This document is written for security engineers evaluating Stave for deployment and compliance officers assessing it for audit purposes. Every claim is backed by a specific source file reference. Where a claim cannot be verified from the codebase, it is marked accordingly.

## Executive Summary

Stave is an offline, stateless, read-only evaluation engine. It reads configuration snapshots from local files, evaluates them against invariant rules, and writes results to stdout or a user-specified output directory. It makes no network connections, spawns no subprocesses, persists no state between runs, and never modifies its input files.

## Network Isolation

**Claim:** Stave makes zero network connections. It does not resolve DNS, open sockets, or make HTTP requests.

**Evidence:**

- `go.mod` (lines 1-16): The dependency list contains six packages, none of which provide network capabilities:
  - `github.com/santhosh-tekuri/jsonschema/v6` — JSON Schema validation (local)
  - `github.com/spf13/cobra` — CLI framework
  - `github.com/spf13/pflag` — flag parsing
  - `golang.org/x/text` — text processing
  - `gopkg.in/yaml.v3` — YAML parsing
  - `github.com/inconshreveable/mousetrap` — Windows signal handling
- No Go source file in the repository imports `net/http`, `net`, `net/url`, `google.golang.org/grpc`, or any other networking package. This was verified by searching all `.go` files under `stave/`.
- Schema validation uses embedded schemas (`internal/schema/validator.go`, line 16: `//go:embed schemas/*.json`), not schemas fetched from a remote registry.
- All `extract` subcommands operate on local files only. This is stated in `cmd/stave/cmd/extract.go`, line 24: *"Each extractor operates on local files only - no network access."*

**Implication for data exfiltration:** Stave cannot exfiltrate observation data, evaluation results, or any other content over the network. There is no code path that could transmit data to any external endpoint.

## Data Access Scope

**Claim:** Stave reads only the files you point it at. It does not scan the filesystem, read environment variables containing secrets, or access cloud credentials.

**Evidence:**

- Observations are loaded from a user-specified `--observations` directory (or stdin via `--observations -`). The loader (`internal/adapters/input/observations/json/loader.go`, lines 41-98) calls `os.ReadDir()` on that single directory and reads only `.json` files within it.
- Invariants are loaded from a user-specified `--invariants` directory.
- The only environment variable accessed is `NO_COLOR` (`cmd/stave/cmd/root.go`, line 65), which controls terminal color output per the [no-color.org](https://no-color.org) standard. No AWS credentials, API keys, or other secrets are read from the environment.
- Stave does not read `~/.aws/credentials`, `~/.kube/config`, or any other credential file. It has no code to do so.

## Read-Only Input Handling

**Claim:** Stave never modifies observation files, invariant files, or any other input.

**Evidence:**

- The observation loader (`internal/adapters/input/observations/json/loader.go`, line 109) reads files with `os.ReadFile()` — a read-only operation. There is no corresponding `os.WriteFile()`, `os.Create()`, or any write operation targeting the input directory.
- The stdin loader (`internal/adapters/input/observations/json/loader.go`, line 164) reads with `io.ReadAll()` — also read-only.
- The invariant loader reads YAML files and parses them into in-memory domain objects. No write-back occurs.
- The ignore config loader (`internal/domain/ignore.go`, line 41) reads with `os.ReadFile()` — read-only.

## File Write Behavior

**Claim:** Stave writes output files only when explicitly requested via `--out` or `--trace` flags, and only to the directories you specify.

**Evidence — files Stave can write:**

| Flag | Command | Output File | Source |
|------|---------|-------------|--------|
| `--out` | `apply` | `<dir>/evaluation.json` | `cmd/stave/cmd/evaluate.go`, lines 255-259 |
| `--out` | `verify` | `<dir>/verification.json` | `cmd/stave/cmd/verify.go`, lines 200-204 |
| `--out` | `enforce --mode pab` | `<dir>/enforcement/aws/pab.tf` | `cmd/stave/cmd/enforce.go`, lines 84-98 |
| `--out` | `enforce --mode scp` | `<dir>/enforcement/aws/scp.json` | `cmd/stave/cmd/enforce.go`, lines 102-103 |
| `--trace` | any | `<path>/trace.json` | `internal/platform/trace/trace.go`, lines 199-206 |
| `--log-file` | any | `<path>` | `cmd/stave/cmd/root.go`, line 113 |

Without these flags, Stave writes nothing to disk. All evaluation output goes to stdout; logs and diagnostics go to stderr.

## Stateless Execution

**Claim:** Stave maintains no persistent state between runs. There are no databases, caches, configuration files, or hidden directories.

**Evidence:**

- No code creates, reads, or writes to `~/.stave`, `~/.config/stave`, or any other persistent storage location.
- No code creates temporary files outside of test suites (which use `t.TempDir()` for isolated cleanup).
- Each invocation is fully independent. Running `stave apply` twice on the same inputs with the same `--eval-time` flag produces byte-identical output.

## No Subprocess Execution

**Claim:** Stave does not spawn child processes, execute shell commands, or invoke external tools.

**Evidence:**

- No Go source file imports `os/exec`.
- No code calls `exec.Command()`, `exec.CommandContext()`, or any variant.
- The `extract` commands parse local files directly in Go; they do not shell out to `aws`, `terraform`, `kubectl`, or any other CLI.

## Dependency Audit

The complete dependency tree is six packages:

| Package | Version | Purpose | Network Capable |
|---------|---------|---------|-----------------|
| `jsonschema/v6` | v6.0.2 | JSON Schema validation | No |
| `cobra` | v1.10.2 | CLI framework | No |
| `pflag` | v1.0.10 | Flag parsing | No |
| `yaml.v3` | v3.0.1 | YAML parsing | No |
| `x/text` | v0.14.0 | Text/number formatting | No |
| `mousetrap` | v1.1.0 | Windows signal handling | No |

No dependency has network access capability. There are no cloud SDKs, HTTP clients, or gRPC libraries in the dependency tree.

**Note on supply chain risk:** Dependencies are pinned by version in `go.mod` and verified by `go.sum`. The Go module system enforces cryptographic hash verification of downloaded modules. However, like any software, Stave inherits the transitive security posture of its dependencies. Periodic dependency audits are recommended.

## Trace Artifacts and Auditability

When `--trace <path>` is specified, Stave writes a deterministic trace artifact (`internal/platform/trace/trace.go`, lines 16-75) containing:

- **Run metadata:** Stave version, Go version, command name, sanitized arguments
- **Input summary:** File counts, content hashes (SHA-256), and base filenames (not full paths, not file contents)
- **Evaluation statistics:** Rules total, rules skipped, findings by severity and decision
- **Per-finding traces:** Finding ID (deterministic hash of rule ID + resource ID), invariant ID, resource ID, decision, confidence

The trace does **not** contain raw observation data, resource property values, or bucket contents. Input integrity is established via SHA-256 content hashes (`internal/adapters/input/observations/json/loader.go`, lines 84-95), enabling independent verification that the same inputs were used across runs.

## Post-Analysis Data Handling

After evaluation completes, Stave's process exits. In-memory data structures (parsed observations, evaluation results) are freed by the Go runtime's garbage collector when the process terminates. Stave does not:

- Write temporary files containing observation data
- Log sensitive resource properties (properties appear only in stdout findings output, which the caller controls)
- Send telemetry or usage data

The caller controls what happens to evaluation output. If stdout is piped to a file, that file contains evaluation results. If `--out` is used, the output directory contains results. In both cases, retention and access control are the caller's responsibility.

## What Stave Evaluates

Stave evaluates configuration snapshots against declarative safety invariants. As of MVP 1.0, the evaluation engine supports four invariant types (`internal/domain/catalog.go`, lines 43-48):

| Invariant Type | Evaluation | Status |
|---------------|-----------|--------|
| `unsafe_state` | Resource currently unsafe | Supported |
| `unsafe_duration` | Resource unsafe longer than threshold | Supported |
| `unsafe_recurrence` | Resource toggling safe/unsafe repeatedly | Supported |
| `prefix_exposure` | Public access to non-approved S3 key prefixes | Supported |
| `authorization_boundary` | Identity blast radius | Defined, not yet evaluated |
| `audience_boundary` | Third-party audience isolation | Defined, not yet evaluated |
| `justification_required` | Business justification proof | Defined, not yet evaluated |
| `ownership_required` | Owner assignment verification | Defined, not yet evaluated |
| `visibility_required` | Unknown exposure detection | Defined, not yet evaluated |

Invariants in the "Defined, not yet evaluated" category are valid YAML definitions that load without error but are silently skipped during evaluation.

## What Stave Does Not Do

Scope clarity is critical for trust. Stave explicitly does **not**:

- **Connect to AWS, GCP, Azure, or any cloud provider.** Stave evaluates pre-exported configuration snapshots. It never calls cloud APIs. Data collection is a separate step performed by other tools (`aws s3api`, Terraform, or Stave's own `extract` command which itself only reads local files).
- **Scan running infrastructure.** Stave is not a vulnerability scanner, port scanner, or network scanner. It analyzes static configuration data.
- **Detect runtime threats.** Stave does not monitor for intrusions, anomalous API calls, or real-time attacks. It checks whether configurations meet safety properties.
- **Evaluate IAM policies for effective permissions.** Stave checks whether bucket policies grant public or cross-account access. It does not simulate the full IAM policy evaluation chain (SCPs, permission boundaries, session policies).
- **Evaluate non-S3 AWS services.** EC2, RDS, Lambda, DynamoDB, VPC, and other services are not covered. The invariant catalog focuses on S3 storage, exposure management, and third-party boundaries.
- **Guarantee completeness.** Stave can only evaluate what's in the observation snapshots. Missing data (incomplete exports, insufficient IAM permissions during collection) limits coverage. The `INV.S3.INCOMPLETE.001` invariant detects this condition and raises a violation when safety cannot be proven.
- **Replace SIEM, CSPM, or CNAPP tools.** Stave is designed to complement existing security tooling by providing deterministic, auditable, offline evaluation of specific safety properties.

## False Negative Risk

A false negative occurs when Stave reports no violation but an unsafe condition exists. Known causes:

**1. Incomplete observation data.** If the AWS CLI export omits bucket policy or ACL data (due to insufficient IAM permissions), Stave cannot assess that bucket's safety. **Mitigation:** `INV.S3.INCOMPLETE.001` explicitly flags buckets where `safety_provable` is `false`. This converts a silent false negative into an explicit violation.

**2. Insufficient observation coverage.** Duration-based invariants require multiple snapshots spanning the `--max-unsafe` window. With a single snapshot or a span shorter than the threshold, Stave returns `INCONCLUSIVE` — not `PASS` (`internal/domain/evaluator_run.go`, lines 268-274). This prevents false confidence from being reported as a clean bill of health.

**3. Observation gaps.** If snapshots are more than 12 hours apart, Stave returns `INCONCLUSIVE` for duration-based assessments (`internal/domain/evaluator_run.go`, lines 276-282). Confidence levels degrade based on gap size relative to the assessment window (lines 364-384).

**4. Invariant coverage gaps.** Stave evaluates only the invariants in the directory you specify. If no invariant checks for a specific misconfiguration, Stave will not detect it. The invariant catalog is published and version-controlled; review it to understand coverage boundaries.

**5. Open episodes at observation boundaries.** If a resource becomes unsafe in the final snapshot, the duration calculation depends on the `--eval-time` parameter. An incorrect `--eval-time` value can undercount duration. **Mitigation:** Always set `--eval-time` to the current time in production or the latest snapshot time in CI.

## False Positive Risk

A false positive occurs when Stave reports a violation but the resource is actually safe. Known causes:

**1. Clock skew via `--eval-time`.** If `--eval-time` is set significantly after the latest snapshot, duration calculations may overcount. The `diagnose` command detects this condition.

**2. Stale observations.** If observation data is outdated and the resource was remediated after the last export, Stave evaluates the stale state. **Mitigation:** Re-export observations before evaluation.

**3. Intentional configurations flagged as unsafe.** Some environments intentionally use public S3 buckets (e.g., public datasets). **Mitigation:** Use `--ignore` with an ignore list YAML that documents the business justification, or use `scope.exclude` in invariant definitions to exclude specific resource patterns.

**4. Ignored resources are visible.** When resources are excluded via `--ignore`, they appear in the output's `skipped_resources` array (`internal/domain/ignore.go`, lines 32-37) with the matched pattern and reason. This ensures ignore rules are auditable and do not silently mask violations.

## Compliance Mapping

Stave's invariant catalog maps to specific regulatory requirements. The following mapping is based on the invariant definitions in the codebase:

| Requirement | Stave Coverage | Invariants |
|-------------|---------------|------------|
| HIPAA 164.312(a)(1) — Access control | S3 bucket policy and ACL checks | `INV.S3.ACCESS.*`, `INV.S3.PUBLIC.*` |
| HIPAA 164.312(a)(2)(iv) — Encryption | Encryption-at-rest and in-transit | `INV.S3.ENCRYPT.001-004` |
| HIPAA 164.312(b) — Audit controls | Access logging enabled | `INV.S3.LOG.001` |
| HIPAA 164.312(c)(1) — Integrity | Versioning and Object Lock | `INV.S3.VERSION.*`, `INV.S3.LOCK.*` |
| HIPAA 164.530(j) — Retention | 6-year (2190-day) minimum retention | `INV.S3.LIFECYCLE.002`, `INV.S3.LOCK.003` |

**Assertion — not yet independently verified:** No third-party audit has validated these compliance mappings. The mappings are based on the Stave development team's interpretation of the regulatory text. Organizations should independently assess whether Stave's invariants satisfy their specific compliance obligations.

## Audit Status

**Assertion — not yet independently verified:**

- Stave has not undergone a formal third-party security audit or penetration test.
- No SOC 2 Type II report, ISO 27001 certification, or FedRAMP authorization exists for Stave.
- The codebase is open for inspection. The claims in this document can be independently verified by reading the source files referenced in each section.

## Signal Handling

Stave handles `SIGINT` and `SIGTERM` for clean shutdown (`cmd/stave/cmd/root.go`, lines 207-216). On interrupt:

- In-flight evaluation is cancelled via Go context cancellation.
- No partial output is written to `--out` directories.
- The process exits with code 130 (standard SIGINT exit code).
- No cleanup writes, temporary files, or side effects occur beyond process termination.

## Deterministic Output

Same inputs + same `--eval-time` value = byte-identical output. This is by design:

- Findings are sorted by resource ID.
- No timestamps appear in output unless `--log-timestamps` is explicitly enabled (which the documentation notes "breaks determinism").
- Trace artifacts are sorted by finding ID (`internal/platform/trace/trace.go`, lines 192-196).
- Input file hashes (SHA-256) are included in trace artifacts for independent verification.

This property enables golden-file testing in CI and makes evaluation results reproducible across environments.

## Recommendations for Evaluators

1. **Verify network isolation yourself.** Build from source and run under `strace -e trace=network` or equivalent syscall tracing to confirm zero network system calls during evaluation.
2. **Review the dependency tree.** Run `go mod graph` in the `stave/` directory to inspect the full transitive dependency chain.
3. **Inspect what `--trace` captures.** Run an evaluation with `--trace trace.json` and review the output to confirm it contains only metadata and hashes, not sensitive resource data.
4. **Test with known-unsafe inputs.** Use the test fixtures in `stave/testdata/e2e/` to verify that Stave correctly detects violations.
5. **Scope your invariant selection.** Point `--invariants` at only the invariants relevant to your environment. Review each invariant YAML file to understand what it checks and what it does not.
