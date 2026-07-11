# stave help

```
Help provides help for any command in the application.
Simply type stave help [path to command] for full details.

Usage:
  stave help [command] [flags]

Flags:
  -h, --help   help for help

Global Flags:
      --allow-symlink-output   Allow writing output through symlinks (default: refuse)
      --force                  Allow overwriting existing output files
      --log-file string        Write logs to file (default: stderr)
      --log-format string      Log format: text|json (default "text")
      --log-level string       Log level: debug|info|warn|error (overrides -v)
      --log-timestamps         Include timestamps in logs (breaks determinism)
      --log-timings            Include timing information (breaks determinism)
      --no-color               Disable ANSI colors in output
      --path-mode string       Path rendering in errors/logs: base (basename only) or full (absolute paths) Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in.
      --quiet                  Suppress output (exit code only) Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in.
      --require-offline        Assert offline operation: fail if proxy env vars (HTTP_PROXY, HTTPS_PROXY, ALL_PROXY) are set
      --sanitize               Sanitize infrastructure identifiers (bucket names, ARNs, policies) from output Resolved default may come from STAVE_* env vars, stave.yaml, user config, or built-in.
      --show-dev               In --help, list only development-only commands (default: hide them from the listing)
      --strict                 Enable strict integrity checks for embedded registries and references
  -v, --verbose count          Increase verbosity (-v=INFO, -vv=DEBUG)
  -y, --yes                    Auto-confirm all interactive prompts (distinct from --force which controls file overwriting)
```
