---
title: "stave completion"
sidebar_label: "completion"
sidebar_position: 41
description: "Generate shell completion scripts"
---

# stave completion

Generate shell completion scripts

## Usage

```
stave completion [bash|zsh|fish|powershell]
```

## Description

Generate shell completion scripts for stave.

To install completions:

  # Bash (add to ~/.bashrc)
  source <(stave completion bash)

  # Zsh (add to ~/.zshrc)
  source <(stave completion zsh)

  # Fish
  stave completion fish | source

  # PowerShell
  stave completion powershell | Out-String | Invoke-Expression

Exit Codes:
  0   Success
  2   Invalid argument (unsupported shell)

## Examples

```bash
stave completion bash
  stave completion zsh >> ~/.zshrc
  stave completion fish | source
```
