# stave apply

Run control evaluation after plan checks pass

## Usage[​](#usage "Direct link to Usage")

```
stave apply [flags]
```

## Description[​](#description "Direct link to Description")

Apply executes control evaluation and produces safety findings.

Modes: Default Evaluate observations against controls in a project directory. --auto Discover→plan→evaluate pipeline. Requires --services or --pack. Prints a severity-weighted plan to stderr, then evaluates. --dry-run Run readiness checks only, without evaluating controls. --profile Evaluate a bundled observations file against a built-in control pack. Requires --input. Example: stave apply --profile aws-s3 --input obs.json

Inputs: --controls, -i Path to control definitions directory (default: controls/s3) --observations, -o Path to observation snapshots directory (default: observations) --pack Scope evaluation to a concern pack's controls (repeatable; see "stave pack list") --services Scope evaluation to controls for these AWS services (comma-separated, e.g. iam,s3 — see "stave plan") --all Evaluate the full catalog; print findings grouped per service, then compound, then a summary --profile, -p Evaluation profile (e.g., aws-s3) --input Path to observations bundle file (required with --profile) --max-unsafe Maximum allowed unsafe duration (default: from project config) --eval-time Evaluation reference timestamp (RFC3339) for deterministic output --format, -f Output format: text, json, or sarif (default: text) --dry-run Run readiness checks only

Outputs: stdout Evaluation findings (JSON, text, or SARIF) stderr Progress and diagnostic messages

Exit Codes: 0 - Evaluation completed with no violations 2 - Invalid input or configuration error 3 - Violations found 4 - Internal error 130 - Interrupted (SIGINT)

Remediation scope: Stave produces findings with structured remediation data (asset-parameterized CLI in findings\[].fix\_plan.command, property-level changes in findings\[].remediation\_context.changes, AI-prompt-ready context in findings\[].remediation\_context). It does NOT execute remediation. Pipe apply output to downstream tooling — AI prompts, CI/CD pipelines, ticket systems — for fix generation. There is no --apply-fixes flag and no auto-fix mode; the boundary is the data, not the change.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag                     | Type        | Description                                                                                                                                                                                                                                                                                                              |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--acknowledgment-file`  | string      | Path to acknowledgment config YAML file                                                                                                                                                                                                                                                                                  |
| `--all`                  | bool        | Evaluate the full catalog and print findings grouped per service, then compound, then a summary                                                                                                                                                                                                                          |
| `--assert-recent`        | string      | Fail if no snapshot newer than this duration (e.g. 48h)                                                                                                                                                                                                                                                                  |
| `--assets`               | string      | asset sensitivity classification manifest YAML                                                                                                                                                                                                                                                                           |
| `--auto`                 | bool        | Run discover→plan→evaluate: resolve services, show severity plan, evaluate in weighted order                                                                                                                                                                                                                             |
| `--baseline`             | string      | SARIF baseline file for baseline state comparison                                                                                                                                                                                                                                                                        |
| `--bucket-allowlist`     | stringSlice | Bucket names/ARNs to include                                                                                                                                                                                                                                                                                             |
| `-i, --controls`         | string      | Path to control definitions directory (default: `controls`)                                                                                                                                                                                                                                                              |
| `--dry-run`              | bool        | Run readiness checks only, without evaluating controls                                                                                                                                                                                                                                                                   |
| `--eval-time`            | string      | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock.                                                                                                                                                                                            |
| `--exemption-file`       | string      | Path to asset exemption list YAML file                                                                                                                                                                                                                                                                                   |
| `-f, --format`           | string      | Output format (text, json, or sarif) (default: `text`)                                                                                                                                                                                                                                                                   |
| `--history`              | string      | Directory of historical assessment JSON files (for --new-only)                                                                                                                                                                                                                                                           |
| `--include-all`          | bool        | Disable health scope filtering                                                                                                                                                                                                                                                                                           |
| `--input`                | string      | Path to observations bundle file (required with --profile)                                                                                                                                                                                                                                                               |
| `--integrity-manifest`   | string      | Path to manifest JSON containing expected hashes                                                                                                                                                                                                                                                                         |
| `--integrity-public-key` | string      | Path to Ed25519 public key for signed manifests                                                                                                                                                                                                                                                                          |
| `--max-unsafe`           | string      | Maximum allowed unsafe duration Resolved default may come from STAVE\_\* env vars, stave.yaml, user config, or built-in.                                                                                                                                                                                                 |
| `--new-only`             | bool        | Show only findings not present in previous assessment                                                                                                                                                                                                                                                                    |
| `--new-since`            | string      | Show only findings not present in assessments within this window (e.g. 7d)                                                                                                                                                                                                                                               |
| `-o, --observations`     | string      | Path to observation snapshots directory (default: `observations`)                                                                                                                                                                                                                                                        |
| `--overlay`              | string      | environment-specific severity overlay YAML                                                                                                                                                                                                                                                                               |
| `--owner-filter`         | stringSlice | Team IDs to filter findings (repeatable or comma-separated)                                                                                                                                                                                                                                                              |
| `--pack`                 | stringArray | Scope evaluation to a concern pack (repeatable). Example: stave apply --pack entropy -o snapshot/                                                                                                                                                                                                                        |
| `-p, --profile`          | string      | Evaluation profile (e.g. aws-s3)                                                                                                                                                                                                                                                                                         |
| `--profile-file`         | stringSlice | custom compliance profile YAML (can be repeated)                                                                                                                                                                                                                                                                         |
| `--services`             | stringSlice | Scope evaluation to controls for these AWS services (comma-separated). Example: stave apply --services iam,s3 -o snapshot/                                                                                                                                                                                               |
| `--show-suppressed`      | bool        | include overlay-suppressed controls in output                                                                                                                                                                                                                                                                            |
| `--sla-policy`           | string      | SLA breach exit code behavior: warn, strict, critical-only (default: `warn`)                                                                                                                                                                                                                                             |
| `--sla-profile`          | string      | SLA policy profile (pci\_dss\_v4, hipaa, soc2, fedramp\_moderate, default)                                                                                                                                                                                                                                               |
| `--sla-profile-file`     | string      | path to custom SLA policy YAML file                                                                                                                                                                                                                                                                                      |
| `--team-manifest`        | string      | Path to stave-teams.yaml for owner routing                                                                                                                                                                                                                                                                               |
| `--trace`                | string      | Write full step-by-step audit trace to file. Every finding already emits a compact reasoning\_trace inline (rendered as prose in text output, as raw DSL in JSON/SARIF); this flag writes the full Assessment.Steps\[] superset to a separate file for users who want the precise predicate-DSL form or per-step timing. |
| `-v, --verbose`          | bool        | Show full evidence, reasoning, and remediation for each finding                                                                                                                                                                                                                                                          |

## Examples[​](#examples "Direct link to Examples")

```
# Guided evaluation: discover services, plan severity order, evaluate
  stave apply --auto --services iam,s3,lambda -o ./snapshots/

  # Standard evaluation
  stave apply --controls ./controls --observations ./obs --format json

  # Scope evaluation to one concern pack
  stave apply --pack entropy --observations ./obs

  # Readiness check only (dry run)
  stave apply --dry-run

  # Profile-based evaluation with bundled observations
  stave apply --profile aws-s3 --input observations.json --eval-time 2026-01-15T00:00:00Z
```
