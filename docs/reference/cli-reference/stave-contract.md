# stave contract

Inspect Stave's per-asset-type input contracts

## Usage[​](#usage "Direct link to Usage")

```
stave contract
```

## Description[​](#description "Direct link to Description")

Contract commands expose the data an agent needs to produce a valid observation snapshot for a given asset type: the per-asset JSON Schema, the property paths the catalog reads, control + chain counts per path, and the Steampipe ingest mapping when one ships.

Subcommands: show Show contract details for one asset type (or --list for all)

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                       | Description                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------ |
| [`stave contract show`](/docs/reference/cli-reference/stave-contract-show.md) | Show the agent-facing contract for an asset type |
