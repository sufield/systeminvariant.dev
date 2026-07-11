# stave test

Run embedded control test cases

## Usage[​](#usage "Direct link to Usage")

```
stave test [flags]
```

## Description[​](#description "Direct link to Description")

Run test cases embedded in control YAML files. Each control can define a tests: block with inline test assets and expected verdicts.

The test runner uses the exact same CEL evaluation path as stave apply — same property normalization, same isMissing behavior.

Verdicts: PASS, VIOLATION, INCONCLUSIVE

Inputs: --control PATH Test a single control YAML file --controls PATH Test all controls in a directory (default: controls) --format STRING Output format: table (default) | json | tap --fail-fast Stop on first failure --filter STRING Run only tests matching pattern (e.g. CTL.S3.\*) --verbose Show passing tests (default: failures only)

Exit Codes: 0 All tests passed 2 Invalid input 3 One or more tests failed

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                            |
| ---------------- | ------ | ------------------------------------------------------ |
| `--control`      | string | test a single control YAML file                        |
| `-i, --controls` | string | test all controls in directory                         |
| `--fail-fast`    | bool   | stop on first failure                                  |
| `--filter`       | string | run only controls matching pattern                     |
| `-f, --format`   | string | output format: table \| json \| tap (default: `table`) |
| `--no-pager`     | bool   | never page output, even on a terminal                  |
| `-v, --verbose`  | bool   | show passing tests                                     |

## Examples[​](#examples "Direct link to Examples")

```
# Test all controls
  stave test --controls ./controls

  # Test a single control
  stave test --control controls/s3/access/CTL.S3.PUBLIC.001.yaml

  # TAP output for CI
  stave test --controls ./controls --format tap

  # Filter to S3 controls only
  stave test --controls ./controls --filter "CTL.S3.*"
```
