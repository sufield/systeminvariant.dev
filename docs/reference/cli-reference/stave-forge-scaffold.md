# stave forge scaffold

Generate test fixtures from a real snapshot

## Usage[​](#usage "Direct link to Usage")

```
stave forge scaffold [flags]
```

## Description[​](#description "Direct link to Description")

Generate minimal pass and fail fixture files for use with stave forge test. Extracts only properties referenced by the control's predicate.

Exit Codes: 0 Fixtures generated 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                          |
| ------------ | ------ | ---------------------------------------------------- |
| `--control`  | string | path to control YAML file (required)                 |
| `--out-dir`  | string | output directory (default: testdata/\<control\_id>/) |
| `--snapshot` | string | path to snapshot file (required)                     |

## Examples[​](#examples "Direct link to Examples")

```
stave forge scaffold \
    --control controls/ad/CTL.AD.PASS.MINLEN.001.yaml \
    --snapshot snapshots/acme-dc.json
```
