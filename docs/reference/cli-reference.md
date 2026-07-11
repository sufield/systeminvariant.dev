# CLI Reference

Complete reference for all Stave commands. Run `stave <command> --help` for full usage, flags, and exit codes.

*161 commands.*

| Command                                                                                                       | Description                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`stave alias`](/docs/reference/cli-reference/stave-alias.md)                                                 | Manage command aliases                                                                              |
| [`stave alias delete`](/docs/reference/cli-reference/stave-alias-delete.md)                                   | Delete an alias                                                                                     |
| [`stave alias list`](/docs/reference/cli-reference/stave-alias-list.md)                                       | List all aliases                                                                                    |
| [`stave alias set`](/docs/reference/cli-reference/stave-alias-set.md)                                         | Create or update an alias                                                                           |
| [`stave apply`](/docs/reference/cli-reference/stave-apply.md)                                                 | Run control evaluation after plan checks pass                                                       |
| [`stave attest`](/docs/reference/cli-reference/stave-attest.md)                                               | Snapshot tamper detection via Ed25519 signatures                                                    |
| [`stave attest keygen`](/docs/reference/cli-reference/stave-attest-keygen.md)                                 | Generate a new Ed25519 key pair for snapshot attestation                                            |
| [`stave attest sign`](/docs/reference/cli-reference/stave-attest-sign.md)                                     | Sign a snapshot's assets with an Ed25519 private key                                                |
| [`stave attest verify`](/docs/reference/cli-reference/stave-attest-verify.md)                                 | Verify an attested snapshot against a public key                                                    |
| [`stave bisect`](/docs/reference/cli-reference/stave-bisect.md)                                               | Find when a control was first violated                                                              |
| [`stave bundle`](/docs/reference/cli-reference/stave-bundle.md)                                               | Generate a sealed evidence bundle for air-gap GRC integration                                       |
| [`stave bundle audit`](/docs/reference/cli-reference/stave-bundle-audit.md)                                   | Assemble a compliance-period evidence package                                                       |
| [`stave capabilities`](/docs/reference/cli-reference/stave-capabilities.md)                                   | Print supported input types and version constraints (default) or a user-facing catalog (subcommand) |
| [`stave capabilities catalog`](/docs/reference/cli-reference/stave-capabilities-catalog.md)                   | Print the user-facing capability catalog                                                            |
| [`stave capabilities catalog coverage`](/docs/reference/cli-reference/stave-capabilities-catalog-coverage.md) | Show per-service control coverage                                                                   |
| [`stave capabilities catalog gaps`](/docs/reference/cli-reference/stave-capabilities-catalog-gaps.md)         | Compare catalog against an external checklist                                                       |
| [`stave capabilities catalog inspect`](/docs/reference/cli-reference/stave-capabilities-catalog-inspect.md)   | Show full metadata for a single control                                                             |
| [`stave capabilities catalog matrix`](/docs/reference/cli-reference/stave-capabilities-catalog-matrix.md)     | Show taxonomy × service cross-product with gap cells                                                |
| [`stave capabilities catalog stats`](/docs/reference/cli-reference/stave-capabilities-catalog-stats.md)       | Print aggregate catalog statistics                                                                  |
| [`stave capabilities catalog taxonomy`](/docs/reference/cli-reference/stave-capabilities-catalog-taxonomy.md) | List taxonomy categories with control counts                                                        |
| [`stave catalog`](/docs/reference/cli-reference/stave-catalog.md)                                             | Print the user-facing capability catalog                                                            |
| [`stave catalog coverage`](/docs/reference/cli-reference/stave-catalog-coverage.md)                           | Show per-service control coverage                                                                   |
| [`stave catalog gaps`](/docs/reference/cli-reference/stave-catalog-gaps.md)                                   | Compare catalog against an external checklist                                                       |
| [`stave catalog inspect`](/docs/reference/cli-reference/stave-catalog-inspect.md)                             | Show full metadata for a single control                                                             |
| [`stave catalog matrix`](/docs/reference/cli-reference/stave-catalog-matrix.md)                               | Show taxonomy × service cross-product with gap cells                                                |
| [`stave catalog stats`](/docs/reference/cli-reference/stave-catalog-stats.md)                                 | Print aggregate catalog statistics                                                                  |
| [`stave catalog taxonomy`](/docs/reference/cli-reference/stave-catalog-taxonomy.md)                           | List taxonomy categories with control counts                                                        |
| [`stave cel`](/docs/reference/cli-reference/stave-cel.md)                                                     | CEL expression tools                                                                                |
| [`stave cel eval`](/docs/reference/cli-reference/stave-cel-eval.md)                                           | Evaluate a CEL expression against observation assets                                                |
| [`stave check`](/docs/reference/cli-reference/stave-check.md)                                                 | Compare before/after evaluations to check remediation                                               |
| [`stave ci`](/docs/reference/cli-reference/stave-ci.md)                                                       | CI/CD policy and baseline commands                                                                  |
| [`stave ci baseline`](/docs/reference/cli-reference/stave-ci-baseline.md)                                     | Manage baseline findings for fail-on-new CI workflows                                               |
| [`stave ci baseline check`](/docs/reference/cli-reference/stave-ci-baseline-check.md)                         | Compare evaluation findings against baseline and detect new findings                                |
| [`stave ci baseline save`](/docs/reference/cli-reference/stave-ci-baseline-save.md)                           | Save evaluation findings as baseline                                                                |
| [`stave ci diff`](/docs/reference/cli-reference/stave-ci-diff.md)                                             | Compare two evaluations and report new findings                                                     |
| [`stave ci fix`](/docs/reference/cli-reference/stave-ci-fix.md)                                               | Show machine-readable fix plan for a finding                                                        |
| [`stave ci fix-loop`](/docs/reference/cli-reference/stave-ci-fix-loop.md)                                     | Run apply-before/apply-after/verify in one command                                                  |
| [`stave ci gate`](/docs/reference/cli-reference/stave-ci-gate.md)                                             | Enforce CI failure policy modes from config or flags                                                |
| [`stave compare`](/docs/reference/cli-reference/stave-compare.md)                                             | Compare compliance posture between two frameworks                                                   |
| [`stave completion`](/docs/reference/cli-reference/stave-completion.md)                                       | Generate shell completion scripts                                                                   |
| [`stave compliance`](/docs/reference/cli-reference/stave-compliance.md)                                       | Evaluate a snapshot against a compliance framework and report coverage                              |
| [`stave config`](/docs/reference/cli-reference/stave-config.md)                                               | Configuration commands                                                                              |
| [`stave config context`](/docs/reference/cli-reference/stave-config-context.md)                               | Named project context commands                                                                      |
| [`stave config context create`](/docs/reference/cli-reference/stave-config-context-create.md)                 | Create or update a named context                                                                    |
| [`stave config context delete`](/docs/reference/cli-reference/stave-config-context-delete.md)                 | Delete a context                                                                                    |
| [`stave config context list`](/docs/reference/cli-reference/stave-config-context-list.md)                     | List available contexts                                                                             |
| [`stave config context show`](/docs/reference/cli-reference/stave-config-context-show.md)                     | Show selected context                                                                               |
| [`stave config context use`](/docs/reference/cli-reference/stave-config-context-use.md)                       | Set active context                                                                                  |
| [`stave config delete`](/docs/reference/cli-reference/stave-config-delete.md)                                 | Remove a project config key (reverts to default)                                                    |
| [`stave config env`](/docs/reference/cli-reference/stave-config-env.md)                                       | Manage environment variables                                                                        |
| [`stave config env list`](/docs/reference/cli-reference/stave-config-env-list.md)                             | List supported STAVE\_\* environment variables                                                      |
| [`stave config explain`](/docs/reference/cli-reference/stave-config-explain.md)                               | Explain resolved config values and sources                                                          |
| [`stave config get`](/docs/reference/cli-reference/stave-config-get.md)                                       | Get a config value                                                                                  |
| [`stave config set`](/docs/reference/cli-reference/stave-config-set.md)                                       | Set a project config value in stave.yaml                                                            |
| [`stave config show`](/docs/reference/cli-reference/stave-config-show.md)                                     | Show effective project configuration and value sources                                              |
| [`stave contract`](/docs/reference/cli-reference/stave-contract.md)                                           | Inspect Stave's per-asset-type input contracts                                                      |
| [`stave contract show`](/docs/reference/cli-reference/stave-contract-show.md)                                 | Show the agent-facing contract for an asset type                                                    |
| [`stave controls`](/docs/reference/cli-reference/stave-controls.md)                                           | Work with control definitions                                                                       |
| [`stave controls alias-explain`](/docs/reference/cli-reference/stave-controls-alias-explain.md)               | Show expanded predicate for an alias                                                                |
| [`stave controls aliases`](/docs/reference/cli-reference/stave-controls-aliases.md)                           | List built-in semantic predicate aliases                                                            |
| [`stave controls explain`](/docs/reference/cli-reference/stave-controls-explain.md)                           | Explain a specific control                                                                          |
| [`stave controls list`](/docs/reference/cli-reference/stave-controls-list.md)                                 | List control IDs and names                                                                          |
| [`stave controls quality`](/docs/reference/cli-reference/stave-controls-quality.md)                           | Analyze control catalog metadata completeness and coverage gaps                                     |
| [`stave controls search`](/docs/reference/cli-reference/stave-controls-search.md)                             | Search the built-in control catalog                                                                 |
| [`stave coverage`](/docs/reference/cli-reference/stave-coverage.md)                                           | Analyze observation field coverage against control predicates                                       |
| [`stave diagnose`](/docs/reference/cli-reference/stave-diagnose.md)                                           | Diagnose evaluation inputs and results                                                              |
| [`stave diagnose explain`](/docs/reference/cli-reference/stave-diagnose-explain.md)                           | Generate guided remediation playbook for a finding                                                  |
| [`stave diagnose finding`](/docs/reference/cli-reference/stave-diagnose-finding.md)                           | Deep-dive analysis of a single finding                                                              |
| [`stave diagnose report`](/docs/reference/cli-reference/stave-diagnose-report.md)                             | Generate a plain-text report from evaluation output                                                 |
| [`stave diagnose trace`](/docs/reference/cli-reference/stave-diagnose-trace.md)                               | Trace predicate evaluation for a single control against a single asset                              |
| [`stave diff`](/docs/reference/cli-reference/stave-diff.md)                                                   | Compare two observation snapshots or control catalogs                                               |
| [`stave discover`](/docs/reference/cli-reference/stave-discover.md)                                           | Resolve AWS services to the data Stave needs (the collection manifest)                              |
| [`stave doctor`](/docs/reference/cli-reference/stave-doctor.md)                                               | Check local environment readiness for Stave workflows                                               |
| [`stave enforce`](/docs/reference/cli-reference/stave-enforce.md)                                             | Generate deterministic enforcement templates from evaluation output                                 |
| [`stave exempt`](/docs/reference/cli-reference/stave-exempt.md)                                               | Manage risk acceptances (acknowledgments, exceptions, exemptions)                                   |
| [`stave exempt acknowledge`](/docs/reference/cli-reference/stave-exempt-acknowledge.md)                       | Add a formal risk acceptance                                                                        |
| [`stave exempt asset`](/docs/reference/cli-reference/stave-exempt-asset.md)                                   | Add a scope exclusion (exemption)                                                                   |
| [`stave exempt except`](/docs/reference/cli-reference/stave-exempt-except.md)                                 | Add an operational suppression                                                                      |
| [`stave exempt export`](/docs/reference/cli-reference/stave-exempt-export.md)                                 | Export risk register as OSCAL POA\&M                                                                |
| [`stave exempt history`](/docs/reference/cli-reference/stave-exempt-history.md)                               | Show full audit trail including expired entries                                                     |
| [`stave exempt list`](/docs/reference/cli-reference/stave-exempt-list.md)                                     | List all active risk acceptances                                                                    |
| [`stave exempt remove`](/docs/reference/cli-reference/stave-exempt-remove.md)                                 | Mark an acknowledgment as revoked                                                                   |
| [`stave exempt suggest`](/docs/reference/cli-reference/stave-exempt-suggest.md)                               | Suggest exemptions for chronic/oscillating findings                                                 |
| [`stave exempt upcoming`](/docs/reference/cli-reference/stave-exempt-upcoming.md)                             | Show acceptances approaching expiry                                                                 |
| [`stave exempt validate`](/docs/reference/cli-reference/stave-exempt-validate.md)                             | Validate the acceptance file                                                                        |
| [`stave expand`](/docs/reference/cli-reference/stave-expand.md)                                               | Show every control sharing a structural defect archetype                                            |
| [`stave explain`](/docs/reference/cli-reference/stave-explain.md)                                             | Explain how a control evaluates and which fields it needs                                           |
| [`stave export`](/docs/reference/cli-reference/stave-export.md)                                               | Export controls and compliance evidence                                                             |
| [`stave export changes`](/docs/reference/cli-reference/stave-export-changes.md)                               | Export remediation property changes from assessment findings                                        |
| [`stave export compliance`](/docs/reference/cli-reference/stave-export-compliance.md)                         | Export compliance evidence package                                                                  |
| [`stave export ocsf`](/docs/reference/cli-reference/stave-export-ocsf.md)                                     | Export findings as OCSF 1.1 Compliance Finding events                                               |
| [`stave export oscal`](/docs/reference/cli-reference/stave-export-oscal.md)                                   | Export findings as OSCAL 1.1.2 Assessment Results JSON                                              |
| [`stave export tickets`](/docs/reference/cli-reference/stave-export-tickets.md)                               | Export findings as canonical ticket records                                                         |
| [`stave export-controls`](/docs/reference/cli-reference/stave-export-controls.md)                             | Export the control catalog for external solver consumption                                          |
| [`stave export-sir`](/docs/reference/cli-reference/stave-export-sir.md)                                       | Export the Stave Intermediate Representation as JSON                                                |
| [`stave features`](/docs/reference/cli-reference/stave-features.md)                                           | Show what Stave does and deliberately does not do                                                   |
| [`stave fingerprint`](/docs/reference/cli-reference/stave-fingerprint.md)                                     | Policy fingerprint diagnostics                                                                      |
| [`stave fingerprint explain`](/docs/reference/cli-reference/stave-fingerprint-explain.md)                     | Show the policy fingerprint preimage and diagnosis                                                  |
| [`stave fmt`](/docs/reference/cli-reference/stave-fmt.md)                                                     | Format control and observation files deterministically                                              |
| [`stave forge`](/docs/reference/cli-reference/stave-forge.md)                                                 | Author and test custom controls                                                                     |
| [`stave forge chain`](/docs/reference/cli-reference/stave-forge-chain.md)                                     | Author and validate custom chains                                                                   |
| [`stave forge chain lint`](/docs/reference/cli-reference/stave-forge-chain-lint.md)                           | Validate chain YAML                                                                                 |
| [`stave forge lint`](/docs/reference/cli-reference/stave-forge-lint.md)                                       | Static analysis for control YAML files                                                              |
| [`stave forge new`](/docs/reference/cli-reference/stave-forge-new.md)                                         | Interactive control authoring wizard                                                                |
| [`stave forge paths`](/docs/reference/cli-reference/stave-forge-paths.md)                                     | List available observation property paths from a snapshot                                           |
| [`stave forge preview`](/docs/reference/cli-reference/stave-forge-preview.md)                                 | Evaluate a predicate against a snapshot without writing files                                       |
| [`stave forge scaffold`](/docs/reference/cli-reference/stave-forge-scaffold.md)                               | Generate test fixtures from a real snapshot                                                         |
| [`stave forge test`](/docs/reference/cli-reference/stave-forge-test.md)                                       | Run fixture-based assertions against a control                                                      |
| [`stave gaps`](/docs/reference/cli-reference/stave-gaps.md)                                                   | Report which observation properties are absent + what they unlock                                   |
| [`stave generate`](/docs/reference/cli-reference/stave-generate.md)                                           | Generate starter artifacts                                                                          |
| [`stave generate observation`](/docs/reference/cli-reference/stave-generate-observation.md)                   | Generate an observation template                                                                    |
| [`stave graph`](/docs/reference/cli-reference/stave-graph.md)                                                 | Visualize control and asset relationships                                                           |
| [`stave graph coverage`](/docs/reference/cli-reference/stave-graph-coverage.md)                               | Show which controls cover which assets                                                              |
| [`stave graph export`](/docs/reference/cli-reference/stave-graph-export.md)                                   | Export assessment as JSON, STIX 2.1, JSON-LD, or GraphML                                            |
| [`stave inspect`](/docs/reference/cli-reference/stave-inspect.md)                                             | Low-level security analysis primitives                                                              |
| [`stave inspect acl`](/docs/reference/cli-reference/stave-inspect-acl.md)                                     | Analyze S3 ACL grants                                                                               |
| [`stave inspect aliases`](/docs/reference/cli-reference/stave-inspect-aliases.md)                             | List predicate aliases with metadata                                                                |
| [`stave inspect compliance`](/docs/reference/cli-reference/stave-inspect-compliance.md)                       | Resolve compliance framework crosswalk                                                              |
| [`stave inspect exposure`](/docs/reference/cli-reference/stave-inspect-exposure.md)                           | Classify resource exposure vectors                                                                  |
| [`stave inspect policy`](/docs/reference/cli-reference/stave-inspect-policy.md)                               | Analyze an S3 bucket policy document                                                                |
| [`stave inspect risk`](/docs/reference/cli-reference/stave-inspect-risk.md)                                   | Score risk from policy statement context                                                            |
| [`stave lint`](/docs/reference/cli-reference/stave-lint.md)                                                   | Lint control files for design quality                                                               |
| [`stave map`](/docs/reference/cli-reference/stave-map.md)                                                     | ATT\&CK tactic coverage and gap analysis                                                            |
| [`stave metrics`](/docs/reference/cli-reference/stave-metrics.md)                                             | Write Prometheus scrape file for node\_exporter                                                     |
| [`stave pack`](/docs/reference/cli-reference/stave-pack.md)                                                   | Concern packs — named control groupings and their data requirements                                 |
| [`stave pack list`](/docs/reference/cli-reference/stave-pack-list.md)                                         | List available concern packs and their control counts                                               |
| [`stave pack show`](/docs/reference/cli-reference/stave-pack-show.md)                                         | Show a pack's requirements manifest (AWS calls, signals, collector permissions)                     |
| [`stave packs`](/docs/reference/cli-reference/stave-packs.md)                                                 | Inspect built-in control packs                                                                      |
| [`stave packs list`](/docs/reference/cli-reference/stave-packs-list.md)                                       | List available built-in packs                                                                       |
| [`stave packs show`](/docs/reference/cli-reference/stave-packs-show.md)                                       | Show one built-in pack and its control IDs                                                          |
| [`stave path`](/docs/reference/cli-reference/stave-path.md)                                                   | Export attack path graph data from active chain findings                                            |
| [`stave permissions`](/docs/reference/cli-reference/stave-permissions.md)                                     | Query net effective permissions from a snapshot                                                     |
| [`stave permissions principal`](/docs/reference/cli-reference/stave-permissions-principal.md)                 | Resolve permissions for a specific principal ARN                                                    |
| [`stave permissions resource`](/docs/reference/cli-reference/stave-permissions-resource.md)                   | Show who has effective access to a resource                                                         |
| [`stave permissions summary`](/docs/reference/cli-reference/stave-permissions-summary.md)                     | Aggregate NEP metrics across all principals                                                         |
| [`stave plan`](/docs/reference/cli-reference/stave-plan.md)                                                   | Preview which controls will evaluate, by service and severity                                       |
| [`stave profile`](/docs/reference/cli-reference/stave-profile.md)                                             | Manage compliance profiles                                                                          |
| [`stave profile create`](/docs/reference/cli-reference/stave-profile-create.md)                               | Generate a starter profile YAML                                                                     |
| [`stave profile list`](/docs/reference/cli-reference/stave-profile-list.md)                                   | List available compliance profiles                                                                  |
| [`stave profile validate`](/docs/reference/cli-reference/stave-profile-validate.md)                           | Validate a profile file                                                                             |
| [`stave prove`](/docs/reference/cli-reference/stave-prove.md)                                                 | Run Z3 SMT queries against a Stave assessment                                                       |
| [`stave readiness`](/docs/reference/cli-reference/stave-readiness.md)                                         | Report what Stave can/can't evaluate given the supplied observations                                |
| [`stave report`](/docs/reference/cli-reference/stave-report.md)                                               | Generate executive security posture report                                                          |
| [`stave sanitize`](/docs/reference/cli-reference/stave-sanitize.md)                                           | Sanitize a snapshot for cross-boundary sharing                                                      |
| [`stave schemas`](/docs/reference/cli-reference/stave-schemas.md)                                             | List all contract schemas                                                                           |
| [`stave score`](/docs/reference/cli-reference/stave-score.md)                                                 | Compute security posture score (0-100)                                                              |
| [`stave scorecard`](/docs/reference/cli-reference/stave-scorecard.md)                                         | Multi-framework compliance scorecard                                                                |
| [`stave search`](/docs/reference/cli-reference/stave-search.md)                                               | Find catalog entries matching a free-form intent                                                    |
| [`stave snapshot`](/docs/reference/cli-reference/stave-snapshot.md)                                           | Snapshot inspection commands                                                                        |
| [`stave snapshot diff`](/docs/reference/cli-reference/stave-snapshot-diff.md)                                 | Compare the latest two observation snapshots                                                        |
| [`stave status`](/docs/reference/cli-reference/stave-status.md)                                               | Show project context and the next recommended command                                               |
| [`stave telemetry`](/docs/reference/cli-reference/stave-telemetry.md)                                         | Emit structured NDJSON telemetry from assessment output                                             |
| [`stave test`](/docs/reference/cli-reference/stave-test.md)                                                   | Run embedded control test cases                                                                     |
| [`stave transform`](/docs/reference/cli-reference/stave-transform.md)                                         | Convert raw AWS CLI snapshots into obs.v0.1 observations (built-in jq)                              |
| [`stave trend`](/docs/reference/cli-reference/stave-trend.md)                                                 | Analyze compliance posture trends across assessment runs                                            |
| [`stave trend forecast`](/docs/reference/cli-reference/stave-trend-forecast.md)                               | Project posture score trajectory with SLA breach warnings                                           |
| [`stave trend oscillation`](/docs/reference/cli-reference/stave-trend-oscillation.md)                         | Classify violation oscillation patterns across assessment history                                   |
| [`stave trend predict`](/docs/reference/cli-reference/stave-trend-predict.md)                                 | Project compliance readiness achievement date                                                       |
| [`stave validate`](/docs/reference/cli-reference/stave-validate.md)                                           | Validate inputs without evaluation                                                                  |
| [`stave validate-mapping`](/docs/reference/cli-reference/stave-validate-mapping.md)                           | Validate a Steampipe→Stave mapping file before use                                                  |
| [`stave version`](/docs/reference/cli-reference/stave-version.md)                                             | Print version and environment state                                                                 |

## Exit Codes[​](#exit-codes "Direct link to Exit Codes")

| Code | Meaning                                                  |
| ---- | -------------------------------------------------------- |
| 0    | Success                                                  |
| 1    | Security-audit gating failure                            |
| 2    | Invalid input or validation failure                      |
| 3    | Violations found (apply) or diagnostics found (diagnose) |
| 4    | Internal error                                           |
| 130  | Interrupted (SIGINT)                                     |
