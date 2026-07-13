---
title: "stave attest verify"
sidebar_label: "attest verify"
sidebar_position: 10
description: "Verify an attested snapshot against a public key"
---

# stave attest verify

Verify an attested snapshot against a public key

## Usage

```
stave attest verify [flags]
```

## Description

Verify an attested snapshot's inline attestation against an Ed25519
public key. Confirms that the assets array has not been tampered with
since signing.

Inputs:
  --snapshot PATH   Path to attested snapshot JSON (required)
  --key PATH        Path to Ed25519 public key PEM (required)

Outputs:
  stdout            Verification result message

Exit Codes:
  0   Verification passed
  2   Invalid input
  3   Verification failed

## Flags

| Flag | Type | Description |
|---|---|---|
| `--key` | string | Path to Ed25519 public key PEM (required) |
| `--snapshot` | string | Path to attested snapshot JSON (required) |

## Examples

```bash
stave attest verify --snapshot attested.json --key public.pem
```
