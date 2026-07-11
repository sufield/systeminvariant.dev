# stave completion

Generate shell completion scripts

## Usage[​](#usage "Direct link to Usage")

```
stave completion [bash|zsh|fish|powershell]
```

## Description[​](#description "Direct link to Description")

Generate shell completion scripts for stave.

To install completions:

# Bash (add to \~/.bashrc)

source <(stave completion bash)

# Zsh (add to \~/.zshrc)

source <(stave completion zsh)

# Fish

stave completion fish | source

# PowerShell

stave completion powershell | Out-String | Invoke-Expression

Exit Codes: 0 Success 2 Invalid argument (unsupported shell)

## Examples[​](#examples "Direct link to Examples")

```
stave completion bash
  stave completion zsh >> ~/.zshrc
  stave completion fish | source
```
