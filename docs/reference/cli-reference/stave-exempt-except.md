# stave exempt except

Add an operational suppression

## Usage[​](#usage "Direct link to Usage")

```
stave exempt except [flags]
```

## Description[​](#description "Direct link to Description")

Add an operational suppression (exception) for a specific control and asset pair.

Exit Codes: 0 Exception added 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                                       |
| -------------- | ------ | ----------------------------------------------------------------- |
| `--asset-id`   | string | asset ARN or ID (required)                                        |
| `--control-id` | string | control ID (required)                                             |
| `--expires`    | string | expiry date YYYY-MM-DD                                            |
| `--file`       | string | path to acceptance file (default: `./stave-acknowledgments.yaml`) |
| `--reason`     | string | reason for exception                                              |

## Examples[​](#examples "Direct link to Examples")

```
stave exempt except --control-id CTL.IAM.MFA.001 --asset-id arn:aws:iam::123:user/svc
```
