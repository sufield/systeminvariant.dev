# stave doctor

Check local environment readiness for Stave workflows

## Usage[​](#usage "Direct link to Usage")

```
stave doctor [flags]
```

## Description[​](#description "Direct link to Description")

Check local environment readiness for Stave workflows.

Doctor runs a quick local readiness check for first-time usage and day-to-day developer workflows. It validates local prerequisites such as required tools, file permissions, and project structure. When something is missing, it reports copy-paste fixes so you can resolve issues without searching documentation.

Inputs: --format, -f Output format: text or json (default: text)

Outputs: stdout Readiness report listing each check with pass/fail status stderr Error messages (if any)

Exit Codes: 0 - All checks passed; environment is ready 3 - One or more required checks failed 130 - Interrupted (SIGINT)

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                   |
| -------------- | ------ | --------------------------------------------- |
| `-f, --format` | string | Output format: text or json (default: `text`) |

## Examples[​](#examples "Direct link to Examples")

```
# Check environment readiness
  stave doctor

  # JSON output for automation
  stave doctor --format json
```
