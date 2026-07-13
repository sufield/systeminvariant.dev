---
title: "stave capabilities"
sidebar_label: "capabilities"
sidebar_position: 14
description: "Print supported input types and version constraints (default) or a user-facing catalog (subcommand)"
---

# stave capabilities

Print supported input types and version constraints (default) or a user-facing catalog (subcommand)

## Usage

```
stave capabilities
```

## Description

Capabilities exposes two views.

Default (no subcommand) emits a JSON document describing the protocol
metadata: observation schemas, control DSL versions, input source
types, and command capability metadata this version of Stave supports.
This is the stable contract consumers parse.

`stave capabilities catalog` emits the user-facing capability
catalog: grouped detections + compound chains + operational features.
Pair with `stave search` to look up by intent.

Exit Codes:
  0   - Success
  4   - Internal error

Examples:
  # Protocol metadata (default)
  stave capabilities

  # User-facing catalog
  stave capabilities catalog

  # Supported observation schema versions
  stave capabilities | jq '.observation_support.schemas'

  # Supported control (policy) DSL versions
  stave capabilities | jq '.policy_support.schemas'

  # Supported input source types
  stave capabilities | jq '[.data_ingress.connectors[].type]'

  # Supported compliance / security frameworks
  stave capabilities | jq '.compliance_support.security_frameworks'

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands

| Command | Description |
|---|---|
| [`stave capabilities catalog`](stave-capabilities-catalog.md) | Print the user-facing capability catalog |

## Examples

```bash
stave capabilities | jq '.version'
```
