---
title: "stave forge new"
sidebar_label: "forge new"
sidebar_position: 105
description: "Interactive control authoring wizard"
---

# stave forge new

Interactive control authoring wizard

## Usage

```
stave forge new [flags]
```

## Description

Create a new custom security control interactively. The wizard prompts
for control metadata, lets you browse property paths from a real snapshot,
and shows live CEL evaluation before writing files.

Use --non-interactive to accept all inputs from flags (equivalent to make gencontrol).

Exit Codes:
  0   Control generated successfully
  2   Invalid input or missing required flags
  4   Internal error

Examples:
  stave forge new --snapshot obs.json

  stave forge new --non-interactive \
    --id CTL.S3.TAGS.001 \
    --name "S3 buckets must have team tag" \
    --field properties.storage.tags.team \
    --op missing \
    --severity high \
    --remediation "Add a team tag"

## Flags

| Flag | Type | Description |
|---|---|---|
| `--asset-type` | string | asset type for fixtures (default: `aws_s3_bucket`) |
| `--compliance` | string | compliance refs (key=value,...) |
| `--domain` | string | domain: exposure \| identity \| governance (default: `exposure`) |
| `--field` | string | predicate field path |
| `--id` | string | control ID (e.g. CTL.S3.TAGS.001) |
| `--kind` | string | asset kind filter |
| `--name` | string | control name |
| `--non-interactive` | bool | accept all inputs from flags, skip wizard |
| `--op` | string | predicate operator (default: `eq`) |
| `--out` | string | output base directory (default: `testdata/e2e`) |
| `--remediation` | string | remediation action text |
| `--scope-tags` | string | comma-separated scope tags (default: `aws`) |
| `--severity` | string | severity: critical \| high \| medium \| low (default: `high`) |
| `--snapshot` | string | snapshot for path discovery and live preview |
| `--value` | string | unsafe value (default: `true`) |

## Examples

```bash
stave forge new --snapshot obs.json
  stave forge new --non-interactive --id CTL.S3.TAGS.001 --name "..." --field ... --remediation "..."
```
