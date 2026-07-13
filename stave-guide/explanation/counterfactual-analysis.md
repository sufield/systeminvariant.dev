---
title: "Counterfactual Analysis"
sidebar_label: "Counterfactual Analysis"
description: "Counterfactual analysis answers whether a given control would have prevented a past breach, turning post-incident review into evidence-based control prioritization."
---

# Counterfactual Analysis Reports

Counterfactual analysis answers: **Would this control have prevented this breach?**

Given a past incident, Stave evaluates which safety controls would have stopped the disclosure before it occurred.

## Purpose

Traditional post-incident reviews ask: what happened? Counterfactual analysis asks **what would have happened differently?**

| Traditional Analysis | Counterfactual Analysis |
|---------------------|------------------------|
| Describes the breach | Evaluates prevention potential |
| Assigns blame | Identifies missing controls |
| Recommends fixes | Proves which rules would have worked |
| Retrospective | Actionable |

## How It Works

1. **Input:** A past breach incident with breach type and narrative
2. **Match:** Stave matches the incident against rule patterns
3. **Evaluate:** Each applicable invariant receives a prevention decision
4. **Output:** A report showing which invariants would have prevented the breach

```
Incident → Pattern Match → Prevention Decision → Report
```

## Prevention Decisions

Each invariant receives one of three decisions:

| Decision | Meaning |
|----------|---------|
| `WOULD_PREVENT` | This invariant would have stopped the breach |
| `WOULD_NOT_PREVENT` | This invariant would not have stopped this specific breach |
| `UNKNOWN` | Insufficient information to determine prevention potential |

## Report Format

### Input: Incident Definition

```yaml
incident_id: INC-2026-001
breach_type: DISC
narrative: |
  A tracking pixel embedded in marketing emails was capturing
  patient identifiers and sending them to a third-party analytics
  platform without consent verification.
labeled_failure_category: ThirdParty.Platform.Tracking
```

### Output: Counterfactual Report

```json
{
  "incident_id": "INC-2026-001",
  "breach_type": "DISC",
  "results": [
    {
      "invariant_id": "INV.TP.PLATFORM.001",
      "decision": "WOULD_PREVENT",
      "reason": "third_party_platform_boundary_violation"
    },
    {
      "invariant_id": "INV.TP.VENDOR.001",
      "decision": "WOULD_NOT_PREVENT",
      "reason": "not_vendor_data_sharing"
    },
    {
      "invariant_id": "INV.PROC.MAIL.001",
      "decision": "WOULD_NOT_PREVENT",
      "reason": "not_audience_mismatch"
    },
    {
      "invariant_id": "INV.ID.AUTHZ.001",
      "decision": "WOULD_NOT_PREVENT",
      "reason": "not_subject_access_violation"
    }
  ]
}
```

## DISC Breach Type Invariants

For disclosure (DISC) incidents, these invariants are evaluated:

| Invariant | What It Prevents |
|-----------|------------------|
| `INV.TP.PLATFORM.001` | Data exposure via third-party platforms (analytics, tracking) |
| `INV.TP.VENDOR.001` | Sensitive data shared with unapproved vendors |
| `INV.PROC.MAIL.001` | Misdirected communications (wrong recipient) |
| `INV.ID.AUTHZ.001` | Unauthorized subject-level data access |

## Example Scenarios

### Tracking Pixel Leak

**Incident:** Marketing emails contained a tracking pixel that leaked patient IDs to an analytics provider.

**Result:**
- `INV.TP.PLATFORM.001`: **WOULD_PREVENT** - Third-party platform integration lacked declared boundaries
- Other invariants: WOULD_NOT_PREVENT

**Interpretation:** If boundary declarations were required for platform integrations, this disclosure would not have occurred.

### Mailing Misdirect

**Incident:** A batch mailing sent Patient A's records to Patient B's address.

**Result:**
- `INV.PROC.MAIL.001`: **WOULD_PREVENT** - Audience verification would have caught the mismatch
- Other invariants: WOULD_NOT_PREVENT

**Interpretation:** If actual_audience was verified against intended_audience before dispatch, the mailing would have been blocked.

### Vendor Data Breach

**Incident:** A third-party claims processor exposed PHI data on an unsecured endpoint.

**Result:**
- `INV.TP.VENDOR.001`: **WOULD_PREVENT** - Vendor was not on the approved list for PHI handling
- Other invariants: WOULD_NOT_PREVENT

**Interpretation:** If vendor approval was enforced before data sharing, PHI would not have reached the vendor.

### Insider Over-Access

**Incident:** An employee accessed patient records unrelated to their assigned cases.

**Result:**
- `INV.ID.AUTHZ.001`: **WOULD_PREVENT** - Subject-level access controls were not enforced
- Other invariants: WOULD_NOT_PREVENT

**Interpretation:** If row-level access was restricted to assigned subjects, the unrelated records would have been invisible.

## Interpreting Results

### When You See WOULD_PREVENT

The invariant would have blocked the breach **before it occurred**. This means:

1. The control gap is proven, not theoretical
2. Implementing this invariant prevents similar future incidents
3. The investment in this control is justified by evidence

### When You See WOULD_NOT_PREVENT

The invariant addresses a different failure mode. This does not mean:

- The invariant is unimportant
- It should not be implemented

It means this specific incident was caused by a different gap.

### When You See UNKNOWN

Insufficient information to determine causality. Common reasons:

- Incident narrative lacks specific details
- Failure category not labeled
- Novel incident type without matching rules

## Integration with Stave Evaluation

Counterfactual analysis complements Stave's primary evaluation:

| Stave Evaluate | Counterfactual Analysis |
|----------------|------------------------|
| Looks forward (current state) | Looks backward (past incidents) |
| Detects current violations | Proves prevention potential |
| You have this gap now | This gap caused that breach |

Together they provide:

1. **Evidence of current risk** (evaluate)
2. **Proof that controls work** (counterfactual)

## Report Use Cases

### Executive Briefing

> "Of the 12 disclosure incidents in the past year, 9 were preventable by controls we don't have. Here's the proof."

### Compliance Documentation

Counterfactual reports demonstrate:

- Root cause analysis methodology
- Control gap identification
- Evidence-based remediation prioritization

### Budget Justification

> "Implementing INV.TP.PLATFORM.001 would have prevented 4 of our 6 third-party data incidents. Cost of incidents: $2.4M. Cost of control: $50K."

## Limitations

1. **DISC only (MVP 1.0):** Other breach types return NOT_APPLICABLE
2. **Rule-based matching:** Relies on narrative keywords and failure categories
3. **Deterministic:** Same input always produces same output (no ML/probability)

## Best Practices

1. **Label incidents consistently:** Use standardized failure categories
2. **Write detailed narratives:** Include specific technical details
3. **Review UNKNOWN results:** May indicate rule gaps
4. **Combine with forward evaluation:** Use both backward and forward analysis
