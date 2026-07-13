---
title: "stave bundle"
sidebar_label: "bundle"
sidebar_position: 12
description: "Generate a sealed evidence bundle for air-gap GRC integration"
---

# stave bundle

Generate a sealed evidence bundle for air-gap GRC integration

## Usage

```
stave bundle [flags]
```

## Description

Bundle runs a full assessment and packages the results into a
portable, cryptographically sealed evidence archive (.stave-bundle).
The bundle contains the assessment, logic trace, pruned resource
snapshots, and a SHA-256 manifest — optionally signed with an Ed25519
private key.

This enables air-gapped environments to produce verifiable compliance
evidence that can be transferred to GRC platforms (Vanta, Drata,
ServiceNow) via data diode or manual transfer.

Inputs:
  --controls, -i     Path to control definitions directory
  --observations, -o Path to observation snapshots directory
  --sign-key         Path to Ed25519 private key PEM for signing
  --output           Output file path (default: evidence-<timestamp>.stave-bundle)
  --include-asff     Include ASFF-formatted findings for Security Hub integration

Outputs:
  .stave-bundle      Tar.gz archive with assessment, trace, snapshots, manifest

Exit Codes:
  0   Bundle created, no violations
  2   Input or configuration error
  3   Bundle created with violations
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `-i, --controls` | string | Path to control definitions directory (default: `controls`) |
| `--include-asff` | bool | Include ASFF-formatted findings |
| `--max-unsafe` | string | Maximum allowed unsafe duration (default: `168h`) |
| `-o, --observations` | string | Path to observation snapshots directory (default: `observations`) |
| `--output` | string | Output file path |
| `--sign-key` | string | Path to Ed25519 private key PEM for signing |

## Subcommands

| Command | Description |
|---|---|
| [`stave bundle audit`](stave-bundle-audit.md) | Assemble a compliance-period evidence package |

## Examples

```bash
stave bundle --controls ./controls --observations ./observations
  stave bundle -i ./controls -o ./observations --sign-key audit-private.pem
  stave bundle -i ./controls -o ./observations --include-asff --output evidence.stave-bundle
```
