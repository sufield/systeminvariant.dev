---
title: "MCP Server Integration"
sidebar_label: "MCP Server"
description: "Connect an AI agent (Claude Code, Cursor) to Stave via stave-mcp."
---

# MCP Server Integration

`stave-mcp` exposes Stave's evaluation engine over the Model Context Protocol (MCP), so AI agents can verify configurations, explain findings, and suggest fixes without shelling out to the CLI.

## Install

```bash
go install github.com/sufield/stave-mcp@latest
```

## Configure your editor

### Claude Code

Add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "stave": {
      "command": "stave-mcp",
      "args": ["--controls", "./controls"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stave": {
      "command": "stave-mcp",
      "args": ["--controls", "./controls"]
    }
  }
}
```

## Available tools

| Tool | Purpose |
|------|---------|
| `stave.verify` | Run evaluation against an observation snapshot |
| `stave.explain` | Explain a specific finding in plain language |
| `stave.suggest_fix` | Generate a fix plan for a finding |

## Example interaction

Once configured, your AI agent can call:

```
stave.verify({"observations": "./my-snapshot/"})
```

The response is the same `out.v0.1` assessment JSON that `stave apply` produces, delivered as MCP content blocks.

## Architecture

`stave-mcp` is a thin JSON-RPC 2.0 / stdio server that calls `pkg/stave.Apply()` directly — no subprocess, no CLI parsing overhead. See [Architecture](../../explanation/architecture.md) for the full diagram.
