# Running in CI/CD

Stave is a standard CLI tool with stable exit codes, making it straightforward to run in any CI/CD pipeline.

This guide covers running the Stave CLI in CI environments. Stave does not have dedicated CI integration features — it runs the same way in CI as it does locally.

## GitHub Actions (Docker)[​](#github-actions-docker "Direct link to GitHub Actions (Docker)")

Build the demo image in CI and use it to run evaluations:

```
name: Stave Safety Check
on:
  pull_request:
    paths:
      - 'terraform/**'
      - 'observations/**'

jobs:
  stave-apply:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Stave image
        run: docker compose -f stave/docker-compose.yaml build demo

      - name: Validate inputs
        run: |
          docker compose -f stave/docker-compose.yaml run --rm -v ${{ github.workspace }}:/work -w /work demo \
            stave validate \
              --controls ./controls \
              --observations ./observations \
              --strict

      - name: Evaluate safety
        run: |
          docker compose -f stave/docker-compose.yaml run --rm -v ${{ github.workspace }}:/work -w /work demo \
            stave apply \
              --controls ./controls \
              --observations ./observations \
              --max-unsafe 7d \
              --format json \
              > evaluation.json

      - name: Upload findings
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: stave-findings
          path: evaluation.json
```

## GitHub Actions (Build from Source)[​](#github-actions-build-from-source "Direct link to GitHub Actions (Build from Source)")

If you need to build from source, cache the binary to avoid rebuilding on every run:

```
name: Stave Safety Check
on:
  pull_request:
    paths:
      - 'terraform/**'
      - 'observations/**'

jobs:
  stave-apply:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version-file: 'go.mod'

      - name: Cache Stave binary
        id: cache-stave
        uses: actions/cache@v4
        with:
          path: /usr/local/bin/stave
          key: stave-${{ hashFiles('.stave-version') }}

      - name: Build Stave
        if: steps.cache-stave.outputs.cache-hit != 'true'
        run: |
          git clone https://github.com/sufield/stave.git /tmp/stave
          cd /tmp/stave && make build
          cp /tmp/stave/stave /usr/local/bin/

      - name: Validate inputs
        run: |
          stave validate \
            --controls ./controls \
            --observations ./observations \
            --strict

      - name: Evaluate safety
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            --format json \
            > evaluation.json

      - name: Upload findings
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: stave-findings
          path: evaluation.json
```

### Exit Code Handling[​](#exit-code-handling "Direct link to Exit Code Handling")

Stave exits with code `3` when violations are found, which GitHub Actions treats as a failure. Use this to gate merges:

```
      - name: Check for violations
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            --quiet
          # Exit 0 = safe, exit 3 = violations (fails the step)
```

To capture violations without failing the build:

```
      - name: Evaluate (non-blocking)
        id: evaluate
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            > evaluation.json || rc=$?
          echo "violations=$(jq '.summary.violations' evaluation.json)" >> "$GITHUB_OUTPUT"
          exit 0  # Don't fail the step

      - name: Comment on PR
        if: steps.evaluate.outputs.violations != '0'
        run: |
          echo "Stave found ${{ steps.evaluate.outputs.violations }} violations"
```

## GitLab CI[​](#gitlab-ci "Direct link to GitLab CI")

Build Stave from source in the CI job:

```
stave-apply:
  stage: test
  image: golang:1.26.4
  before_script:
    - git clone https://github.com/sufield/stave.git /tmp/stave
    - cd /tmp/stave && make build
    - cp /tmp/stave/stave /usr/local/bin/
  script:
    - stave validate --controls ./controls --observations ./observations --strict
    - stave apply --controls ./controls --observations ./observations --max-unsafe 7d
  artifacts:
    when: on_failure
    paths:
      - evaluation.json
  rules:
    - changes:
        - terraform/**/*
        - observations/**/*
```

## Jenkins[​](#jenkins "Direct link to Jenkins")

```
pipeline {
    agent any
    triggers {
        pollSCM('H/15 * * * *')
    }
    stages {
        stage('Install Stave') {
            steps {
                sh '''
                    git clone https://github.com/sufield/stave.git /tmp/stave
                    cd /tmp/stave && make build
                    cp /tmp/stave/stave /usr/local/bin/
                '''
            }
        }
        stage('Validate') {
            steps {
                sh 'stave validate --controls ./controls --observations ./observations --strict'
            }
        }
        stage('Evaluate') {
            steps {
                sh '''
                    stave apply \
                        --controls ./controls \
                        --observations ./observations \
                        --max-unsafe 7d \
                        --format json > evaluation.json
                '''
            }
        }
    }
    post {
        failure {
            archiveArtifacts artifacts: 'evaluation.json', allowEmptyArchive: true
        }
    }
}
```

Exit code 3 (violations found) fails the pipeline stage. To gate merges, run the evaluation stage on PRs and let Jenkins block the merge on failure.

## Deterministic Evaluation[​](#deterministic-evaluation "Direct link to Deterministic Evaluation")

For reproducible CI runs, use `--eval-time` with a fixed timestamp. This ensures the same inputs always produce the same output:

```
      - name: Deterministic evaluation
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            --eval-time 2026-01-15T00:00:00Z \
            > evaluation.json
          diff evaluation.json expected/evaluation.json
```

## Using `--strict` Validation[​](#using---strict-validation "Direct link to using---strict-validation")

In CI, use `--strict` with `validate` to treat warnings as errors. This catches issues like single snapshots (insufficient for duration tracking) or unsorted timestamps:

```
stave validate --controls ./controls --observations ./observations --strict
```

## Quiet Mode for Scripts[​](#quiet-mode-for-scripts "Direct link to Quiet Mode for Scripts")

Use `--quiet` to suppress all output and rely only on exit codes:

```
if stave apply --quiet --controls ./controls --observations ./observations --max-unsafe 7d; then
  echo "All resources safe"
else
  echo "Violations found (exit $?)"
  exit 1
fi
```

## SARIF Output for GitHub Code Scanning[​](#sarif-output-for-github-code-scanning "Direct link to SARIF Output for GitHub Code Scanning")

Stave produces SARIF v2.1.0 output that GitHub Actions automatically renders in the "Security" tab and highlights violations in PR diffs:

```
      - name: Evaluate with SARIF
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            --format sarif \
            > results.sarif || true

      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

This surfaces HIPAA violations directly in the "Files Changed" tab of pull requests — no extra tooling needed.

## Baseline Workflow (Track Violations Over Time)[​](#baseline-workflow-track-violations-over-time "Direct link to Baseline Workflow (Track Violations Over Time)")

Use `stave enforce baseline` to track violations across commits and fail CI only when violations **increase**:

```
      - name: Save baseline (on main)
        if: github.ref == 'refs/heads/main'
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            --format json > evaluation.json
          stave enforce baseline save --in evaluation.json --out baseline.json

      - name: Check against baseline (on PRs)
        if: github.event_name == 'pull_request'
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            --format json > evaluation.json
          stave enforce baseline check \
            --baseline baseline.json \
            --in evaluation.json
          # Fails if new violations introduced
```

## Gate Command (Policy-Based Merge Blocking)[​](#gate-command-policy-based-merge-blocking "Direct link to Gate Command (Policy-Based Merge Blocking)")

The `enforce gate` command applies a policy to evaluation results and returns exit code 3 if the policy is violated:

```
      - name: Gate on policy
        run: |
          stave apply \
            --controls ./controls \
            --observations ./observations \
            --max-unsafe 7d \
            --format json > evaluation.json
          stave enforce gate \
            --in evaluation.json \
            --policy any
          # --policy any: fail on any violation
          # --policy critical: fail only on critical severity
```

## CI Diff (Show Changes in PRs)[​](#ci-diff-show-changes-in-prs "Direct link to CI Diff (Show Changes in PRs)")

Compare the current evaluation against a baseline to show exactly which violations are new and which were resolved:

```
      - name: Diff against baseline
        run: |
          stave ci diff \
            --baseline baseline.json \
            --current evaluation.json \
            --format json
```

Output includes `introduced` (new violations) and `resolved` (fixed since baseline).

## Environment Variables for CI[​](#environment-variables-for-ci "Direct link to Environment Variables for CI")

Configure stave without flags using `STAVE_*` environment variables:

```
env:
  STAVE_MAX_UNSAFE: "7d"
  STAVE_CI_FAILURE_POLICY: "critical"
  STAVE_PROJECT_ROOT: ${{ github.workspace }}
```

Resolution priority: environment variable > project config > user config > default. This allows per-environment overrides without changing the command invocation.

## Security Audit in CI[​](#security-audit-in-ci "Direct link to Security Audit in CI")

Run a full security audit and upload the artifact bundle:

```
      - name: Security audit
        run: |
          stave security-audit \
            --format sarif \
            --fail-on CRITICAL \
            --compliance-framework hipaa
          # Exit 1 if HIGH or CRITICAL findings

      - name: Upload audit bundle
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-audit
          path: security-audit-*/
```

## Parsing Results with jq[​](#parsing-results-with-jq "Direct link to Parsing Results with jq")

```
# Count violations
stave apply --controls ./ctl --observations ./obs --format json | jq '.summary.violations'

# List violated control IDs
stave apply --controls ./ctl --observations ./obs --format json | jq -r '.findings[].control_id' | sort -u

# Extract resource IDs with violations
stave apply --controls ./ctl --observations ./obs --format json | jq -r '.findings[].resource_id'

# Check safety status
stave apply --controls ./ctl --observations ./obs --format json | jq -r '.safety_status'
```
