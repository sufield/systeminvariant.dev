---
title: "stave sanitize"
sidebar_label: "sanitize"
sidebar_position: 145
description: "Sanitize a snapshot for cross-boundary sharing"
---

# stave sanitize

Sanitize a snapshot for cross-boundary sharing

## Usage

```
stave sanitize [flags]
```

## Description

Replace ARNs, account IDs, and sensitive fields with deterministic
tokens for safe cross-boundary sharing. The sanitized snapshot remains
evaluable by stave apply.

Default sanitization hashes asset IDs and replaces 12-digit account
IDs in property values. Custom rules can be provided via --rules.

Output goes to stdout; redirect to a file as needed.

Inputs:
  --snapshot PATH   Observation snapshot JSON file (required)
  --rules PATH      Custom sanitization rules YAML (optional)

Exit Codes:
  0   Sanitized snapshot written to stdout
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--rules` | string | path to custom sanitization rules YAML |
| `--snapshot` | string | path to observation snapshot JSON (required) |

## Examples

```bash
stave sanitize --snapshot snapshot.json > sanitized.json
  stave sanitize --snapshot snapshot.json --rules rules.yaml > sanitized.json
```
