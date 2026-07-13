---
title: "SARIF and GitHub Code Scanning"
sidebar_label: "SARIF / Code Scanning"
sidebar_position: 4
description: "Upload Stave findings to GitHub code scanning via SARIF output."
---

# SARIF and GitHub Code Scanning

Stave outputs SARIF (Static Analysis Results Interchange Format),
which GitHub code scanning consumes natively. Findings appear in
the Security tab alongside CodeQL and other scanners.

## Generate SARIF

```bash
stave apply --observations ./observations/ --format sarif > findings.sarif
```

## Upload to GitHub code scanning

### GitHub Actions

```yaml
name: Stave Security Scan
on:
  push:
    branches: [main]
  pull_request:
    paths:
      - 'terraform/**'
      - 'observations/**'

jobs:
  stave:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Install Stave
        run: go install github.com/sufield/stave/cmd/stave@latest

      - name: Run evaluation
        run: stave apply --observations ./observations/ --format sarif > findings.sarif

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: findings.sarif
          category: stave
```

### Key points

- The `security-events: write` permission is required for upload
- The `category` field groups Stave findings separately from CodeQL
- SARIF upload works on push events and pull requests
- Findings appear in the repository's Security → Code scanning tab
- PR annotations show inline findings on changed files

## What SARIF includes

Each finding maps to a SARIF `result` with:

- `ruleId` — the control ID (e.g., `CTL.S3.BUCKET.VERSIONING.001`)
- `level` — mapped from Stave severity (`critical`/`high` → `error`, `medium` → `warning`, `low`/`info` → `note`)
- `message` — the finding evidence line
- `locations` — the resource ARN as a logical location

## Filtering

Combine with severity thresholds to control which findings reach
code scanning:

```bash
stave apply --observations ./observations/ \
  --format sarif \
  --severity high > findings.sarif
```

Only `high` and `critical` findings appear in SARIF output.
