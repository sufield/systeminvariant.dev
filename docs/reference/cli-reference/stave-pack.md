# stave pack

Concern packs — named control groupings and their data requirements

## Usage[​](#usage "Direct link to Usage")

```
stave pack
```

## Description[​](#description "Direct link to Description")

Inspect concern packs: named, cross-cutting groupings of controls (e.g. "entropy", "quick") plus a requirements manifest describing the exact AWS API calls and observation signals the pack needs.

A pack is distinct from a compliance --profile (which evaluates a snapshot against a framework) and from a filesystem domain (-i path): membership is resolved by control ID, ID-glob pattern, and minimum severity.

Subcommands: list list available packs and their control counts show show a pack's requirements manifest (the data you must collect)

Exit codes: 0 = success, 2 = input error (unknown pack/format), 4 = internal.

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                               | Description                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`stave pack list`](/docs/reference/cli-reference/stave-pack-list.md) | List available concern packs and their control counts                           |
| [`stave pack show`](/docs/reference/cli-reference/stave-pack-show.md) | Show a pack's requirements manifest (AWS calls, signals, collector permissions) |
