---
title: "stave attest keygen"
sidebar_label: "attest keygen"
sidebar_position: 8
description: "Generate a new Ed25519 key pair for snapshot attestation"
---

# stave attest keygen

Generate a new Ed25519 key pair for snapshot attestation

## Usage

```
stave attest keygen [flags]
```

## Description

Generate a new Ed25519 key pair for snapshot attestation and write
the private and public keys to PEM files.

Inputs:
  --out STRING   Output file prefix (default: stave-attest)

Outputs:
  <prefix>.pem   Ed25519 private key (mode 0600)
  <prefix>.pub   Ed25519 public key (mode 0644)

Exit Codes:
  0   Key pair generated
  2   Invalid input
  4   Internal error

## Flags

| Flag | Type | Description |
|---|---|---|
| `--out` | string | Output file prefix (produces <prefix>.pem and <prefix>.pub) (default: `stave-attest`) |

## Examples

```bash
stave attest keygen --out stave-attest
  # produces stave-attest.pem (private) and stave-attest.pub (public)
```
