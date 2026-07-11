# stave controls

Work with control definitions

## Usage[​](#usage "Direct link to Usage")

```
stave controls
```

## Description[​](#description "Direct link to Description")

Controls groups commands for discovering and understanding control definitions used by Stave.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                                         | Description                                                     |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`stave controls alias-explain`](/docs/reference/cli-reference/stave-controls-alias-explain.md) | Show expanded predicate for an alias                            |
| [`stave controls aliases`](/docs/reference/cli-reference/stave-controls-aliases.md)             | List built-in semantic predicate aliases                        |
| [`stave controls explain`](/docs/reference/cli-reference/stave-controls-explain.md)             | Explain a specific control                                      |
| [`stave controls list`](/docs/reference/cli-reference/stave-controls-list.md)                   | List control IDs and names                                      |
| [`stave controls quality`](/docs/reference/cli-reference/stave-controls-quality.md)             | Analyze control catalog metadata completeness and coverage gaps |
| [`stave controls search`](/docs/reference/cli-reference/stave-controls-search.md)               | Search the built-in control catalog                             |

## Examples[​](#examples "Direct link to Examples")

```
stave controls list --controls ./controls
  stave controls explain CTL.S3.PUBLIC.001 --controls ./controls
```
