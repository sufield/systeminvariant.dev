# stave capabilities

Print supported input types and version constraints (default) or a user-facing catalog (subcommand)

## Usage[​](#usage "Direct link to Usage")

```
stave capabilities
```

## Description[​](#description "Direct link to Description")

Capabilities exposes two views.

Default (no subcommand) emits a JSON document describing the protocol metadata: observation schemas, control DSL versions, input source types, and command capability metadata this version of Stave supports. This is the stable contract consumers parse.

`stave capabilities catalog` emits the user-facing capability catalog: grouped detections + compound chains + operational features. Pair with `stave search` to look up by intent.

Exit Codes: 0 - Success 4 - Internal error

Examples:

# Protocol metadata (default)

stave capabilities

# User-facing catalog

stave capabilities catalog

# Supported observation schema versions

stave capabilities | jq '.observation\_support.schemas'

# Supported control (policy) DSL versions

stave capabilities | jq '.policy\_support.schemas'

# Supported input source types

stave capabilities | jq '\[.data\_ingress.connectors\[].type]'

# Supported compliance / security frameworks

stave capabilities | jq '.compliance\_support.security\_frameworks'

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                                     | Description                              |
| ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [`stave capabilities catalog`](/docs/reference/cli-reference/stave-capabilities-catalog.md) | Print the user-facing capability catalog |

## Examples[​](#examples "Direct link to Examples")

```
stave capabilities | jq '.version'
```
