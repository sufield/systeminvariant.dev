# Atlantis Post-Plan Integration

Evaluate Terraform plans for safety violations before `atlantis apply`. The hook converts plan JSON to obs.v0.1, runs `stave apply`, and posts findings as a PR comment. Violations block the apply step.

## Setup[​](#setup "Direct link to Setup")

### 1. Install stave on the Atlantis server[​](#1-install-stave-on-the-atlantis-server "Direct link to 1. Install stave on the Atlantis server")

```
brew tap sufield/tap && brew install stave
```

Or copy the binary to the server PATH.

### 2. Add the post-plan hook[​](#2-add-the-post-plan-hook "Direct link to 2. Add the post-plan hook")

Copy the hook script to your Atlantis server:

```
cp contrib/atlantis/stave-post-plan.sh /usr/local/bin/stave-post-plan
chmod +x /usr/local/bin/stave-post-plan
```

### 3. Configure atlantis.yaml[​](#3-configure-atlantisyaml "Direct link to 3. Configure atlantis.yaml")

Add a post-plan workflow step in your repo's `atlantis.yaml`:

```
version: 3
projects:
  - dir: .
    workflow: stave-checked

workflows:
  stave-checked:
    plan:
      steps:
        - init
        - plan
    post_plan:
      steps:
        - run: stave-post-plan
```

Or in the server-side config (`repos.yaml`):

```
repos:
  - id: /.*/
    workflow: stave-checked

workflows:
  stave-checked:
    plan:
      steps:
        - init
        - plan
    post_plan:
      steps:
        - run: stave-post-plan
```

## How it works[​](#how-it-works "Direct link to How it works")

1. Atlantis runs `terraform plan` and produces plan JSON
2. The hook converts plan JSON to obs.v0.1 using jq
3. `stave apply` evaluates the observations against controls
4. Findings appear as a PR comment via Atlantis output
5. Exit code 1 blocks `atlantis apply`

## Configuration[​](#configuration "Direct link to Configuration")

| Environment Variable | Default     | Description                                    |
| -------------------- | ----------- | ---------------------------------------------- |
| `STAVE_CONTROLS`     | `controls/` | Path to control definitions                    |
| `STAVE_PROFILE`      | (none)      | Compliance profile (e.g., `hipaa`, `soc2`)     |
| `STAVE_MAX_UNSAFE`   | `0s`        | Max unsafe duration (0s = any violation fails) |

### Using a compliance profile[​](#using-a-compliance-profile "Direct link to Using a compliance profile")

```
workflows:
  hipaa-checked:
    post_plan:
      steps:
        - env:
            name: STAVE_PROFILE
            value: hipaa
        - run: stave-post-plan
```

## PR comment output[​](#pr-comment-output "Direct link to PR comment output")

When violations are detected, the Atlantis PR comment shows:

```
## Stave Security Check

[critical] CTL.S3.PUBLIC.001 — No Public S3 Bucket Read
  Asset: aws_s3_bucket.data
  Duration: 0s

**Violations detected — plan should not be applied.**

Fix the violations above before running `atlantis apply`.
```

When clean:

```
## Stave Security Check

**No violations found.**
```

## Extractors[​](#extractors "Direct link to Extractors")

The built-in hook uses a minimal jq-based extractor that maps `planned_values.root_module.resources[].values` to observation properties. For production use, consider:

* **Steampipe** — query the plan via `steampipe_terraform` plugin
* **CloudQuery** — sync Terraform state to a database
* **Custom extractor** — map specific resource types to obs.v0.1

See [Building an Extractor](/docs/how-to/integration/building-extractors.md) for full options.

## Files[​](#files "Direct link to Files")

| Path                                  | Description           |
| ------------------------------------- | --------------------- |
| `contrib/atlantis/stave-post-plan.sh` | Post-plan hook script |
| `docs/integrations/atlantis.md`       | This documentation    |
