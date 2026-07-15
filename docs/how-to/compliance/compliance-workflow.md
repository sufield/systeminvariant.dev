# Compliance Workflow

The compliance workflow differs from the developer workflow. A developer starts with observations they already have and runs `stave apply` to find violations. A compliance officer starts by asking: "given the AWS services we use, what do we need to collect, what are we missing, and where do we stand against a specific framework?"

## Overview[​](#overview "Direct link to Overview")

```
stave discover       You capture        stave readiness     stave apply         stave export
     ↓               snapshots               ↓                  ↓                   ↓
"I use these    →   with your own   →   "Here's what    →  "Here are your  →  OSCAL / OCSF /
 AWS services"      tools (AWS CLI,      you captured       compliance         compliance
                    Steampipe, etc.)     vs what's needed"  findings"          evidence package"
```

Five steps. Each produces deterministic output. The whole pipeline runs offline.

## Step 1: Discover What to Collect[​](#step-1-discover-what-to-collect "Direct link to Step 1: Discover What to Collect")

Tell Stave which AWS services you use. It resolves the control packs covering those services and produces a collection manifest — the exact API calls, observation signals, and minimum IAM permissions your collector needs.

```
stave discover --services iam,s3,ec2,lambda,cloudtrail
```

The manifest lists:

* Which AWS API calls to make (read-only)
* Which observation properties each control needs
* The minimum IAM policy for your collector

Stave never calls AWS itself. `discover` tells you **what** to collect; you collect it with your own tools.

For machine-readable output (useful for driving a collector script):

```
stave discover --services iam,s3 --format json
```

## Step 2: Capture Observation Snapshots[​](#step-2-capture-observation-snapshots "Direct link to Step 2: Capture Observation Snapshots")

Use the collection manifest from Step 1 to capture snapshots. Any tool that produces JSON works:

* **AWS CLI + jq** — see [Create Snapshots](/docs/how-to/getting-started/create-snapshots.md) for recipes
* **Steampipe** — query AWS APIs and export as JSON
* **Terraform state** — extract resource configuration from state files
* **Custom scripts** — any tool that produces `obs.v0.1` JSON

Place snapshot files in a directory. Stave needs at least two snapshots (two points in time) for duration-based controls.

```
ls observations/
# 2026-07-01T00:00:00Z.json
# 2026-07-02T00:00:00Z.json
```

## Step 3: Assess Coverage[​](#step-3-assess-coverage "Direct link to Step 3: Assess Coverage")

Before running the full evaluation, check what your snapshots cover and what they're missing. Two commands, two levels of detail.

### Asset-type coverage (readiness)[​](#asset-type-coverage-readiness "Direct link to Asset-type coverage (readiness)")

Did the collector capture the right asset types at all?

```
stave readiness --observations ./observations
```

Reports: "You captured 22 S3 buckets, 47 IAM roles, 0 Lambda functions." If an asset type is absent, controls for that type cannot fire.

### Field-level coverage (gaps)[​](#field-level-coverage-gaps "Direct link to Field-level coverage (gaps)")

Of the assets you captured, which fields are missing?

```
stave gaps --observations ./observations
```

Reports: "Of the 22 S3 buckets, 19 lack `data_classification` — that's blocking 98 chains from firing." Gaps ranks missing fields by unlock value so you know what to tag or capture first.

Widen the gap report to see more:

```
stave gaps --observations ./observations --top 10
```

### Iterate[​](#iterate "Direct link to Iterate")

If `readiness` or `gaps` shows significant missing coverage, go back to Step 2 and capture the missing data. The discover manifest from Step 1 tells you exactly which API calls produce the missing fields.

## Step 4: Evaluate Against a Compliance Profile[​](#step-4-evaluate-against-a-compliance-profile "Direct link to Step 4: Evaluate Against a Compliance Profile")

Run the evaluation against a built-in compliance profile or a custom one.

### Built-in profiles[​](#built-in-profiles "Direct link to Built-in profiles")

```
# Evaluate against the HIPAA profile
stave apply --profile hipaa --input observations.json

# Evaluate against a service-scoped profile
stave apply --profile aws-s3 --input observations.json

# Scope to specific services without a named profile
stave apply --services iam,s3 --observations ./observations
```

### SLA policy profiles[​](#sla-policy-profiles "Direct link to SLA policy profiles")

Apply framework-specific remediation timelines:

```
# PCI DSS v4 remediation SLAs
stave apply --observations ./observations --sla-profile pci_dss_v4

# FedRAMP Moderate
stave apply --observations ./observations --sla-profile fedramp_moderate

# SOC 2
stave apply --observations ./observations --sla-profile soc2
```

### Custom compliance profiles[​](#custom-compliance-profiles "Direct link to Custom compliance profiles")

Write a YAML profile mapping your organization's controls to a framework:

```
stave apply --observations ./observations --profile-file ./my-compliance-profile.yaml
```

### Deterministic output[​](#deterministic-output "Direct link to Deterministic output")

Use `--eval-time` for reproducible results in CI or audit evidence:

```
stave apply --observations ./observations \
  --sla-profile hipaa \
  --eval-time 2026-07-03T00:00:00Z
```

## Step 5: Export Evidence Packages[​](#step-5-export-evidence-packages "Direct link to Step 5: Export Evidence Packages")

Export findings in the format your auditors or downstream systems need.

### OSCAL (FedRAMP, NIST)[​](#oscal-fedramp-nist "Direct link to OSCAL (FedRAMP, NIST)")

```
stave export oscal --observations ./observations
```

Produces OSCAL 1.1.2 Assessment Results JSON — a complete evidence document for federal audit submissions.

### Compliance evidence package[​](#compliance-evidence-package "Direct link to Compliance evidence package")

```
stave export compliance --observations ./observations
```

### OCSF (security analytics)[​](#ocsf-security-analytics "Direct link to OCSF (security analytics)")

```
stave export ocsf --observations ./observations
```

Produces OCSF 1.1 Compliance Finding events for SIEM/analytics ingestion.

### SARIF (GitHub Advanced Security)[​](#sarif-github-advanced-security "Direct link to SARIF (GitHub Advanced Security)")

```
stave apply --observations ./observations --format sarif
```

Drops directly into GitHub Advanced Security or any SARIF-compatible tool.

## Compliance vs Developer Workflow[​](#compliance-vs-developer-workflow "Direct link to Compliance vs Developer Workflow")

| Concern        | Developer Workflow                          | Compliance Workflow                                                   |
| -------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| Starting point | Already have observations                   | Need to discover what to collect                                      |
| Goal           | Find and fix violations                     | Produce evidence for auditors                                         |
| Coverage check | Usually skip — they know what they captured | Essential — `readiness` + `gaps` before evaluation                    |
| Profile        | Often default (all controls)                | Framework-specific (`hipaa`, `pci_dss_v4`, `fedramp_moderate`)        |
| SLA tracking   | Usually off                                 | On — remediation deadlines matter                                     |
| Output format  | Text or JSON for human review               | OSCAL, OCSF, SARIF for auditors and downstream systems                |
| Time dimension | `stave apply` on latest snapshot            | Multiple snapshots over time — `git log` proves continuous compliance |
| Determinism    | Nice to have                                | Required — `--eval-time` for reproducible evidence                    |

## Continuous Compliance[​](#continuous-compliance "Direct link to Continuous Compliance")

For ongoing compliance, automate the pipeline:

1. **Schedule snapshot capture** — cron job or CI pipeline runs the collector daily/weekly
2. **Store snapshots in git** — each snapshot is a commit; `git log` proves continuous coverage
3. **Run evaluation in CI** — `stave apply --sla-profile <framework>` on every new snapshot
4. **Export evidence** — `stave export oscal` produces the audit artifact
5. **Track posture over time** — `stave trend` shows compliance trajectory; `stave bisect` finds when a control first failed

```
# Example CI step
stave apply --observations ./observations \
  --sla-profile fedramp_moderate \
  --eval-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --format json > assessment.json

stave export oscal --observations ./observations > oscal-results.json
```

## Quick Reference[​](#quick-reference "Direct link to Quick Reference")

```
# 1. What do I need to collect?
stave discover --services iam,s3,ec2,lambda

# 2. [Capture snapshots with your own tools]

# 3. What am I missing?
stave readiness --observations ./observations
stave gaps --observations ./observations --top 10

# 4. How do I stand?
stave apply --observations ./observations --sla-profile hipaa

# 5. Export for auditors
stave export oscal --observations ./observations
```
