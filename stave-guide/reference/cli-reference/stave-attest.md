---
title: "stave attest"
sidebar_label: "attest"
sidebar_position: 7
description: "Snapshot tamper detection via Ed25519 signatures"
---

# stave attest

Snapshot tamper detection via Ed25519 signatures

## Usage

```
stave attest
```

## Description

Sign, verify, and manage keys for snapshot attestation.

Subcommands:
  sign     Sign a snapshot's assets with an Ed25519 private key
  verify   Verify an attested snapshot against a public key
  keygen   Generate a new Ed25519 key pair

Exit Codes:
  0   Operation succeeded
  2   Invalid input
  3   Verification failed

## Subcommands

| Command | Description |
|---|---|
| [`stave attest keygen`](stave-attest-keygen.md) | Generate a new Ed25519 key pair for snapshot attestation |
| [`stave attest sign`](stave-attest-sign.md) | Sign a snapshot's assets with an Ed25519 private key |
| [`stave attest verify`](stave-attest-verify.md) | Verify an attested snapshot against a public key |

