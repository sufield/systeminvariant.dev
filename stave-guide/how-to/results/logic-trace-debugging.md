---
sidebar_position: 2
---
# How to Debug Unexpected Findings with the Logic Trace

Use the logic trace when Stave produces a finding you don't expect — or
doesn't produce a finding you do expect.

## Problem: unexpected violation

A control fires but you believe the asset is compliant.

### Step 1: Generate the trace

```bash
stave apply \
  --controls controls/s3 \
  --observations observations/ \
  --max-unsafe 168h \
  --eval-time 2026-01-11T00:00:00Z \
  --trace trace.json \
  --format json > eval.json
```

### Step 2: Find the assessment

Search `trace.json` for the control and asset:

```bash
jq '.assessments[] | select(.policy_id == "CTL.S3.PUBLIC.001" and .resource_id == "my-bucket")' trace.json
```

### Step 3: Read the steps

```json
{
  "verdict": "VIOLATION",
  "steps": [
    {"name": "exemption_check", "result": {"exempted": false}},
    {"name": "predicate_evaluation", "input": {"currently_unsafe": true}, "result": {"matched": true}},
    {"name": "threshold_check", "input": {"threshold_hours": 168}, "result": {"exceeds_threshold": true}}
  ]
}
```

The predicate matched (`currently_unsafe: true`). Check the observation to
see what property value caused the match.

### Step 4: Check the observation

```bash
jq '.assets[] | select(.id == "my-bucket") | .properties.storage.access' observations/latest.json
```

If `public_read: true`, the finding is correct. If `public_read: false`,
the predicate is matching on a different field — check the control YAML.

## Problem: expected violation missing

A control should fire but doesn't.

### Step 1: Generate trace and look for PASS

```bash
jq '.assessments[] | select(.policy_id == "CTL.S3.ENCRYPT.001" and .verdict == "PASS")' trace.json
```

### Step 2: Check why the predicate didn't match

```json
{
  "verdict": "PASS",
  "steps": [
    {"name": "predicate_evaluation", "input": {"currently_unsafe": false}, "result": {"matched": false}}
  ]
}
```

The predicate evaluated to false. This means the observation property doesn't
match what the control expects. Common causes:

- Property path is wrong (control checks `storage.encryption.at_rest_enabled`,
  observation has `storage.encryption.enabled`)
- Value type mismatch (control checks `eq false`, observation has `"false"` as string)
- Missing property (field doesn't exist in the observation — use `op: missing`)

### Step 3: Validate the observation

```bash
stave validate --observations observations/
```

Schema validation catches structural problems. For semantic problems (wrong
property path), compare the observation against the property spec in
`docs/observation-contract.md`.

## Problem: finding appears in one run but not another

### Use determinism check

```bash
stave apply --controls controls/s3 --observations obs/ \
  --max-unsafe 168h --eval-time 2026-01-11T00:00:00Z --trace trace1.json --format json > eval1.json

stave apply --controls controls/s3 --observations obs/ \
  --max-unsafe 168h --eval-time 2026-01-11T00:00:00Z --trace trace2.json --format json > eval2.json

diff trace1.json trace2.json
```

With `--eval-time` fixed, output is deterministic. If results differ between runs
without `--eval-time`, the current time affects threshold calculations — add `--eval-time`
to get reproducible output.

## Generate a remediation prompt from the trace

```bash
stave prompt from-finding \
  --evaluation-file eval.json \
  --asset-id my-bucket \
  --controls controls/s3 \
  --trace-file trace.json
```

The prompt includes the trace reasoning chain so an AI assistant can explain
*why* the finding exists, not just what it is.
