# stave fingerprint explain

Show the policy fingerprint preimage and diagnosis

## Usage[​](#usage "Direct link to Usage")

```
stave fingerprint explain [flags]
```

## Description[​](#description "Direct link to Description")

Print the exact bytes that feed the policy fingerprint SHA256, plus diagnostic flags for each component. Use this to verify that the fingerprint certifies what you expect.

Text mode (default): prints the preimage lines verbatim, then the sha256 fingerprint.

JSON mode: machine-readable with diagnosis flags: eval\_version\_present — is the engine version in the hashed bytes? asset\_types\_hashed — per control, did scope contribute to the hash?

Exit codes: 0 success 2 input error (bad flag, missing controls directory) 4 internal error (control load failure)

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                              |
| ---------------- | ------ | -------------------------------------------------------- |
| `-i, --controls` | string | control definitions directory (empty = built-in catalog) |
| `-f, --format`   | string | output format: text \| json (default: `text`)            |

## Examples[​](#examples "Direct link to Examples")

```
stave fingerprint explain
  stave fingerprint explain --controls ./my-controls --format json
```
