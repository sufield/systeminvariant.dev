---
title: "stave export oscal"
sidebar_label: "export oscal"
sidebar_position: 93
description: "Export findings as OSCAL 1.1.2 Assessment Results JSON"
---

# stave export oscal

Export findings as OSCAL 1.1.2 Assessment Results JSON

## Usage

```
stave export oscal [flags]
```

## Description

Convert assessment findings to an OSCAL Assessment Results document
for FedRAMP, FISMA, and DoD automated toolchain ingestion.

UUIDs are deterministic (derived from control_id + asset_id).

Document types:
  assessment-results   Standard assessment results (default)
  poam                 Plan of Action and Milestones
  ssp                  System Security Plan (stub)

Exit Codes:
  0   Export complete
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--assessment` | string | stave apply JSON output (required) |
| `--system-uuid` | string | system UUID for POA&M generation |
| `--type` | string | OSCAL document type: assessment-results, poam, ssp (default: `assessment-results`) |

## Examples

```bash
stave export oscal --assessment findings.json
  stave export oscal --assessment findings.json --type poam --system-uuid abc-123
```
