# Stave Documentation Guide

Organized using the [Diataxis framework](https://diataxis.fr/) — four
quadrants that serve different user needs at different times.

## Structure

```
stave-guide/
  tutorials/       Learning-oriented: "Follow along to learn"
  how-to/          Task-oriented: "Steps to solve a specific problem"
  reference/       Information-oriented: "Dry description of the machinery"
  explanation/     Understanding-oriented: "Discusses concepts, why, trade-offs"
```

## Tutorials (Learning)

For someone new to Stave who wants to learn by doing.

| Document | Audience | Summary |
| ---------- | ---------- | --------- |
| [Introduction](tutorials/01-introduction.md) | User | What Stave is and why it exists |
| [Reasoning Contract](explanation/reasoning-contract.md) | User / Architect | Why the snapshot + YAML spec format lets any reasoning engine (Z3, Soufflé, Clingo, Prolog, PRISM) target the same exports — the substrate-vs-implementation framing |
| [Installation](tutorials/02-installation.md) | User | Install Stave from source |
| [Quick Start](tutorials/03-quick-start.md) | User | First evaluation walkthrough |
| [First Finding](tutorials/04-first-finding.md) | User | First finding against live AWS data |
| [Docker Demo](tutorials/05-docker-demo.md) | User | 44 curated S3 scenarios from the catalog of 2,891 controls in Docker |
| [Writing Controls](tutorials/06-writing-controls.md) | Developer | Write your first custom control |
| [Building Extractors](tutorials/07-building-extractors.md) | Developer | Build an extractor using AI prompts |
| [Logic Trace](tutorials/08-logic-trace.md) | User | Understand why Stave reached a verdict |
| [Policy Forge](tutorials/09-policy-forge.md) | Developer | Scaffold controls with test fixtures |
| [Multi-Engine Analysis](tutorials/10-reasoning-engines.md) | User | Run CEL + Z3 + Soufflé against one snapshot end-to-end |

## How-To Guides (Tasks)

For someone who knows Stave and needs to accomplish a specific goal.

| Document | Audience | Summary |
| ---------- | ---------- | --------- |
| [Pre-Commit Hook](how-to/integration/pre-commit-hook.md) | DevOps | Block unsafe configs before commit |
| [Atlantis Post-Plan](how-to/integration/atlantis-integration.md) | DevOps | Evaluate Terraform plans before apply |
| [CI/CD Integration](how-to/integration/ci-cd-integration.md) | DevOps | GitHub Actions, SARIF, baselines, gating, env vars |
| [Interpreting Findings](how-to/results/interpreting-findings.md) | User | Read and act on evaluation output |
| [HIPAA Compliance](how-to/compliance/hipaa-compliance.md) | Compliance | HIPAA profile, compound risks, exceptions |
| [Security Workflows](how-to/integration/security-workflows.md) | Security | Integrate with security toolchains |
| [Breach Routing](how-to/integration/breach-routing.md) | Security | Route findings by breach type |
| [Ignore Lists](how-to/results/ignore-lists.md) | User | Exempt assets from evaluation |
| [Recipes](how-to/getting-started/recipes.md) | User | Multi-command workflow patterns |
| [S3 Assessment](how-to/assessments/s3-assessment.md) | User | End-to-end S3 security assessment |
| [IAM Assessment](how-to/assessments/iam-assessment.md) | User | IAM security assessment (41 controls) |
| [OpenSearch Assessment](how-to/assessments/opensearch-assessment.md) | User | OpenSearch/Elasticsearch assessment (12 controls) |
| [Sanitization](how-to/results/sanitization.md) | User | Redact sensitive data from output |
| [Troubleshooting](how-to/maintenance/troubleshooting.md) | User | Fix common error messages |
| [Control Authoring](how-to/controls/control-authoring.md) | Developer | Author and test control YAML |
| [Contributing](how-to/maintenance/contributing.md) | Developer | Set up dev environment, contribute |
| [Bug Reports](how-to/maintenance/bug-reports.md) | Developer | Write reproducible bug reports |
| [Logic Trace Debugging](how-to/results/logic-trace-debugging.md) | User | Debug unexpected findings with trace |
| [Policy Forge](how-to/controls/policy-forge.md) | Developer | Scaffold controls with make gencontrol |
| [Multi-Cloud Evaluation](how-to/assessments/multi-cloud-evaluation.md) | User | Evaluate S3, IAM, GCS, DNS assets |
| [Enable Z3 Solver](how-to/controls/enable-z3-solver.md) | DevOps | Install libz3 per OS, verify, and pick the file-boundary vs cgo integration path |
| [Reasoning Engines](how-to/controls/reasoning-engines.md) | Security | Pick + run an external engine (Z3, Soufflé, Clingo, …) against Stave's exported facts |
| [Create Observation Snapshots](how-to/getting-started/create-snapshots.md) | User | Produce obs.v0.1 snapshots from AWS, Terraform, or by hand |
| [Verify a Release](how-to/getting-started/verify-release.md) | Security | Verify release artifacts: checksums, Cosign, SBOM, provenance |

## Reference

| Document | Audience | Summary |
| ---------- | ---------- | --------- |
| [Command Reference](reference/command-reference.md) | User | All CLI commands and flags |
| [CLI Reference](reference/cli-reference/) | User | Per-command reference pages |
| Control Catalog | Both | Auto-generated control inventory |
| [Glossary](reference/glossary.md) | Both | Terminology mapping |
| [Schema: Control](reference/schema-ctrl.md) | Developer | Control YAML schema |
| [Schema: Observation](reference/schema-obs.md) | Developer | Observation JSON schema |
| [Observation Export Schema](reference/observation-export-schema.md) | User | S3 observation property-group field spec |
| [Schema: Output](reference/schema-out.md) | Developer | Evaluation output schema |
| [Schema: Diagnose](reference/schema-diagnose.md) | Developer | Diagnostic output schema |
| [Contracts](reference/contracts.md) | Developer | Schema contract guarantees |
| [Observation Contract](reference/observation-contract.md) | Developer | Observation data contract |
| [Evaluation Semantics](reference/evaluation-semantics.md) | Developer | Formal evaluation rules |
| [Config File](reference/config-file.md) | User | Configuration file format |
| [Severity Thresholds](reference/severity-thresholds.md) | User | Severity levels and thresholds |
| [Output Formats](reference/output-formats.md) | User | JSON, text, SARIF output formats |
| [Fact Export](reference/fact-export.md) | Developer | `stave export-sir` — JSON / JSONL / SMT-LIB v2 schemas + 24-predicate vocabulary |
| [Scope & Limits](reference/scope-and-support.md) | Both | What Stave covers, out-of-scope areas, and known limitations |
| [Engine Capabilities](reference/evaluation-engine-capabilities.md) | Developer | What the CEL engine supports vs. what shipped controls exercise — operators, composition, time, identity, output surface |
| [Stability](reference/stability.md) | Both | Schema versioning policy |
| [Changelog](reference/changelog.md) | Both | Release history |
| [IAM Permissions](reference/iam-permissions.md) | DevOps | Minimum AWS IAM for extraction |
| [Identity Blast Radius](reference/identity-blast-radius.md) | Security | Blast radius controls, observation properties, chain spec |
| [Operator Contract](reference/operator-contract.md) | Developer | Post-change verification steps |
| [Security Policy](reference/security-policy.md) | All | Vulnerability reporting policy |

## Explanation (Understanding)

Background, context, and reasoning. Read when you want to understand _why_.

| Document | Audience | Summary |
| ---------- | ---------- | --------- |
| [How Stave Works](explanation/how-stave-works.md) | Both | Pipeline architecture |
| [Controls as Code](explanation/controls-as-code.md) | Both | What controls are and how they work |
| [Air-Gapped Analysis](explanation/air-gapped-analysis.md) | User | Why Stave runs offline |
| [Design Philosophy](explanation/design-philosophy.md) | Developer | Architectural principles |
| [FAQ](explanation/faq.md) | Both | Design rationale and terminology |
| [Threat Model](explanation/threat-model.md) | Security | Threat analysis |
| [Trust & Security](explanation/trust-and-security.md) | Security | Trust model |
| [Release Security](explanation/release-security.md) | Security | Release pipeline security |
| [Data Flow](explanation/data-flow.md) | Security | Data flow and I/O boundaries |
| [Execution Safety](explanation/execution-safety.md) | Security | Execution safety guarantees |
| [Guarantees](explanation/guarantees.md) | Security | Formal safety guarantees |
| [Go Idioms](explanation/go-idioms.md) | Developer | 200+ Go best practices used in the codebase |
| [Logic Trace](explanation/logic-trace.md) | Both | Why the Logic Trace exists (explainability, proof of pass) |
| [Identity Blast Radius](explanation/identity-blast-radius.md) | Security | Why credential compromise reach matters; vs. control-level blast radius |
| [Stave and Z3](explanation/z3-solver.md) | Developer | What Google CEL covers, what an SMT solver adds, the Go example under examples/ |
| [Z3 Question Catalogue](explanation/z3-question-catalogue.md) | Developer | Question shapes Z3 reasoning answers, organised by attack stage (initial access → exfiltration) plus deeper analysis patterns |
| [Files as the Boundary](explanation/files-as-the-boundary.md) | Developer | Why CEL evaluates and external reasoning engines consume files on disk — the architecture behind the nine-engine surface |
| [Pending Items](explanation/pending-items.md) | Developer | Unimplemented HIPAA controls and roadmap |

## Not Included

These files are internal/operational and not part of user or developer documentation:

| File | Reason |
|------|--------|
| RELEASING.md | Maintainer-only release process |
| coverage-policy.md | Internal test infrastructure |
| CONTENT_INVENTORY.md | Meta documentation inventory |
| CLAUDE.md | AI assistant instructions (lives at the repo root, not under stave/) |
| beta-tests.md | Internal QA test plan |
| [plans/](../stave/docs/plans/) | Internal architecture plans |
| airs-audit.md | Internal AIRS pattern audit |
| constructor-audit.md | Internal constructor pattern audit |
| functional-options-audit.md | Internal functional options audit |
