---
title: "stave version"
sidebar_label: "version"
sidebar_position: 162
description: "Print version and environment state"
---

# stave version

Print version and environment state

## Usage

```
stave version [flags]
```

## Description

Version prints binary version and, with --verbose, schema and lockfile status.
With --verify, prints integrity hashes for the binary, embedded policy library,
and Go module dependencies. Auditors compare these against known-good values.
With --sbom, outputs a CycloneDX JSON Software Bill of Materials.
With --check-update, performs an explicit network call to GitHub to report
whether a newer release is available. This is the only flag on this command
that touches the network; the default flow is air-gapped.

Exit Codes:
  0   - Success
  4   - Internal error

Examples:
  stave version
  stave version --details
  stave version --verify
  stave version --sbom > stave-sbom.json
  stave version --check-update                # opt-in network check
  STAVE_NO_NETWORK=1 stave version --check-update  # short-circuits cleanly

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags

| Flag | Type | Description |
|---|---|---|
| `--check-update` | bool | Check GitHub for a newer release (opt-in network call) |
| `--details` | bool | Include schema and lockfile status |
| `--sbom` | bool | Output CycloneDX JSON Software Bill of Materials |
| `--verify` | bool | Print binary and policy library integrity hashes |

## Examples

```bash
stave version --verify
```
