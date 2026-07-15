# stave ci

CI/CD policy and baseline commands

## Usage[​](#usage "Direct link to Usage")

```
stave ci
```

## Description[​](#description "Direct link to Description")

Grouped CI/CD commands: baseline, gate, fix-loop, diff, fix.

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                   | Description                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`stave ci baseline`](/docs/reference/cli-reference/stave-ci-baseline.md) | Manage baseline findings for fail-on-new CI workflows |
| [`stave ci diff`](/docs/reference/cli-reference/stave-ci-diff.md)         | Compare two evaluations and report new findings       |
| [`stave ci fix`](/docs/reference/cli-reference/stave-ci-fix.md)           | Show machine-readable fix plan for a finding          |
| [`stave ci fix-loop`](/docs/reference/cli-reference/stave-ci-fix-loop.md) | Run apply-before/apply-after/verify in one command    |
| [`stave ci gate`](/docs/reference/cli-reference/stave-ci-gate.md)         | Enforce CI failure policy modes from config or flags  |
