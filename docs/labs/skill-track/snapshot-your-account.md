# Snapshot Your Account

Capture a point-in-time configuration snapshot of your AWS account and evaluate it. Stave only ever reads a local snapshot; it never connects to or writes to AWS.

**Time:** \~30 minutes. **Real AWS, read-only.**

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

A read-only AWS profile (e.g. the AWS-managed `SecurityAudit` or `ReadOnlyAccess` policy). Do NOT use admin/write credentials.

```
aws sts get-caller-identity --profile <your-readonly-profile>
```

## Steps[​](#steps "Direct link to Steps")

### 1. Confirm read-only access[​](#1-confirm-read-only-access "Direct link to 1. Confirm read-only access")

Verify the caller's attached policies are read/audit only before proceeding.

### 2. Capture a snapshot[​](#2-capture-a-snapshot "Direct link to 2. Capture a snapshot")

Pull configuration with read-only AWS CLI calls and save the raw JSON:

```
mkdir -p ~/my-snapshot/raw
aws iam list-users --profile <profile> > ~/my-snapshot/raw/list-users.json
aws iam list-attached-user-policies --user-name <user> --profile <profile> \
  > ~/my-snapshot/raw/policies-<user>.json
aws s3api get-bucket-policy --bucket <bucket> --profile <profile> \
  > ~/my-snapshot/raw/bucket-policy-<bucket>.json
```

Adapt the resource list to what you want to evaluate.

### 3. Build observations[​](#3-build-observations "Direct link to 3. Build observations")

Transform the captured config into `obs.v0.1` observation files:

* One or more snapshot files (2+ timestamps for duration-based controls)
* `schema_version: obs.v0.1`, `source: deployed`
* Per-asset `properties` populated with the fields the relevant controls read

Find field names with:

```
./stave search "<your concern>"
find controls -name '<CONTROL_ID>*' -exec grep observation_fields {} \;
```

Validate:

```
jq . ~/my-snapshot/obs/*.json > /dev/null && echo "valid JSON"
```

### 4. Evaluate[​](#4-evaluate "Direct link to 4. Evaluate")

```
./stave apply --observations ~/my-snapshot/obs/ --eval-time $(date -u +%Y-%m-%dT%H:%M:%SZ)
```

### 5. Review findings[​](#5-review-findings "Direct link to 5. Review findings")

Each finding is a property of your environment with evidence and remediation. Triage by severity; the remediation field says what to change.

## Important[​](#important "Direct link to Important")

* Stave evaluates a local snapshot — it never calls AWS. Capture is the only AWS step, and it's read-only.
* A snapshot is point-in-time: findings reflect the captured moment, not live state.
* Deterministic: same snapshot + same `--eval-time` = identical findings.

## Done[​](#done "Direct link to Done")

You've evaluated your real environment. Findings are specific to your infrastructure, each with evidence and remediation guidance.
