---
title: "stave transform"
sidebar_label: "transform"
sidebar_position: 155
description: "Convert raw AWS CLI snapshots into obs.v0.1 observations (built-in jq)"
---

# stave transform

Convert raw AWS CLI snapshots into obs.v0.1 observations (built-in jq)

## Usage

```
stave transform [flags]
```

## Description

Convert raw AWS CLI output into Stave's obs.v0.1 observation format.

Stave never calls AWS. You collect raw snapshots yourself (AWS CLI, Steampipe,
…); transform reshapes them in-process with embedded jq filters, scrubs
sensitive values (UserData, env var values, secret-keyed tags are hashed; policy
documents, ARNs, names, and actions are left intact), merges data spread across
several API calls into one asset, and validates the result against the obs.v0.1
schema before writing it.

Each raw file is matched to a filter by its top-level JSON key (e.g.
"Roles" -> iam-roles). Files no filter recognizes are skipped, not fatal. Run
with --coverage to list the recognized shapes.

Inputs:  --in, -i   directory of raw AWS CLI JSON files (default: raw)
         --account   AWS account ID for filters whose input carries no ARN
         --eval-time       captured_at timestamp (RFC3339); defaults to now
         --format, -f  summary format: text or json
Outputs: one obs.v0.1 file written to --out (or stdout with --out -); a summary
         on stdout (stderr when --out -).

Exit codes: 0 = success, 2 = input error (missing dir, bad JSON, bad flag),
            4 = internal error (e.g. transform produced an invalid observation),
            130 = interrupted.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--account` | string | AWS account ID for filters whose raw input carries no ARN |
| `--coverage` | bool | list the raw input shapes transform recognizes, then exit |
| `--eval-time` | string | captured_at timestamp (RFC3339); defaults to the current time |
| `-f, --format` | string | summary format: text, json (default: `text`) |
| `-i, --in` | string | directory of raw AWS CLI JSON files (default: `raw`) |
| `--lint` | bool | lint the embedded jq filters (compile + shape checks), then exit |
| `-o, --out` | string | output directory for the observation file (or - for stdout) (default: `observations`) |
| `--scaffold` | string | scaffold a starter filter for NAME (e.g. kms-keys), then exit |

## Examples

```bash
# Convert a directory of raw snapshots into observations/
  stave transform -i raw/ -o observations/

  # Stream one observation document to stdout
  stave transform -i raw/ -o -

  # List the raw input shapes transform recognizes
  stave transform --coverage
```
