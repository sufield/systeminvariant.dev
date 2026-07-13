---
title: "Understanding Why Stave Reached a Verdict"
sidebar_label: "Logic Trace"
---

# Understanding Why Stave Reached a Verdict

Learn how to use the Logic Trace to see the step-by-step reasoning behind
every finding — and generate AI-ready prompts for remediation guidance.

## Prerequisites

- Stave installed (`make build`)
- A working evaluation (controls + observations)

## Step 1: Run evaluation with trace

Add `--trace` to any `stave apply` command to record the reasoning chain:

```bash
stave apply \
  --controls controls/s3 \
  --observations observations/ \
  --max-unsafe 168h \
  --eval-time 2026-01-11T00:00:00Z \
  --trace audit_trace.json \
  --format json > evaluation.json
```

This produces two files:
- `evaluation.json` — the findings (what was detected)
- `audit_trace.json` — the reasoning (why it was detected)

## Step 2: Read the trace

The trace contains one assessment per control × asset pair:

```json
{
  "schema_version": "trace.v0.1",
  "assessments": [
    {
      "resource_id": "my-bucket",
      "policy_id": "CTL.S3.PUBLIC.001",
      "verdict": "VIOLATION",
      "confidence": "HIGH",
      "steps": [
        {
          "name": "exemption_check",
          "result": {"exempted": false}
        },
        {
          "name": "predicate_evaluation",
          "input": {"currently_unsafe": true},
          "result": {"matched": true}
        },
        {
          "name": "threshold_check",
          "input": {"threshold_hours": 168},
          "result": {"exceeds_threshold": true}
        }
      ]
    }
  ]
}
```

Each step shows what the engine examined and what it concluded:
- **exemption_check** — was the asset exempted? No.
- **predicate_evaluation** — did the unsafe predicate match? Yes.
- **threshold_check** — did the unsafe duration exceed the SLA? Yes.

## Step 3: Generate an explainable prompt

Feed the trace into the prompt generator for AI-assisted remediation:

```bash
stave prompt from-finding \
  --evaluation-file evaluation.json \
  --asset-id my-bucket \
  --controls controls/s3 \
  --trace-file audit_trace.json
```

The output is a self-contained Markdown prompt that includes:
- Finding details with evidence
- Control YAML definition
- Remediation guidance
- **Evaluation Logic Trace** — the step-by-step reasoning

Copy this prompt into any AI assistant — even on a different, air-gapped
machine — for remediation guidance grounded in the actual evaluation logic.

## Step 4: Understand a passing verdict

The trace is equally valuable for passing controls. It proves *why*
something was considered compliant — not just that it wasn't flagged:

```json
{
  "resource_id": "secure-bucket",
  "policy_id": "CTL.S3.PUBLIC.001",
  "verdict": "PASS",
  "confidence": "HIGH",
  "steps": [
    {
      "name": "exemption_check",
      "result": {"exempted": false}
    },
    {
      "name": "predicate_evaluation",
      "input": {"currently_unsafe": false},
      "result": {"matched": false}
    }
  ]
}
```

The predicate didn't match — the bucket is not in an unsafe state. This is
the "Proof of Pass" that auditors need: not just absence of a finding, but
evidence that the control was evaluated and the asset was compliant.

## What you learned

- `--trace` records the engine's reasoning for every control × asset pair
- The trace shows exemption checks, predicate evaluation, and threshold checks
- `--trace-file` on the prompt command includes the reasoning in LLM prompts
- Passing verdicts are traced too — "Proof of Pass" for auditors
