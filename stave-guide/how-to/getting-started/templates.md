---
title: "Templates"
sidebar_label: "Templates"
sidebar_position: 4
---

# Templates

A template packages a complete security assessment workflow — which controls to evaluate, which compound chains to run, and how to report findings — into a single command. You pick the job, configure your environment, and run.

## Quick Start

```bash
# 1. See which templates apply to your snapshot
stave recommend --snapshot ./snapshot.json

# 2. Initialize the one you want
stave template init bucket-hijacking-assessment

# 3. Verify the template works (runs against a built-in test fixture)
stave template verify bucket-hijacking-assessment

# 4. Run it against your snapshot
stave apply --values ./stave-values.yaml --snapshot ./snapshot.json
```

## Available Templates

| Template | Job | What It Evaluates |
|---|---|---|
| `m-and-a-diligence` | Credential-free posture assessment of an acquisition target | IAM, S3, CloudTrail, Config, Organizations, GuardDuty, KMS. All privilege escalation and cross-account chains. Findings mapped to CIS and SCS-C03. |
| `breach-reconstruction` | Determine security posture at the moment of an incident | Security telemetry integrity (CloudTrail, GuardDuty, VPC Flow Logs, Firehose destinations). All bucket hijacking chains. Focused on whether the attacker could have blinded your monitoring. |
| `independent-audit` | Produce re-derivable findings with a full evidence chain | Full control catalog. All compound chains. All compliance framework mappings. JSONL and SMT-LIB export for independent Z3 verification. |
| `bucket-hijacking-assessment` | Evaluate every router-to-S3 destination binding for namespace hijacking risk | 42 router types across security telemetry, data pipelines, and artifact storage. Ghost-reference, destination-ownership, and data-perimeter controls. Five compound chains. |

## Commands

### `stave recommend`

After loading a snapshot, evaluates which templates are relevant based on what the snapshot contains.

```bash
stave recommend --snapshot ./snapshot.json
```

Output tells you which templates match and why:

```
Recommended templates for this snapshot:

  1. bucket-hijacking-assessment (priority 70)
     Matched facts:
       ✓ 14 S3 buckets
       ✓ 3 CloudTrail trails
       ✓ 2 Firehose delivery streams
     Run: stave template init bucket-hijacking-assessment

  2. m-and-a-diligence (priority 50)
     Matched facts:
       ✓ AWS Organizations present
       ✓ 4 accounts
     Run: stave template init m-and-a-diligence
```

### `stave template init`

Creates a values file for your environment. The values file is yours — it persists your configuration and survives template upgrades.

**Interactive** (prompts for each parameter):

```bash
stave template init bucket-hijacking-assessment
```

**Non-interactive** (for CI/pipelines):

```bash
stave template init bucket-hijacking-assessment \
    --param target_accounts=123456789012,987654321098 \
    --param regions=us-east-1 \
    --param severity_threshold=high \
    --output ./stave-values.yaml
```

This writes `stave-values.yaml`:

```yaml
template: bucket-hijacking-assessment
version: "1.0.0"
parameters:
  target_accounts: ["123456789012", "987654321098"]
  regions: ["us-east-1"]
  severity_threshold: "high"
overrides: {}
```

### `stave template verify`

Proves a template works end-to-end before you run it against real data. Every template ships with a test fixture — a known-bad snapshot and the findings it should produce.

```bash
stave template verify bucket-hijacking-assessment
```

```
Verifying template: bucket-hijacking-assessment
  Loading fixture snapshot... OK
  Evaluating 42 controls... OK
  Running 5 compound chains... OK
  Comparing findings (semantic match on control_id + resource_id):
    Expected: 47 findings
    Actual:   47 findings
    Matched:  47/47
  PASS
```

If it passes, the template works. Run it against your snapshot.

## Customization

### Change parameters

Edit `stave-values.yaml` directly. Change regions, accounts, severity thresholds. Re-run `stave apply --values ./stave-values.yaml`.

### Disable or add controls

Add an `overrides` section to your values file:

```yaml
overrides:
  disable_controls:
    - "CTL.S3.BUCKET.VERSIONING.001"  # Accepted risk
  additional_controls:
    - "CTL.CUSTOM.MY_ORG.001"
  disable_chains:
    - "permission_asymmetry"
```

The template stays upstream and receives catalog updates. Your overrides are applied on top at evaluation time.

### Full customization (eject)

If you need to modify the template workflow itself:

```bash
stave template eject bucket-hijacking-assessment
```

This copies the full template to `./stave-templates/bucket-hijacking-assessment/`. You own it entirely. It will not receive catalog updates. To return to the managed template, delete the local copy and re-run `stave template init`.

## How Updates Work

Templates ship inside the `stave` binary. When you upgrade Stave, the templates upgrade with it — new controls are included, fixed predicates take effect, new compound chains are added.

Your values file is not affected by upgrades. It contains your parameters and overrides, not the workflow definition. An upgrade that adds ten new controls to the catalog automatically includes them in the template's evaluation scope (unless your overrides exclude them).

If an upgrade changes a control's behavior in a way that affects a template, the fixture test catches it before release. Templates that ship have passed their fixture verification against the current catalog.

## Air-Gapped Operation

Templates are embedded in the binary. No network calls, no registry, no external dependencies. The `stave recommend`, `stave template init`, and `stave template verify` commands work offline.

For custom templates, place them in `~/.stave/templates/` or `./stave-templates/`. These are loaded alongside the built-in templates.

## Writing Custom Templates

Create a `template.yaml` following the schema:

```yaml
apiVersion: stave/v1
kind: Template
metadata:
  name: my-custom-assessment
  description: "What this template evaluates and why"
  job: "The job this template accomplishes"
  version: "1.0.0"

recommend_when:
  predicate: >
    summary.services.contains("lambda") &&
    summary.iam_role_count > 50
  priority: 40

parameters:
  - name: my_param
    description: "What this parameter controls"
    type: string
    required: true

scope:
  services:
    - iam
    - lambda

controls:
  include:
    - "CTL.IAM.*"
    - "CTL.LAMBDA.*"

chains:
  include:
    - "privilege_escalation"

runbook:
  steps:
    - action: eval
      description: "Evaluate selected controls"
      args:
        snapshot: "{{ .SnapshotPath }}"
        controls: "{{ .ControlSelection }}"
    - action: report
      description: "Export findings"
      args:
        format: jsonl
        output: "{{ .OutputPath }}"

fixture:
  snapshot: "fixtures/my-custom-assessment/snapshot.json"
  expected_findings: "fixtures/my-custom-assessment/expected.jsonl"
  match_keys: ["control_id", "resource_id"]
```

Place in `~/.stave/templates/my-custom-assessment/` with the fixture files. Run `stave template verify my-custom-assessment` to confirm it works.

Every custom template should have a fixture. A template without a fixture is a template you can't prove works.
