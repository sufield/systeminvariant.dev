---
title: "Breach-Type Routing with Evaluation Context"
sidebar_label: "Breach-Type Routing"
sidebar_position: 6
description: "How to use the --context flag to filter invariant evaluation based on incident breach type."
---

# Breach-Type Routing with Evaluation Context

When investigating a security incident, not all invariants are relevant. A data disclosure incident calls for different checks than a physical breach or insider threat. The `--context` flag lets you scope evaluation to invariants that apply to a specific breach type.

## Context File Format

The context file is a YAML file with two fields:

```yaml
# context.yaml
breach_type: DISC          # Required: breach type code
incident_id: INC-2026-001  # Optional: for tracking and correlation
```

| Field | Required | Description |
|-------|----------|-------------|
| `breach_type` | Yes | One of the supported breach type codes (see table below) |
| `incident_id` | No | Free-form identifier for correlation with incident tracking systems |

## Supported Breach Types

| Code | Breach Type | Behavior |
|------|-------------|----------|
| `DISC` | Disclosure (unintended data exposure) | Evaluates only disclosure-relevant invariants |
| `HACK` | Hacking (external attack) | Returns `NOT_APPLICABLE` |
| `INSD` | Insider threat | Returns `NOT_APPLICABLE` |
| `PHYS` | Physical breach | Returns `NOT_APPLICABLE` |
| `PORT` | Portable device loss | Returns `NOT_APPLICABLE` |
| `UNKN` | Unknown | Returns `NOT_APPLICABLE` |

In MVP 1.0, only `DISC` triggers invariant evaluation. All other breach types return a `NOT_APPLICABLE` decision immediately, with exit code 0.

## Usage

Pass the context file to any evaluation command:

```bash
stave apply \
  --invariants ./invariants \
  --observations ./observations \
  --context context.yaml \
  --max-unsafe 168h
```

The `--context` flag is also accepted by `validate` and `diagnose`.

## How Filtering Works

### Without `--context`

All loaded invariants are evaluated. No filtering is applied.

```bash
# Evaluates ALL invariants
stave apply --invariants ./invariants --observations ./observations
```

### With `--context` and `breach_type: DISC`

Only invariants in the DISC allowlist are evaluated. All others are skipped and reported in the `skipped` section of the output.

**DISC allowlist (MVP 1.0):**

| Invariant ID | Name |
|--------------|------|
| `INV.TP.PLATFORM.001` | Third-Party Platform Boundaries |
| `INV.TP.VENDOR.001` | Third-Party Vendor Data Boundaries |
| `INV.PROC.MAIL.001` | Process Audience Verification |
| `INV.ID.AUTHZ.001` | Least-Privilege Subject Access |

### With `--context` and an unsupported breach type

Evaluation is skipped entirely. Stave returns a `NOT_APPLICABLE` result with exit code 0:

```json
{
  "breach_type": "HACK",
  "decision": "NOT_APPLICABLE",
  "incident_id": "INC-2026-002",
  "reason": "unsupported_breach_type_mvp"
}
```

## Skipped Invariants in Output

When breach-type filtering removes invariants from evaluation, they appear in the output's `skipped` array with a reason:

```json
{
  "skipped": [
    {
      "breach_type": "DISC",
      "invariant_id": "INV.EXP.DURATION.001",
      "invariant_name": "Unsafe Exposure Duration Bound",
      "reason": "not_applicable_to_disc_mvp"
    }
  ]
}
```

This provides an audit trail — you can see exactly which invariants were excluded and why.

## Worked Example: Disclosure Investigation

Suppose you are investigating a data disclosure incident where PHI may have been exposed via a misconfigured S3 bucket.

**1. Create a context file:**

```yaml
# incident-context.yaml
breach_type: DISC
incident_id: INC-2026-0042
```

**2. Run evaluation with context:**

```bash
stave apply \
  --invariants ./invariants \
  --observations ./observations \
  --context incident-context.yaml \
  --max-unsafe 168h \
  --eval-time 2026-02-15T00:00:00Z
```

**3. Interpret the output:**

- **Findings** contain only violations from DISC-applicable invariants
- **Skipped** lists all other invariants that were excluded by the filter
- The `incident_id` appears in the output for correlation

**4. Compare with full evaluation:**

To see what a full (unfiltered) evaluation would find, run without `--context`:

```bash
stave apply \
  --invariants ./invariants \
  --observations ./observations \
  --max-unsafe 168h \
  --eval-time 2026-02-15T00:00:00Z
```

## Exit Codes

Context routing does not change exit code semantics:

| Code | Meaning |
|------|---------|
| 0 | No violations found (or `NOT_APPLICABLE` for unsupported breach types) |
| 2 | Input error (invalid context file, missing `breach_type` field) |
| 3 | Violations detected among applicable invariants |
