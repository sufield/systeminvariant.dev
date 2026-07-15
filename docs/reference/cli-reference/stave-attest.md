# stave attest

Snapshot tamper detection via Ed25519 signatures

## Usage[​](#usage "Direct link to Usage")

```
stave attest
```

## Description[​](#description "Direct link to Description")

Sign, verify, and manage keys for snapshot attestation.

Subcommands: sign Sign a snapshot's assets with an Ed25519 private key verify Verify an attested snapshot against a public key keygen Generate a new Ed25519 key pair

Exit Codes: 0 Operation succeeded 2 Invalid input 3 Verification failed

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                       | Description                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`stave attest keygen`](/docs/reference/cli-reference/stave-attest-keygen.md) | Generate a new Ed25519 key pair for snapshot attestation |
| [`stave attest sign`](/docs/reference/cli-reference/stave-attest-sign.md)     | Sign a snapshot's assets with an Ed25519 private key     |
| [`stave attest verify`](/docs/reference/cli-reference/stave-attest-verify.md) | Verify an attested snapshot against a public key         |
