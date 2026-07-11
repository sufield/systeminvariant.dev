# stave inspect

Low-level security analysis primitives

## Usage[​](#usage "Direct link to Usage")

```
stave inspect
```

## Description[​](#description "Direct link to Description")

Inspect provides direct access to Stave's domain analysis engines.

Each subcommand reads JSON from --file or stdin and outputs analysis results as JSON. These are building blocks for custom tooling and debugging.

Subcommands: policy S3 bucket policy analysis acl S3 ACL grant analysis exposure Exposure classification risk Risk scoring compliance Framework crosswalk aliases Predicate alias listing

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                                 | Description                              |
| --------------------------------------------------------------------------------------- | ---------------------------------------- |
| [`stave inspect acl`](/docs/reference/cli-reference/stave-inspect-acl.md)               | Analyze S3 ACL grants                    |
| [`stave inspect aliases`](/docs/reference/cli-reference/stave-inspect-aliases.md)       | List predicate aliases with metadata     |
| [`stave inspect compliance`](/docs/reference/cli-reference/stave-inspect-compliance.md) | Resolve compliance framework crosswalk   |
| [`stave inspect exposure`](/docs/reference/cli-reference/stave-inspect-exposure.md)     | Classify resource exposure vectors       |
| [`stave inspect policy`](/docs/reference/cli-reference/stave-inspect-policy.md)         | Analyze an S3 bucket policy document     |
| [`stave inspect risk`](/docs/reference/cli-reference/stave-inspect-risk.md)             | Score risk from policy statement context |
