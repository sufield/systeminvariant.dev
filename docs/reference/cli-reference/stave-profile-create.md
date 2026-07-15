# stave profile create

Generate a starter profile YAML

## Usage[​](#usage "Direct link to Usage")

```
stave profile create [flags]
```

## Description[​](#description "Direct link to Description")

Generate a starter custom compliance profile YAML file. Edit the generated file to add sections and control requirements.

Exit Codes: 0 Profile created 2 Invalid input

## Flags[​](#flags "Direct link to Flags")

| Flag            | Type   | Description                 |
| --------------- | ------ | --------------------------- |
| `--description` | string | profile description         |
| `--name`        | string | profile name (required)     |
| `--out`         | string | output file path (required) |

## Examples[​](#examples "Direct link to Examples")

```
stave profile create --name "acme-internal" --out profiles/acme.yaml
```
