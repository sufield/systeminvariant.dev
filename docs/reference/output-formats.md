# Output Formats

Stave supports multiple output formats for different use cases.

## JSON (Default for `apply`)[​](#json-default-for-apply "Direct link to json-default-for-apply")

```
stave apply --controls ./ctl --observations ./obs --format json
```

Structured output following the `out.v0.1` schema. Machine-readable, suitable for piping to `jq` or ingestion by other tools. Results go to stdout; errors and logs go to stderr.

```
# Count violations
stave apply --controls ./ctl --observations ./obs | jq '.summary.violations'

# List violated resource IDs
stave apply --controls ./ctl --observations ./obs | jq -r '.findings[].resource_id'

# Get unique violated control IDs
stave apply --controls ./ctl --observations ./obs | jq -r '.findings[].control_id' | sort -u
```

## Text[​](#text "Direct link to Text")

```
stave apply --controls ./ctl --observations ./obs --format text
```

Human-readable output for terminal use. Includes color when the terminal supports it (respects `NO_COLOR` environment variable).

## Quiet Mode[​](#quiet-mode "Direct link to Quiet Mode")

```
stave apply --controls ./ctl --observations ./obs --quiet
```

Suppresses all output. Use the exit code to determine the result:

* `0` = no violations
* `3` = violations found

## Writing Output to a Directory[​](#writing-output-to-a-directory "Direct link to Writing Output to a Directory")

```
stave apply --controls ./ctl --observations ./obs --out ./results
```

Writes `evaluation.json` to the specified directory (created if it doesn't exist). Output is still printed to stdout as well.

## Validation Output[​](#validation-output "Direct link to Validation Output")

The `validate` command defaults to text output but supports JSON:

```
stave validate --controls ./ctl --observations ./obs --format json
```

```
{
  "schema_version": "validate.v0.1",
  "valid": true,
  "errors": [],
  "warnings": [],
  "summary": {
    "controls_checked": 10,
    "snapshots_checked": 2,
    "resource_observations_checked": 15,
    "identity_observations_checked": 0,
    "context_provided": false
  }
}
```

## Coverage Graph Output[​](#coverage-graph-output "Direct link to Coverage Graph Output")

The `graph coverage` command outputs in DOT (default) or JSON format:

```
# DOT graph (pipe to graphviz)
stave graph coverage --controls ./ctl --observations ./obs | dot -Tpng > coverage.png

# JSON output
stave graph coverage --controls ./ctl --observations ./obs --format json | jq .
```

## Downstream Artifacts[​](#downstream-artifacts "Direct link to Downstream Artifacts")

Stave can generate enforcement artifacts from evaluation results:

| Command                                               | Output                         |
| ----------------------------------------------------- | ------------------------------ |
| `stave enforce --in eval.json --out ./dir --mode pab` | `dir/enforcement/aws/pab.tf`   |
| `stave enforce --in eval.json --out ./dir --mode scp` | `dir/enforcement/aws/scp.json` |

## Severity Mapping[​](#severity-mapping "Direct link to Severity Mapping")

| Stave severity | SARIF level | Code Scanning display |
| -------------- | ----------- | --------------------- |
| critical       | error       | Error (red)           |
| high           | error       | Error (red)           |
| medium         | warning     | Warning (yellow)      |
| low            | note        | Note (blue)           |
| info           | note        | Note (blue)           |

## Exit Codes[​](#exit-codes "Direct link to Exit Codes")

| Code | Meaning                                       |
| ---- | --------------------------------------------- |
| 0    | Success (no violations, or command completed) |
| 2    | Invalid input (bad flags, malformed files)    |
| 3    | Violations found (findings exceed threshold)  |
| 4    | Internal error                                |
| 130  | Interrupted (SIGINT)                          |

Exit 3 is a success — it means the tool found what it was looking for.

## Logging[​](#logging "Direct link to Logging")

Logs go to stderr and are separate from command output:

```
# Verbose logging
stave apply --controls ./ctl --observations ./obs -v

# Debug logging
stave apply --controls ./ctl --observations ./obs -vv

# JSON logs to file
stave apply --controls ./ctl --observations ./obs --log-format json --log-file run.log

# Include timestamps (breaks determinism)
stave apply --controls ./ctl --observations ./obs --log-timestamps
```
