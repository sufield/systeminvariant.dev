# stave discover

Resolve AWS services to the data Stave needs (the collection manifest)

## Usage[​](#usage "Direct link to Usage")

```
stave discover [flags]
```

## Description[​](#description "Direct link to Description")

Discover what Stave needs from you. Tell it which AWS services you use; it resolves the packs covering those services and merges their requirements into a single collection manifest — the exact read-only API calls, observation signals, and minimum collector IAM permissions to gather.

"Service groups" are not a new concept: a pack is a named group of controls with a requirements manifest, and a service is just a different lookup key into the same packs. discover is the by-service axis; "stave pack show " is the by-name axis. Both produce the same manifest model.

Stave never collects data or calls AWS. discover tells you WHAT to collect; you collect it with your own tools (AWS CLI, Steampipe, …) and run "stave apply".

Inputs: --services (required, comma-separated); --format, -f (text|json); --controls, -i (catalog to resolve against). Outputs: the merged collection manifest on stdout.

Exit codes: 0 = success, 2 = input error (no services/bad format), 4 = internal.

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type        | Description                                                                     |
| ---------------- | ----------- | ------------------------------------------------------------------------------- |
| `-i, --controls` | string      | control definitions directory (default: built-in catalog) (default: `controls`) |
| `-f, --format`   | string      | output format: text, json (default: `text`)                                     |
| `--services`     | stringSlice | AWS services in use (comma-separated), e.g. iam,s3,ec2,lambda,cloudtrail        |

## Examples[​](#examples "Direct link to Examples")

```
# I use IAM, S3, EC2, Lambda and CloudTrail — what does Stave need?
  stave discover --services iam,s3,ec2,lambda,cloudtrail

  # Machine-readable manifest for CI
  stave discover --services iam,s3 --format json
```
