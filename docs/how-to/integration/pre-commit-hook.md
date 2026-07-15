# How to Block Unsafe Configs with a Pre-Commit Hook

Prevent unsafe cloud configurations from being committed to version control. The hook runs `stave apply` on staged files and blocks the commit if violations are found.

## Option A: Git hook (no dependencies)[​](#option-a-git-hook-no-dependencies "Direct link to Option A: Git hook (no dependencies)")

Copy the hook script into your repo:

```
cp contrib/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

The hook automatically:

* Skips if stave is not installed
* Skips if no observation/control/YAML files are staged
* Runs `stave apply --format text`
* Blocks commit on exit code 3 (violations found)
* Allows commit on exit code 2 (input issues — non-blocking by default)

### Configuration[​](#configuration "Direct link to Configuration")

```
# Use a compliance profile
export STAVE_PRECOMMIT_PROFILE=hipaa

# Strict mode — block on any stave error
export STAVE_PRECOMMIT_STRICT=1

# Skip the hook temporarily
STAVE_PRECOMMIT_SKIP=1 git commit -m "emergency fix"
```

## Option B: pre-commit framework[​](#option-b-pre-commit-framework "Direct link to Option B: pre-commit framework")

Add to your `.pre-commit-config.yaml`:

```
repos:
  - repo: https://github.com/sufield/stave
    rev: v1.0.0  # use the latest release tag
    hooks:
      - id: stave-apply
```

Then install:

```
pre-commit install
```

The hook runs when observation or control files are staged.

## What happens on commit[​](#what-happens-on-commit "Direct link to What happens on commit")

```
$ git add observations/2026-04-11T120000Z.json
$ git commit -m "add new observation"

stave: checking staged configuration files...

[critical] CTL.S3.PUBLIC.001 — No Public S3 Bucket Read
  Asset: production-assets
  Duration: 24h (OVERDUE, max 12h)

Exit code 3 — violations detected

stave: violations detected — commit blocked
  Fix the violations above, then try again.
  To skip: STAVE_PRECOMMIT_SKIP=1 git commit
```

## CI/CD integration[​](#cicd-integration "Direct link to CI/CD integration")

The same hook works in CI pipelines:

```
# GitHub Actions
- name: Check for violations
  run: stave apply --format text
  # Exit code 3 fails the step
```

```
# GitLab CI
stave-check:
  script:
    - stave apply --format text
  allow_failure: false
```

For SARIF integration with GitHub Security:

```
stave apply --format sarif > results.sarif
```

## Notes[​](#notes "Direct link to Notes")

* The hook runs against the working directory, not just staged files. This means it evaluates the full observation + control set.
* For large repos, the hook adds \~1-2 seconds to commit time.
* Use `STAVE_PRECOMMIT_SKIP=1` for emergency commits.
