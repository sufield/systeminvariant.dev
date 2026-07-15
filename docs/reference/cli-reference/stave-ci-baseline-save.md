# stave ci baseline save

Save evaluation findings as baseline

## Usage[​](#usage "Direct link to Usage")

```
stave ci baseline save [flags]
```

## Description[​](#description "Direct link to Description")

Save captures the current evaluation findings as a baseline snapshot. Subsequent runs of 'baseline check' compare new findings against this baseline so CI only fails on newly introduced violations.

Inputs: --in Path to evaluation JSON from 'stave apply --format json' --out Output path for the baseline file (default: output/baseline.json)

Exit Codes: 0 Baseline saved successfully 2 Input error (missing or invalid evaluation file) 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag    | Type   | Description                                                    |
| ------- | ------ | -------------------------------------------------------------- |
| `--in`  | string | Path to evaluation JSON (required)                             |
| `--out` | string | Path to baseline output JSON (default: `output/baseline.json`) |

## Examples[​](#examples "Direct link to Examples")

```
stave ci baseline save --in output/evaluation.json
  stave ci baseline save --in output/evaluation.json --out baselines/2026-03.json
```
