---
title: "stave contract"
sidebar_label: "contract"
sidebar_position: 57
description: "Inspect Stave's per-asset-type input contracts"
---

# stave contract

Inspect Stave's per-asset-type input contracts

## Usage

```
stave contract
```

## Description

Contract commands expose the data an agent needs to produce a valid
observation snapshot for a given asset type: the per-asset JSON Schema,
the property paths the catalog reads, control + chain counts per path,
and the Steampipe ingest mapping when one ships.

Subcommands:
  show     Show contract details for one asset type (or --list for all)


## Subcommands

| Command | Description |
|---|---|
| [`stave contract show`](stave-contract-show.md) | Show the agent-facing contract for an asset type |

