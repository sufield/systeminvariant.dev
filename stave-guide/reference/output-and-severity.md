---
title: "Output and Severity"
sidebar_label: "Output & Severity"
sidebar_position: 4
description: "How to read evaluation output, severity, remediation, and fix plans."
---

# Output and Severity

This page explains how to read evaluation output. For tuning duration thresholds and per-control overrides see [Severity Thresholds](severity-thresholds.md).

Stave evaluation output is JSON (`out.v0.1`) with deterministic ordering.

## Top-level shape

```json
{
  "schema_version": "out.v0.1",
  "kind": "ASSESSMENT",
  "run": { "tool_version": "dev", "offline": true },
  "summary": { "resources_evaluated": 5, "attack_surface": 2, "violations": 3 },
  "findings": [],
  "extensions": {
    "selected_controls_source": "packs",
    "enabled_control_packs": ["s3"],
    "resolved_control_ids": ["CTL.S3.PUBLIC.001"]
  }
}
```

## Finding fields

Each finding includes:
- control identity (`control_id`, `control_name`, `control_description`)
- resource identity (`resource_id`, `resource_type`, `resource_vendor`)
- temporal/config evidence (`evidence`)
- remediation guidance (`mitigation`)
- optional `remediation` summary string
- optional machine-readable `fix_plan`

## Fix plan

`fix_plan` is deterministic and suggestion-only. It does not apply changes.

```json
{
  "fix_plan": {
    "id": "fix-1234abcd",
    "target": {
      "resource_id": "res:aws:s3:bucket:example",
      "resource_type": "storage_bucket"
    },
    "preconditions": ["Confirm change window approval."],
    "actions": [
      {
        "action_type": "set",
        "path": "properties.storage.controls.block_public_policy",
        "value": true
      }
    ],
    "expected_effect": "Prevents public access by blocking policy and ACL based exposure paths."
  }
}
```

Display a fix plan for one finding:

```bash
stave fix --input ./evaluation.json --finding CTL.S3.PUBLIC.001@res:aws:s3:bucket:example
```

## Severity levels

| Severity | Meaning |
|----------|---------|
| `critical` | Immediate risk of exposure or takeover |
| `high` | Significant security gap |
| `medium` | Important hardening/control gap |
| `low` | Lower-impact improvement |
| `info` | Informational finding |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | No violations |
| `2` | Input/validation error |
| `3` | Violations found |
| `4` | Internal error |
| `130` | Interrupted |
