# stave export ocsf

Export findings as OCSF 1.1 Compliance Finding events

## Usage[​](#usage "Direct link to Usage")

```
stave export ocsf [flags]
```

## Description[​](#description "Direct link to Description")

Convert assessment findings to OCSF 1.1 events (class\_uid: 2003) for SIEM ingestion (Splunk, Sentinel, Elastic, Panther).

Output is NDJSON — one event per line.

Exit Codes: 0 Export complete 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                        |
| -------------- | ------ | ---------------------------------- |
| `--assessment` | string | stave apply JSON output (required) |

## Examples[​](#examples "Direct link to Examples")

```
stave export ocsf --assessment findings.json
```
