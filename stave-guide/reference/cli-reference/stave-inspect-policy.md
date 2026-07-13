---
title: "stave inspect policy"
sidebar_label: "inspect policy"
sidebar_position: 121
description: "Analyze an S3 bucket policy document"
---

# stave inspect policy

Analyze an S3 bucket policy document

## Usage

```
stave inspect policy [flags]
```

## Description

Policy reads a raw S3 bucket policy JSON document and performs a
comprehensive security analysis including access assessment, prefix scope
analysis, risk scoring, and IAM action requirements.

Inputs:
  --file, -f  Path to policy JSON file (default: stdin)

Outputs:
  stdout      JSON report with assessment, prefix_scope, risk, and required_iam_actions

Exit Codes:
  0   - Analysis completed successfully
  2   - Invalid input (malformed JSON, missing required fields)
  4   - Internal error
  130 - Interrupted (SIGINT)



Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --file` | string | Path to policy JSON file (default: stdin) |

## Examples

```bash
stave inspect policy --file policy.json
  cat policy.json | stave inspect policy
  stave inspect policy --file policy.json | jq .risk
```
