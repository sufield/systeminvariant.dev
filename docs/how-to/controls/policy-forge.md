# How to Scaffold Controls with the Policy Forge

Create a new security control with validated YAML and pass/fail test fixtures in one command.

## Basic usage[​](#basic-usage "Direct link to Basic usage")

```
make gencontrol \
  ID=CTL.IAM.MFA.002 \
  NAME="Service Accounts Must Not Have Console Access" \
  FIELD=properties.identity.console_access.enabled \
  REMEDIATION="Remove console access from service accounts."
```

## With kind discriminator[​](#with-kind-discriminator "Direct link to With kind discriminator")

Most controls need a `kind` check to scope the predicate. Use `--kind`:

```
make gencontrol \
  ID=CTL.IAM.MFA.002 \
  NAME="Service Accounts Must Not Have Console Access" \
  DOMAIN=identity \
  SEVERITY=medium \
  SCOPE_TAGS=aws,iam \
  ASSET_TYPE=aws_iam_user \
  KIND=user \
  FIELD=properties.identity.console_access.enabled \
  OP=eq \
  VALUE=true \
  REMEDIATION="Remove console access from service accounts."
```

This generates `identity.kind == "user" AND console_access.enabled == true`.

## With compliance references[​](#with-compliance-references "Direct link to With compliance references")

```
make gencontrol \
  ID=CTL.S3.NEWCHECK.001 \
  NAME="My Check" \
  FIELD=properties.storage.access.public_read \
  REMEDIATION="Fix it." \
  COMPLIANCE="hipaa=164.312(a),cis_aws_v1.4.0=2.1.5"
```

## After generation[​](#after-generation "Direct link to After generation")

```
# 1. Edit the generated YAML (improve description, remediation)
vim testdata/e2e/e2e-forge-*/controls/*.yaml

# 2. Generate golden expected output
make golden

# 3. Run all E2E tests
make e2e

# 4. Optionally move to built-in controls
cp testdata/e2e/e2e-forge-*-fail/controls/*.yaml controls/s3/mycheck/
make sync-controls && make build && make docs-controls && make readme
```

## What gets validated[​](#what-gets-validated "Direct link to What gets validated")

The forge runs the generated YAML through `UnmarshalControlDefinition` + `Prepare()` before writing. Invalid field paths, unsupported operators, or malformed predicates fail at generation time — not at evaluation time.

## Available flags[​](#available-flags "Direct link to Available flags")

| Flag          | Default         | Description                       |
| ------------- | --------------- | --------------------------------- |
| `ID`          | (required)      | Control ID (`CTL.S3.NEW.001`)     |
| `NAME`        | (required)      | Control name                      |
| `FIELD`       | (required)      | Predicate field path              |
| `REMEDIATION` | (required)      | Remediation action text           |
| `DOMAIN`      | `exposure`      | Domain label                      |
| `SEVERITY`    | `high`          | Severity level                    |
| `SCOPE_TAGS`  | `aws,s3`        | Comma-separated scope tags        |
| `ASSET_TYPE`  | `aws_s3_bucket` | Asset type for fixtures           |
| `KIND`        | (empty)         | Kind discriminator value          |
| `OP`          | `eq`            | Predicate operator                |
| `VALUE`       | `true`          | Unsafe value                      |
| `COMPLIANCE`  | (empty)         | Compliance refs (`key=value,...`) |
| `OUT`         | auto            | Output base directory             |
