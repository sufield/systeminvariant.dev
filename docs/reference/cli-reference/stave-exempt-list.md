# stave exempt list

List all active risk acceptances

## Usage[​](#usage "Direct link to Usage")

```
stave exempt list [flags]
```

## Description[​](#description "Direct link to Description")

List all active risk acceptances including acknowledgments, exceptions, and exemptions.

Exit Codes: 0 List produced 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                                                      |
| -------------- | ------ | -------------------------------------------------------------------------------- |
| `--expired`    | bool   | include expired/revoked entries                                                  |
| `--file`       | string | path to acceptance file (default: `./stave-acknowledgments.yaml`)                |
| `-f, --format` | string | output format: table \| json (default: `table`)                                  |
| `--type`       | string | filter by type: acknowledgment \| exception \| exemption \| all (default: `all`) |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt list
  stave exempt list --format json --expired
```
