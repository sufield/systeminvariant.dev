# stave config

Configuration commands

## Usage[​](#usage "Direct link to Usage")

```
stave config
```

## Description[​](#description "Direct link to Description")

Project configuration commands.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                         | Description                                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [`stave config context`](/docs/reference/cli-reference/stave-config-context.md) | Named project context commands                         |
| [`stave config delete`](/docs/reference/cli-reference/stave-config-delete.md)   | Remove a project config key (reverts to default)       |
| [`stave config env`](/docs/reference/cli-reference/stave-config-env.md)         | Manage environment variables                           |
| [`stave config explain`](/docs/reference/cli-reference/stave-config-explain.md) | Explain resolved config values and sources             |
| [`stave config get`](/docs/reference/cli-reference/stave-config-get.md)         | Get a config value                                     |
| [`stave config set`](/docs/reference/cli-reference/stave-config-set.md)         | Set a project config value in stave.yaml               |
| [`stave config show`](/docs/reference/cli-reference/stave-config-show.md)       | Show effective project configuration and value sources |
