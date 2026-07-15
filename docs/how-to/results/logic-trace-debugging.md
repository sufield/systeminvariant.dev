# How to Debug Unexpected Findings with the Logic Trace

Use the logic trace when Stave produces a finding you don't expect — or doesn't produce a finding you do expect.

## Problem: unexpected violation[​](#problem-unexpected-violation "Direct link to Problem: unexpected violation")

A control fires but you believe the asset is compliant.

### Step 1: Generate the trace[​](#step-1-generate-the-trace "Direct link to Step 1: Generate the trace")

```
stave apply \
  --controls controls/s3 \
  --observations observations/ \
  --max-unsafe 168h \
  --eval-time 2026-01-11T00:00:00Z \
  --trace trace.json \
  --format json > eval.json
```

### Step 2: Find the assessment[​](#step-2-find-the-assessment "Direct link to Step 2: Find the assessment")

Search `trace.json` for the control and asset:

```
jq '.assessments[] | select(.policy_id == "CTL.S3.PUBLIC.001" and .resource_id == "my-bucket")' trace.json
```

### Step 3: Read the steps[​](#step-3-read-the-steps "Direct link to Step 3: Read the steps")

```
{
  "verdict": "VIOLATION",
  "steps": [
    {"name": "exemption_check", "result": {"exempted": false}},
    {"name": "predicate_evaluation", "input": {"currently_unsafe": true}, "result": {"matched": true}},
    {"name": "threshold_check", "input": {"threshold_hours": 168}, "result": {"exceeds_threshold": true}}
  ]
}
```

The predicate matched (`currently_unsafe: true`). Check the observation to see what property value caused the match.

### Step 4: Check the observation[​](#step-4-check-the-observation "Direct link to Step 4: Check the observation")

```
jq '.assets[] | select(.id == "my-bucket") | .properties.storage.access' observations/latest.json
```

If `public_read: true`, the finding is correct. If `public_read: false`, the predicate is matching on a different field — check the control YAML.

## Problem: expected violation missing[​](#problem-expected-violation-missing "Direct link to Problem: expected violation missing")

A control should fire but doesn't.

### Step 1: Generate trace and look for PASS[​](#step-1-generate-trace-and-look-for-pass "Direct link to Step 1: Generate trace and look for PASS")

```
jq '.assessments[] | select(.policy_id == "CTL.S3.ENCRYPT.001" and .verdict == "PASS")' trace.json
```

### Step 2: Check why the predicate didn't match[​](#step-2-check-why-the-predicate-didnt-match "Direct link to Step 2: Check why the predicate didn't match")

```
{
  "verdict": "PASS",
  "steps": [
    {"name": "predicate_evaluation", "input": {"currently_unsafe": false}, "result": {"matched": false}}
  ]
}
```

The predicate evaluated to false. This means the observation property doesn't match what the control expects. Common causes:

* Property path is wrong (control checks `storage.encryption.at_rest_enabled`, observation has `storage.encryption.enabled`)
* Value type mismatch (control checks `eq false`, observation has `"false"` as string)
* Missing property (field doesn't exist in the observation — use `op: missing`)

### Step 3: Validate the observation[​](#step-3-validate-the-observation "Direct link to Step 3: Validate the observation")

```
stave validate --observations observations/
```

Schema validation catches structural problems. For semantic problems (wrong property path), compare the observation against the property spec in `docs/observation-contract.md`.

## Problem: finding appears in one run but not another[​](#problem-finding-appears-in-one-run-but-not-another "Direct link to Problem: finding appears in one run but not another")

### Use determinism check[​](#use-determinism-check "Direct link to Use determinism check")

```
stave apply --controls controls/s3 --observations obs/ \
  --max-unsafe 168h --eval-time 2026-01-11T00:00:00Z --trace trace1.json --format json > eval1.json

stave apply --controls controls/s3 --observations obs/ \
  --max-unsafe 168h --eval-time 2026-01-11T00:00:00Z --trace trace2.json --format json > eval2.json

diff trace1.json trace2.json
```

With `--eval-time` fixed, output is deterministic. If results differ between runs without `--eval-time`, the current time affects threshold calculations — add `--eval-time` to get reproducible output.

## Generate a remediation prompt from the trace[​](#generate-a-remediation-prompt-from-the-trace "Direct link to Generate a remediation prompt from the trace")

```
stave prompt from-finding \
  --evaluation-file eval.json \
  --asset-id my-bucket \
  --controls controls/s3 \
  --trace-file trace.json
```

The prompt includes the trace reasoning chain so an AI assistant can explain *why* the finding exists, not just what it is.
