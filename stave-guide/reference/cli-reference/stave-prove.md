---
title: "stave prove"
sidebar_label: "prove"
sidebar_position: 142
description: "Run Z3 SMT queries against a Stave assessment"
---

# stave prove

Run Z3 SMT queries against a Stave assessment

## Usage

```
stave prove [flags]
```

## Description

Prove loads observation snapshots, compiles them into a Z3 SMT model, and
runs a formal verification query. The model covers IAM policies (identity,
resource, KMS key, trust), asset relationships, and control invariants.

Queries:
  compatibility   Can principal X perform action Y on resource Z?
  reachability    Can principal X reach resource Y through any chain of
                  role assumptions and policy grants?
  conflict        Do the loaded policies contradict each other?
  choke-point     What is the minimum set of statements whose removal
                  breaks a reachability path?
  invariant       Is a control's unsafe condition reachable for ANY input?

Inputs:
  --observations, -o  Observation snapshots directory (required)
  --query             Query to run (required)
  --controls, -i      Control definitions directory (default: built-in catalog)
  --principal         Principal ARN (compatibility, reachability, choke-point)
  --action            Action (compatibility)
  --resource          Resource ARN (compatibility, reachability, choke-point)
  --invariant         Control ID (invariant query)
  --format, -f        Output format: json (default), text

Outputs:
  stdout: query result as JSON (or text with --format text)

Exit codes:
  0   Query completed successfully
  2   Input error (bad flags, missing observations)
  4   Internal error (Z3 not available, load failure)
  130 Interrupted (SIGINT)

Requires: binary built with -tags 'cgo z3' and libz3 installed.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--action` | string | action (compatibility) |
| `-i, --controls` | string | control definitions directory (empty = built-in catalog) |
| `-f, --format` | string | output format: json, text (default: `json`) |
| `--invariant` | string | invariant control ID (invariant query) |
| `-o, --observations` | string | path to observations directory (required) |
| `--principal` | string | principal ARN (compatibility, reachability, choke-point) |
| `--query` | string | query to run: compatibility, reachability, conflict, choke-point, invariant (required) |
| `--resource` | string | resource ARN (compatibility, reachability, choke-point) |

## Examples

```bash
# Can this role read from this bucket?
  stave prove -o observations --query compatibility \
    --principal arn:aws:iam::123456789012:role/MyRole \
    --action s3:GetObject \
    --resource arn:aws:s3:::my-bucket

  # Is there any attack path from user to bucket?
  stave prove -o observations --query reachability \
    --principal arn:aws:iam::123456789012:user/attacker \
    --resource arn:aws:s3:::sensitive-data

  # Do any policies contradict each other?
  stave prove -o observations --query conflict

  # Verify a control holds for ALL possible inputs
  stave prove -o observations --query invariant \
    --invariant CTL.S3.PUBLIC.001

  # Find the minimum fix to break an attack path
  stave prove -o observations --query choke-point \
    --principal arn:aws:iam::123456789012:user/attacker \
    --resource arn:aws:s3:::sensitive-data
```
