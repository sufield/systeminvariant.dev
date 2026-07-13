---
title: "Interpreting Findings"
sidebar_label: "Interpreting Findings"
sidebar_position: 1
description: "How to read findings and execute deterministic remediation planning."
---

# Interpreting Findings

Use findings to answer four questions quickly:
1. Which control failed?
2. Which resource failed?
3. What evidence proves it?
4. What is the remediation and fix plan?

## Anatomy of a finding

```json
{
  "control_id": "CTL.S3.PUBLIC.001",
  "resource_id": "res:aws:s3:bucket:example",
  "evidence": {
    "unsafe_duration_hours": 120,
    "threshold_hours": 24,
    "matched_properties": [
      {"path": "properties.storage.visibility.public_read", "value": true}
    ],
    "why_now": "Resource has been unsafe longer than threshold."
  },
  "mitigation": {
    "description": "Bucket is publicly readable.",
    "action": "Enable block public access and remove public grants."
  },
  "remediation": "Enable block public access and remove public grants.",
  "fix_plan": {
    "id": "fix-1234abcd",
    "actions": [
      {"action_type": "set", "path": "properties.storage.controls.block_public_policy", "value": true}
    ]
  }
}
```

## Fast triage checklist

- `control_id` and `control_name`: identify rule intent
- `resource_id`: locate ownership target
- `evidence.matched_properties`: exact failing fields
- `evidence.why_now`: timing reason
- `mitigation.action`: immediate remediation
- `fix_plan.actions`: machine-readable action list for tracking/automation

## Show one fix plan in terminal

```bash
stave fix --input ./evaluation.json --finding CTL.S3.PUBLIC.001@res:aws:s3:bucket:example
```

This command is read-only and does not patch IaC.

## Zero findings: what it means

A clean run — zero findings — is not an empty result. It is a
**negative-assurance artifact**: the controls were evaluated, the
services were covered, and no unsafe state was found.

In audit and diligence framing, a clean report is a positive
deliverable:

- **Controls evaluated** — the full catalog (or template scope) ran
- **Services covered** — every resource type in the snapshot was
  checked against applicable controls
- **Assessment scope** — the snapshot's resource count, account,
  and capture timestamp are recorded

A clean report combined with an [evidence packet](../../reference/evidence-packet-spec.md)
is the artifact an auditor or CISO receives. "No findings" backed by
a manifest and catalog version is a stronger statement than "we
didn't check."

## When results look unexpected

```bash
stave diagnose --controls ./controls --observations ./observations --eval-time 2026-01-15T00:00:00Z
```

Common causes:
- threshold higher than available observation span
- resource became safe before threshold was exceeded
- predicate field path missing from observations
