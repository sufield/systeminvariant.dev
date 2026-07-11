# stave enforce

Generate deterministic enforcement templates from evaluation output

## Usage[​](#usage "Direct link to Usage")

```
stave enforce [flags]
```

## Description[​](#description "Direct link to Description")

Enforce reads evaluation JSON and generates deterministic remediation templates.

Supported Modes: pab - Generates AWS Public Access Block Terraform (.tf) scp - Generates AWS Service Control Policy JSON (.json)

Exit Codes: 0 - Success 2 - Input error 4 - Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag        | Type   | Description                                                  |
| ----------- | ------ | ------------------------------------------------------------ |
| `--dry-run` | bool   | Preview planned paths without writing files                  |
| `-i, --in`  | string | Path to evaluation JSON input (required)                     |
| `--mode`    | string | Enforcement mode: pab\|scp (default: `pab`)                  |
| `--out`     | string | Output directory for generated templates (default: `output`) |

## Examples[​](#examples "Direct link to Examples")

```
stave enforce --input evaluation.json --mode terraform
```
