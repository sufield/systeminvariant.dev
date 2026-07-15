# stave expand

Show every control sharing a structural defect archetype

## Usage[​](#usage "Direct link to Usage")

```
stave expand [flags]
```

## Description[​](#description "Direct link to Description")

Expand a finding or archetype into the family of controls that detect the same class of structural defect across services.

When a single finding fires, its archetype identifies every other place the same defect can manifest in your infrastructure. Use --finding to pivot from a specific control, --archetype to start from a known class, or --list to see all archetypes.

Inputs: --archetype Archetype ID (e.g., ghost-reference) --finding Control ID to look up the archetype from --list List all archetypes with control counts --format text|json Output format (default: text) --snapshots

* Path to observations dir (optional; enables snapshot coverage section) --controls
  * Control definitions directory (default: controls)
    Outputs: stdout: archetype summary, controls grouped by service, optional snapshot coverage and recommended commands. stderr: errors only.

    Exit codes: 0 success 2 input error (missing flags, unknown archetype/finding) 4 internal error (control loader failure) 130 SIGINT
    ## Flags[​](#flags "Direct link to Flags")
    | Flag             | Type   | Description                                                   |
    | ---------------- | ------ | ------------------------------------------------------------- |
    | `--archetype`    | string | archetype ID to expand (e.g., ghost-reference)                |
    | `-i, --controls` | string | control definitions directory (default: `controls`)           |
    | `--finding`      | string | control ID to expand from (e.g., CTL.ROUTE53.DANGLING.S3.001) |
    | `-f, --format`   | string | output format: text or json (default: `text`)                 |
    | `--list`         | bool   | list all archetypes with control counts                       |
    | `--no-pager`     | bool   | never page output, even on a terminal                         |
    | `--snapshots`    | string | observations directory for snapshot coverage check            |
    ## Examples[​](#examples "Direct link to Examples")
    ```
    # List all archetypes with control counts
      stave expand --list

      # Expand an archetype into its control family
      stave expand --archetype ghost-reference

      # Pivot from a known finding to its sibling controls
      stave expand --finding CTL.ROUTE53.DANGLING.S3.001

      # JSON output for tooling
      stave expand --archetype ghost-reference --format json
    ```
