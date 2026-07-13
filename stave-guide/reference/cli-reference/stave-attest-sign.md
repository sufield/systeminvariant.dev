---
title: "stave attest sign"
sidebar_label: "attest sign"
sidebar_position: 9
description: "Sign a snapshot's assets with an Ed25519 private key"
---

# stave attest sign

Sign a snapshot's assets with an Ed25519 private key

## Usage

```
stave attest sign [flags]
```

## Description

Sign a snapshot's assets array with an Ed25519 private key and
produce an attested snapshot with an inline attestation field.

Inputs:
  --snapshot PATH   Path to observation snapshot JSON (required)
  --key PATH        Path to Ed25519 private key PEM (required)
  --key-id STRING   Key identifier embedded in signature
  --out PATH        Write attested snapshot to file (default: stdout)

Outputs:
  stdout            Attested snapshot JSON (unless --out is set)

Exit Codes:
  0   Signing succeeded
  2   Invalid input

## Flags

| Flag | Type | Description |
|---|---|---|
| `--key` | string | Path to Ed25519 private key PEM (required) |
| `--key-id` | string | Key identifier for the signature |
| `--out` | string | Write attested snapshot to file |
| `--snapshot` | string | Path to snapshot JSON (required) |

## Examples

```bash
stave attest sign --snapshot obs.json --key private.pem
  stave attest sign --snapshot obs.json --key private.pem --out attested.json
```
