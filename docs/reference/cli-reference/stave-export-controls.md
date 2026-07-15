# stave export-controls

Export the control catalog for external solver consumption

## Usage[​](#usage "Direct link to Usage")

```
stave export-controls [flags]
```

## Description[​](#description "Direct link to Description")

Export the control catalog as a JSON document — each entry carries the control's predicate tree, authored intent rationale, and the optional forbidden\_state block (the high-level "this configuration must never exist" claim external SMT compilers consume to generate Z3 satisfiability queries).

The export is metadata-only: no observation reads, no findings, no clock. External solvers receive a pure description of "the controls Stave evaluates" without inheriting any of Stave's evaluation semantics. The JSON shape itself is the stable solver-import format, so the top-level array is keyed `invariants` — that name is the solver-side data contract, not Stave's user-facing vocabulary.

Inputs: --controls, -i Control definitions directory (default: built-in catalog) --format, -f Output format: json (default: json)

Outputs: stdout: control export as a JSON document (sorted by control ID). stderr: errors.

Exit codes: 0 success 2 input error (bad flag) 4 internal error (load failure, projection error) 130 SIGINT

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                              |
| ---------------- | ------ | -------------------------------------------------------- |
| `-i, --controls` | string | control definitions directory (empty = built-in catalog) |
| `-f, --format`   | string | output format: json (default: `json`)                    |

## Examples[​](#examples "Direct link to Examples")

```
# Built-in catalog → JSON to stdout
  stave export-controls > controls.json

  # Filter to controls that author a forbidden_state block
  stave export-controls | jq '[.invariants[] | select(.forbidden_state.combine != "")]'

  # Custom controls directory
  stave export-controls --controls ./my-controls > controls.json
```
