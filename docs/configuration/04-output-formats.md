---
title: "Output Formats"
sidebar_label: "Output Formats"
sidebar_position: 4
description: "JSON, text, and markdown output options in Stave."
---

# Output Formats

Stave supports multiple output formats for different use cases.

## JSON (Default for `apply`)

```bash
stave apply --invariants ./inv --observations ./obs --format json
```

Structured output following the `out.v0.1` schema. Machine-readable, suitable for piping to `jq` or ingestion by other tools. Results go to stdout; errors and logs go to stderr.

```bash
# Count violations
stave apply --invariants ./inv --observations ./obs | jq '.summary.violations'

# List violated resource IDs
stave apply --invariants ./inv --observations ./obs | jq -r '.findings[].resource_id'

# Get unique violated invariant IDs
stave apply --invariants ./inv --observations ./obs | jq -r '.findings[].invariant_id' | sort -u
```

## Text

```bash
stave apply --invariants ./inv --observations ./obs --format text
```

Human-readable output for terminal use. Includes color when the terminal supports it (respects `NO_COLOR` environment variable).

## Quiet Mode

```bash
stave apply --invariants ./inv --observations ./obs --quiet
```

Suppresses all output. Use the exit code to determine the result:
- `0` = no violations
- `3` = violations found

## Writing Output to a Directory

```bash
stave apply --invariants ./inv --observations ./obs --out ./results
```

Writes `evaluation.json` to the specified directory (created if it doesn't exist). Output is still printed to stdout as well.

## Global Output Mode

The `--output` global flag (distinct from `--format`) controls whether all CLI output uses JSON or text envelope format:

```bash
# JSON envelope for all commands
stave --output json evaluate --invariants ./inv --observations ./obs

# Text envelope (default)
stave --output text evaluate --invariants ./inv --observations ./obs
```

In JSON mode, output is wrapped in an envelope:

```json
{
  "ok": true,
  "data": {
    "schema_version": "out.v0.1",
    "kind": "evaluation",
    "summary": {
      "resources_evaluated": 5,
      "attack_surface": 2,
      "violations": 3
    }
  }
}
```

## Validation Output

The `validate` command defaults to text output but supports JSON:

```bash
stave validate --invariants ./inv --observations ./obs --format json
```

```json
{
  "schema_version": "validate.v0.1",
  "valid": true,
  "errors": [],
  "warnings": [],
  "summary": {
    "invariants_checked": 10,
    "snapshots_checked": 2,
    "resource_observations_checked": 15,
    "identity_observations_checked": 0,
    "context_provided": false
  }
}
```

## Coverage Graph Output

The `graph coverage` command outputs in DOT (default) or JSON format:

```bash
# DOT graph (pipe to graphviz)
stave graph coverage --invariants ./inv --observations ./obs | dot -Tpng > coverage.png

# JSON output
stave graph coverage --invariants ./inv --observations ./obs --format json | jq .
```

## Downstream Artifacts

Stave can generate enforcement artifacts from evaluation results:

| Command | Output |
|---------|--------|
| `stave enforce --in eval.json --out ./dir --mode pab` | `dir/enforcement/aws/pab.tf` |
| `stave enforce --in eval.json --out ./dir --mode scp` | `dir/enforcement/aws/scp.json` |

## Logging

Logs go to stderr and are separate from command output:

```bash
# Verbose logging
stave apply --invariants ./inv --observations ./obs -v

# Debug logging
stave apply --invariants ./inv --observations ./obs -vv

# JSON logs to file
stave apply --invariants ./inv --observations ./obs --log-format json --log-file run.log

# Include timestamps (breaks determinism)
stave apply --invariants ./inv --observations ./obs --log-timestamps
```
