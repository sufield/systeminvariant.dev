# stave

```
Stave is a deterministic, traceable risk reasoning engine for cloud infrastructure.
It evaluates configuration snapshots against safety controls, detects compound
risk through co-failing control chains, and scores findings against asset
sensitivity and exposure context. No cloud credentials required.
Output is deterministic when --eval-time is set (required for reproducible CI/CD runs).

Getting Started:
  Run a demo against a bundled snapshot (no AWS credentials needed):
    bash examples/demo-s3-public-read/run.sh   - Public S3 bucket
    bash examples/demo-ai-security/run.sh      - Bedrock + Lambda + S3 PHI

  Or start a project layout with built-in S3 controls:
    stave generate                             - Scaffold starter artifacts
    stave validate                             - Check inputs are well-formed
    stave apply                                - Evaluate and produce findings

Operational Workflow:
  1. validate   - Check inputs are well-formed (run first)
  2. apply      - Run control evaluation and produce findings
                  Use --dry-run to verify readiness first
  3. diagnose   - Understand unexpected results

Input Formats:
  --controls      Directory with YAML control definitions (ctrl.v1)
  --observations  Directory with JSON observation snapshots (obs.v0.1)

Output Formats:
  --format json   Machine-readable JSON on commands that support format selection
  --format text   Human-readable summary on commands that support format selection

Logging:
  -v              Increase verbosity (INFO level)
  -vv             Debug verbosity (DEBUG level)
  --log-level     Explicit level: debug|info|warn|error
  --log-format    Format: text|json (default: text)
  --log-file      Write logs to file instead of stderr
  --log-timestamps  Include timestamps (breaks determinism)
  --log-timings   Include timing information (breaks determinism)

Sharing:
  --sanitize     Sanitize infrastructure identifiers from output
  --path-mode    Path rendering: base (default, basenames only) or full (absolute paths)

Exit Codes:
  0   Success, no issues
  1   Security-audit gating failure
  2   Invalid input or validation failure
  3   Violations found (apply) or diagnostics found (diagnose)
  4   Unexpected internal error
  130 Interrupted (SIGINT/Ctrl+C)

Examples:
  # Step 1: Validate inputs
  stave validate --controls ./controls --observations ./obs

  # Step 2: Dry-run readiness checks
  stave apply --dry-run --controls ./controls --observations ./obs

  # Step 3: Apply with 7-day threshold
  stave apply --controls ./controls --observations ./obs --max-unsafe 7d

  # Step 4: Diagnose unexpected results
  stave diagnose --controls ./controls --observations ./obs

  # Verbose mode (INFO level logs to stderr)
  stave apply --controls ./controls --observations ./obs -v

  # Debug mode
  stave apply --controls ./controls --observations ./obs -vv

  # JSON logs to file
  stave apply --controls ./controls --observations ./obs --log-format json --log-file run.log

  # Sanitize identifiers for safe sharing
  stave apply --controls ./controls --observations ./obs --sanitize

Documentation: See docs/user-docs.md for detailed usage.

Usage:
  stave [command]

Getting Started

Control Engine
  apply            Run control evaluation after plan checks pass
  diagnose         Diagnose evaluation inputs and results
  expand           Show every control sharing a structural defect archetype
  explain          Explain how a control evaluates and which fields it needs
  validate         Validate inputs without evaluation

Workflow & CI
  ci               CI/CD policy and baseline commands
  snapshot         Snapshot inspection commands
  status           Show project context and the next recommended command

Data & Artifacts
  enforce          Generate deterministic enforcement templates from evaluation output
  report           Generate executive security posture report

Introspection
  features         Show what Stave does and deliberately does not do
  inspect          Low-level security analysis primitives

Settings
  completion       Generate shell completion scripts
  config           Configuration commands
  help             Help about any command

Additional Commands:
  alias            Manage command aliases
  attest           Snapshot tamper detection via Ed25519 signatures
  bisect           Find when a control was first violated
  bundle           Generate a sealed evidence bundle for air-gap GRC integration
  capabilities     Print supported input types and version constraints (default) or a user-facing catalog (subcommand)
  cel              CEL expression tools
  check            Compare before/after evaluations to check remediation
  compare          Compare compliance posture between two frameworks
  compliance       Evaluate a snapshot against a compliance framework and report coverage
  contract         Inspect Stave's per-asset-type input contracts
  controls         Work with control definitions
  coverage         Analyze observation field coverage against control predicates
  diff             Compare two observation snapshots or control catalogs
  discover         Resolve AWS services to the data Stave needs (the collection manifest)
  doctor           Check local environment readiness for Stave workflows
  exempt           Manage risk acceptances (acknowledgments, exceptions, exemptions)
  export           Export controls and compliance evidence
  export-controls  Export the control catalog for external solver consumption
  export-sir       Export the Stave Intermediate Representation as JSON
  fingerprint      Policy fingerprint diagnostics
  fmt              Format control and observation files deterministically
  gaps             Report which observation properties are absent + what they unlock
  graph            Visualize control and asset relationships
  lint             Lint control files for design quality
  map              ATT&CK tactic coverage and gap analysis
  metrics          Write Prometheus scrape file for node_exporter
  pack             Concern packs — named control groupings and their data requirements
  packs            Inspect built-in control packs
  path             Export attack path graph data from active chain findings
  permissions      Query net effective permissions from a snapshot
  plan             Preview which controls will evaluate, by service and severity
  profile          Manage compliance profiles
  readiness        Report what Stave can/can't evaluate given the supplied observations
  sanitize         Sanitize a snapshot for cross-boundary sharing
  schemas          List all contract schemas
  score            Compute security posture score (0-100)
  scorecard        Multi-framework compliance scorecard
  search           Find catalog entries matching a free-form intent
  telemetry        Emit structured NDJSON telemetry from assessment output
  test             Run embedded control test cases
  transform        Convert raw AWS CLI snapshots into obs.v0.1 observations (built-in jq)
  trend            Analyze compliance posture trends across assessment runs
  validate-mapping Validate a Steampipe→Stave mapping file before use
  version          Print version and environment state

Flags:
      --allow-symlink-output   Allow writing output through symlinks (default: refuse)
      --force                  Allow overwriting existing output files
  -h, --help                   help for stave
      --log-file string        Write logs to file (default: stderr)
      --log-format string      Log format: text|json (default "text")
      --log-level string       Log level: debug|info|warn|error (overrides -v)
      --log-timestamps         Include timestamps in logs (breaks determinism)
      --log-timings            Include timing information (breaks determinism)
      --no-color               Disable ANSI colors in output
      --path-mode string       Path rendering in errors/logs: base (basename only) or full (absolute paths) Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in.
      --quiet                  Suppress output (exit code only) Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in.
      --require-offline        Assert offline operation: fail if proxy env vars (HTTP_PROXY, HTTPS_PROXY, ALL_PROXY) are set
      --sanitize               Sanitize infrastructure identifiers (bucket names, ARNs, policies) from output Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in.
      --show-dev               In --help, list only development-only commands (default: hide them from the listing)
      --strict                 Enable strict integrity checks for embedded registries and references
  -v, --verbose count          Increase verbosity (-v=INFO, -vv=DEBUG)
      --version                version for stave
  -y, --yes                    Auto-confirm all interactive prompts (distinct from --force which controls file overwriting)

Use "stave [command] --help" for more information about a command.
```
