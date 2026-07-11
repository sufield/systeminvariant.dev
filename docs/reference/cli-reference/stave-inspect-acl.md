# stave inspect acl

Analyze S3 ACL grants

## Usage[​](#usage "Direct link to Usage")

```
stave inspect acl [flags]
```

## Description[​](#description "Direct link to Description")

ACL reads a JSON array of S3 ACL grants and evaluates their security posture, identifying public, authenticated, and full-control grants.

Input: JSON array of grant objects from --file or stdin. Output: JSON assessment with permission analysis.

Exit Codes: 0 Success 2 Input error 4 Internal error

Offline-only: reads local files; makes zero network connections; no cloud credentials.

## Flags[​](#flags "Direct link to Flags")

| Flag         | Type   | Description                                   |
| ------------ | ------ | --------------------------------------------- |
| `-f, --file` | string | Path to ACL grants JSON file (default: stdin) |

## Examples[​](#examples "Direct link to Examples")

```
stave inspect acl --file grants.json
  cat grants.json | stave inspect acl
```
