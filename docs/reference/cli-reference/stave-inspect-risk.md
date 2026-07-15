# stave inspect risk

Score risk from policy statement context

## Usage[​](#usage "Direct link to Usage")

```
stave inspect risk [flags]
```

## Description[​](#description "Direct link to Description")

Risk reads a policy statement context and computes the risk score, analyzing action permissions and principal exposure.

Input: JSON statement context from --file or stdin. Output: JSON risk report with score, findings, and permissions.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                   |
| ------------ | ------ | --------------------------------------------- |
| `-f, --file` | string | Path to risk input JSON file (default: stdin) |

## Examples[​](#examples "Direct link to Examples")

```
stave inspect risk --file statement.json
  cat statement.json | stave inspect risk
```
