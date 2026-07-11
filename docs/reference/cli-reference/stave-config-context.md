# stave config context

Named project context commands

## Usage[​](#usage "Direct link to Usage")

```
stave config context
```

## Description[​](#description "Direct link to Description")

Context manages named project pointers. Context only affects default path resolution and never changes evaluation semantics.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                                       | Description                      |
| --------------------------------------------------------------------------------------------- | -------------------------------- |
| [`stave config context create`](/docs/reference/cli-reference/stave-config-context-create.md) | Create or update a named context |
| [`stave config context delete`](/docs/reference/cli-reference/stave-config-context-delete.md) | Delete a context                 |
| [`stave config context list`](/docs/reference/cli-reference/stave-config-context-list.md)     | List available contexts          |
| [`stave config context show`](/docs/reference/cli-reference/stave-config-context-show.md)     | Show selected context            |
| [`stave config context use`](/docs/reference/cli-reference/stave-config-context-use.md)       | Set active context               |
