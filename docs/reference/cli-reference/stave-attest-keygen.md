# stave attest keygen

Generate a new Ed25519 key pair for snapshot attestation

## Usage[​](#usage "Direct link to Usage")

```
stave attest keygen [flags]
```

## Description[​](#description "Direct link to Description")

Generate a new Ed25519 key pair for snapshot attestation and write the private and public keys to PEM files.

Inputs: --out STRING Output file prefix (default: stave-attest)

Outputs: .pem Ed25519 private key (mode 0600) .pub Ed25519 public key (mode 0644)

Exit Codes: 0 Key pair generated 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag    | Type   | Description                                                           |
| ------- | ------ | --------------------------------------------------------------------- |
| `--out` | string | Output file prefix (produces .pem and .pub) (default: `stave-attest`) |

## Examples[​](#examples "Direct link to Examples")

```
stave attest keygen --out stave-attest
  # produces stave-attest.pem (private) and stave-attest.pub (public)
```
