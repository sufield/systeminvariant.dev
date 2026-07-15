# stave diagnose

Diagnose evaluation inputs and results

## Usage[​](#usage "Direct link to Usage")

```
stave diagnose [flags]
```

## Description[​](#description "Direct link to Description")

Diagnose evaluation inputs and results to identify likely causes of unexpected findings.

Diagnose analyzes controls, observations, and optional prior output to explain why an evaluation produced (or did not produce) certain findings. It is useful for troubleshooting threshold mismatches, clock skew, and predicate logic.

Inputs: --controls Directory containing YAML control definitions --observations Directory containing JSON observation snapshots --previous-output Optional path to existing apply output JSON

Outputs: stdout Diagnostic report (text or JSON with --format json) stderr Error messages (if any)

What it explains:

* Expected violations but got none (threshold too high, time span too short)
* Unexpected violations (clock skew, streak reset)
* Empty findings (no predicate matches, under threshold)
* Configuration mismatches

Subcommands: finding Deep-dive analysis of a single control/asset violation

Exit Codes: 0 - No diagnostic issues found 2 - Invalid input or error 3 - Diagnostic issues detected 130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag                    | Type        | Description                                                                                                                              |
| ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--case`                | stringSlice | Filter to one or more diagnostic case values                                                                                             |
| `-i, --controls`        | string      | Path to control definitions directory (inferred from project root if omitted) (default: `controls`)                                      |
| `--eval-time`           | string      | Evaluation reference timestamp (RFC3339). Durations and temporal risk are measured against this time. Defaults to wall clock.            |
| `-f, --format`          | string      | Output format: text or json (default: `text`)                                                                                            |
| `--max-unsafe`          | string      | Maximum allowed unsafe duration (e.g., 24h, 7d) Resolved default may come from STAVE\_\* env vars, stave.yaml, user config, or built-in. |
| `--no-pager`            | bool        | never page output, even on a terminal                                                                                                    |
| `-o, --observations`    | string      | Path to observation snapshots directory (inferred from project root if omitted) (default: `observations`)                                |
| `-p, --previous-output` | string      | Path to existing apply output JSON (optional; if omitted, runs apply internally)                                                         |
| `--signal-contains`     | string      | Filter diagnostics by signal substring (case-insensitive)                                                                                |
| `--template`            | string      | Template string for custom output formatting (supports {{.Field}}, {{range}}, {{json}})                                                  |

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                             | Description                                                            |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`stave diagnose explain`](/docs/reference/cli-reference/stave-diagnose-explain.md) | Generate guided remediation playbook for a finding                     |
| [`stave diagnose finding`](/docs/reference/cli-reference/stave-diagnose-finding.md) | Deep-dive analysis of a single finding                                 |
| [`stave diagnose report`](/docs/reference/cli-reference/stave-diagnose-report.md)   | Generate a plain-text report from evaluation output                    |
| [`stave diagnose trace`](/docs/reference/cli-reference/stave-diagnose-trace.md)     | Trace predicate evaluation for a single control against a single asset |

## Examples[​](#examples "Direct link to Examples")

```
# Basic diagnosis
  stave diagnose --controls ./controls --observations ./obs

  # Automation/CI mode (exit code only)
  stave diagnose --controls ./controls --observations ./obs --quiet

  # Troubleshooting an existing apply output
  stave diagnose --previous-output previous-run.json --controls ./controls --observations ./obs

  # JSON output for scripting
  stave diagnose --controls ./controls --observations ./obs --format json

  # Show only threshold/span diagnostics
  stave diagnose --controls ./controls --observations ./obs --case expected_violations_none

  # Diagnose from stdin (pipe evaluation output)
  stave apply --controls ./controls --observations ./obs | stave diagnose --previous-output - --controls ./controls --observations ./obs

  # Deep dive into a single finding (subcommand)
  stave diagnose finding --control-id CTL.S3.PUBLIC.001 --asset-id my-bucket \
    --controls ./controls --observations ./obs
```
