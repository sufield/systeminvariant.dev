# End-to-End Template Testing

Manual testing runbook for the template system. Run after implementing or modifying template commands.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* Template system implemented (all commands working)

* Five templates embedded in binary

* Lab corpora available:

  * SadCloud: 57 findings, 3 engines, 0 disagreements
  * Bishop Fox IAM Vulnerable: 30 IAM paths
  * CloudGoat: 13 findings, 1 compound chain
  * Pathfinding Labs: labeled multi-hop attack paths

## Test 1: Fixture Verification[​](#test-1-fixture-verification "Direct link to Test 1: Fixture Verification")

**What it tests**: `stave template verify` and semantic finding matching for all five templates.

```
stave template verify critical-findings
stave template verify m-and-a-diligence
stave template verify breach-reconstruction
stave template verify independent-audit
stave template verify bucket-hijacking-assessment
```

**Pass criteria**: All five pass. Every fixture produces exactly the expected findings matched on `control_id` + `resource_id`.

## Test 2: Recommendation Engine[​](#test-2-recommendation-engine "Direct link to Test 2: Recommendation Engine")

**What it tests**: CEL predicate evaluation, priority ranking, fact highlighting.

```
stave recommend --snapshot ./sadcloud-snapshot.json
```

**Verify**:

* `critical-findings` appears (always matches, priority 10)
* Specialized templates appear if their predicates match the SadCloud snapshot
* Priority ordering is correct (specialized templates above critical-findings)
* Each recommendation shows matched facts with actual values
* Templates whose predicates don't match are not listed

## Test 3: Template Initialization (interactive)[​](#test-3-template-initialization-interactive "Direct link to Test 3: Template Initialization (interactive)")

**What it tests**: Parameter prompting with options display and values file generation.

```
stave template init critical-findings
```

**Verify**:

* Prompted for `severity_threshold` showing options `(critical/high/medium/low/info)` with default `high`
* Prompted for `include_chains` with default `true`
* Prompted for `output_format` showing options with default `jsonl`
* `stave-values.yaml` written with correct template name, version, and parameter values
* Accepting all defaults produces a valid values file

## Test 4: Template Initialization (non-interactive)[​](#test-4-template-initialization-non-interactive "Direct link to Test 4: Template Initialization (non-interactive)")

**What it tests**: `--param` flag and parameter validation.

```
# Valid parameters
stave template init critical-findings \
    --param severity_threshold=medium \
    --param include_chains=true \
    --output ./test-values.yaml
```

**Verify**:

* No interactive prompt
* `test-values.yaml` written with specified values

```
# Invalid parameter — must fail
stave template init critical-findings \
    --param severity_threshold=super-critical
```

**Verify**:

* Error message listing valid options
* No values file written

## Test 5: Dynamic Control Selection[​](#test-5-dynamic-control-selection "Direct link to Test 5: Dynamic Control Selection")

**What it tests**: Catalog-driven auto scope resolution.

```
stave template init critical-findings --param severity_threshold=low --output ./auto-test.yaml

# Multi-service snapshot (SadCloud)
stave apply --values ./auto-test.yaml --snapshot ./sadcloud-snapshot.json
```

**Verify**:

* Controls evaluated match the services in the SadCloud snapshot
* No controls for services NOT in the snapshot are evaluated
* Finding count matches the SadCloud validated result at the given severity

```
# Single-service snapshot (Bishop Fox — IAM only)
stave apply --values ./auto-test.yaml --snapshot ./bishopfox-snapshot.json
```

**Verify**:

* Only IAM controls selected
* S3, CloudTrail, etc. controls NOT evaluated
* Finding count matches Bishop Fox validated result (30 paths)

## Test 6: Differential Testing Across Corpora[​](#test-6-differential-testing-across-corpora "Direct link to Test 6: Differential Testing Across Corpora")

**What it tests**: critical-findings template reproduces all validated baselines.

| Corpus           | Expected                       | Validated Against              |
| ---------------- | ------------------------------ | ------------------------------ |
| SadCloud         | 57 findings (at severity=low)  | 3 engines, 0 disagreements     |
| Bishop Fox       | 30 IAM paths                   | 30/30 paths validated          |
| CloudGoat        | 13 findings + 1 compound chain | 5 bugs fixed during validation |
| Pathfinding Labs | Labeled edges                  | Labeled ground truth           |

**Pass criteria**: Zero divergence across all four corpora.

## Test 7: Filtered Findings Display[​](#test-7-filtered-findings-display "Direct link to Test 7: Filtered Findings Display")

**What it tests**: The severity filter reports what it hid.

```
stave template init critical-findings --param severity_threshold=critical --output ./critical-only.yaml
stave apply --values ./critical-only.yaml --snapshot ./sadcloud-snapshot.json
```

**Verify**:

* Output shows count of critical findings
* Output shows count of hidden findings at lower severities
* Output shows how to change the threshold to see all findings
* Sum of displayed + hidden equals the total unfiltered count

## Test 8: Override Mechanism[​](#test-8-override-mechanism "Direct link to Test 8: Override Mechanism")

**What it tests**: Overlay customization without template drift.

```
stave template init critical-findings --output ./override-test.yaml
```

Edit `override-test.yaml`:

```
overrides:
  disable_controls:
    - "CTL.S3.BUCKET.VERSIONING.001"
  additional_controls:
    - "CTL.IAM.OAUTH.WILDCARD.001"
```

```
stave apply --values ./override-test.yaml --snapshot ./sadcloud-snapshot.json
```

**Verify**:

* `CTL.S3.BUCKET.VERSIONING.001` does NOT appear in findings
* `CTL.IAM.OAUTH.WILDCARD.001` IS evaluated
* All other controls behave identically to the un-overridden run

## Test 9: Template Scaffolding and Custom Authoring[​](#test-9-template-scaffolding-and-custom-authoring "Direct link to Test 9: Template Scaffolding and Custom Authoring")

**What it tests**: `stave template new` and the authoring workflow.

```
stave template new test-custom
```

**Verify**:

* Directory created at `./stave-templates/test-custom/`
* `template.yaml` contains valid scaffold with placeholder values
* `fixtures/` directory with empty `snapshot.json` and `expected.jsonl`
* After editing to select IAM controls, `stave template verify test-custom` passes
* `stave recommend` shows `test-custom` alongside built-in templates (resolved from Layer 2)

## Test 10: Resolution Layering[​](#test-10-resolution-layering "Direct link to Test 10: Resolution Layering")

**What it tests**: Four-layer template priority.

```
# Create a local override of critical-findings in Layer 2
mkdir -p ./stave-templates/critical-findings
# Copy and modify the template (change description)

stave recommend --snapshot ./sadcloud-snapshot.json
```

**Verify**:

* Local `critical-findings` (Layer 2) used, not embedded (Layer 4)
* Modified description appears
* Deleting local copy reverts to embedded version
* `--template-dir` (Layer 1) takes highest priority

## Test 11: Fail-Safe for Empty Auto Scope[​](#test-11-fail-safe-for-empty-auto-scope "Direct link to Test 11: Fail-Safe for Empty Auto Scope")

**What it tests**: Error handling when no services in the snapshot match any catalog prefix.

```
stave apply --values ./auto-test.yaml --snapshot ./empty-snapshot.json
```

**Verify**:

* Clear error message listing services found in the snapshot
* Error message lists services the catalog covers
* No silent "0 findings" output

## Test 12: End-to-End Onboarding Simulation[​](#test-12-end-to-end-onboarding-simulation "Direct link to Test 12: End-to-End Onboarding Simulation")

**What it tests**: The complete adopter experience.

```
stave recommend --snapshot ./sadcloud-snapshot.json
stave template init critical-findings
stave template verify critical-findings
stave apply --values ./stave-values.yaml --snapshot ./sadcloud-snapshot.json
```

**Verify**:

* Every step works without consulting documentation beyond command output
* Each command's output tells you what to do next
* Total time from snapshot to findings: under 5 minutes
* Findings are meaningful, correctly scoped, match validated SadCloud baseline

## Summary[​](#summary "Direct link to Summary")

| Test | Component                         | Corpus                | Pass Criteria                                 |
| ---- | --------------------------------- | --------------------- | --------------------------------------------- |
| 1    | Fixture verification              | Embedded fixtures     | All 5 templates pass `verify`                 |
| 2    | Recommendation engine             | SadCloud              | Correct priority, correct facts               |
| 3    | Interactive init                  | —                     | Options displayed, values file valid          |
| 4    | Non-interactive init + validation | —                     | Invalid options rejected at init time         |
| 5    | Dynamic control selection         | SadCloud + Bishop Fox | Controls match services, no extras            |
| 6    | Differential testing              | All 4 corpora         | Zero divergence from validated baselines      |
| 7    | Filtered findings display         | SadCloud              | Hidden count shown, total matches unfiltered  |
| 8    | Override mechanism                | SadCloud              | Disable/add works, no side effects            |
| 9    | Template scaffolding              | Bishop Fox            | Custom template created, verified, discovered |
| 10   | Resolution layering               | SadCloud              | Four-layer priority correct                   |
| 11   | Fail-safe auto scope              | Empty snapshot        | Clear error, no silent zero findings          |
| 12   | Onboarding simulation             | SadCloud              | Zero to findings under 5 minutes              |
