---
title: "stave discover"
sidebar_label: "discover"
sidebar_position: 73
description: "Resolve AWS services to the data Stave needs (the collection manifest)"
---

# stave discover

Resolve AWS services to the data Stave needs (the collection manifest)

## Usage

```
stave discover [flags]
```

## Description

Discover what Stave needs from you. Tell it which AWS services you use; it
resolves the packs covering those services and merges their requirements into a
single collection manifest — the exact read-only API calls, observation signals,
and minimum collector IAM permissions to gather.

"Service groups" are not a new concept: a pack is a named group of controls with
a requirements manifest, and a service is just a different lookup key into the
same packs. discover is the by-service axis; "stave pack show <name>" is the
by-name axis. Both produce the same manifest model.

Stave never collects data or calls AWS. discover tells you WHAT to collect; you
collect it with your own tools (AWS CLI, Steampipe, …) and run "stave apply".

Inputs:  --services (required, comma-separated); --format, -f (text|json);
         --controls, -i (catalog to resolve against).
Outputs: the merged collection manifest on stdout.

Exit codes: 0 = success, 2 = input error (no services/bad format), 4 = internal.

## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | control definitions directory (default: built-in catalog) (default: `controls`) |
| `-f, --format` | string | output format: text, json (default: `text`) |
| `--services` | stringSlice | AWS services in use (comma-separated), e.g. iam,s3,ec2,lambda,cloudtrail |

## Examples

```bash
# I use IAM, S3, EC2, Lambda and CloudTrail — what does Stave need?
  stave discover --services iam,s3,ec2,lambda,cloudtrail

  # Machine-readable manifest for CI
  stave discover --services iam,s3 --format json
```
