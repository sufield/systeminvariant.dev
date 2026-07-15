# MCP Server Integration

`stave-mcp` exposes Stave's evaluation engine over the Model Context Protocol (MCP), so AI agents can verify configurations, explain findings, and suggest fixes without shelling out to the CLI.

## Install[​](#install "Direct link to Install")

```
go install github.com/sufield/stave-mcp@latest
```

## Configure your editor[​](#configure-your-editor "Direct link to Configure your editor")

### Claude Code[​](#claude-code "Direct link to Claude Code")

Add to `.mcp.json` in your project root:

```
{
  "mcpServers": {
    "stave": {
      "command": "stave-mcp",
      "args": ["--controls", "./controls"]
    }
  }
}
```

### Cursor[​](#cursor "Direct link to Cursor")

Add to `.cursor/mcp.json`:

```
{
  "mcpServers": {
    "stave": {
      "command": "stave-mcp",
      "args": ["--controls", "./controls"]
    }
  }
}
```

## Available tools[​](#available-tools "Direct link to Available tools")

| Tool                | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `stave.verify`      | Run evaluation against an observation snapshot |
| `stave.explain`     | Explain a specific finding in plain language   |
| `stave.suggest_fix` | Generate a fix plan for a finding              |

## Example interaction[​](#example-interaction "Direct link to Example interaction")

Once configured, your AI agent can call:

```
stave.verify({"observations": "./my-snapshot/"})
```

The response is the same `out.v0.1` assessment JSON that `stave apply` produces, delivered as MCP content blocks.

## Architecture[​](#architecture "Direct link to Architecture")

`stave-mcp` is a thin JSON-RPC 2.0 / stdio server that calls `pkg/stave.Apply()` directly — no subprocess, no CLI parsing overhead. See [Architecture](/docs/explanation/architecture.md) for the full diagram.
