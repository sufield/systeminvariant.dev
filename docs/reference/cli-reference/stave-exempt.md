# stave exempt

Manage risk acceptances (acknowledgments, exceptions, exemptions)

## Usage[​](#usage "Direct link to Usage")

```
stave exempt
```

## Description[​](#description "Direct link to Description")

CRUD interface for managing formal risk acceptance records.

Subcommands: acknowledge Add a formal risk acceptance except Add an operational suppression exempt Add a scope exclusion list List all active entries remove Mark an acknowledgment as revoked upcoming Show entries approaching expiry validate Validate the acceptance file suggest Suggest exemptions for chronic/oscillating findings

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                                 | Description                                         |
| --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`stave exempt acknowledge`](/docs/reference/cli-reference/stave-exempt-acknowledge.md) | Add a formal risk acceptance                        |
| [`stave exempt asset`](/docs/reference/cli-reference/stave-exempt-asset.md)             | Add a scope exclusion (exemption)                   |
| [`stave exempt except`](/docs/reference/cli-reference/stave-exempt-except.md)           | Add an operational suppression                      |
| [`stave exempt export`](/docs/reference/cli-reference/stave-exempt-export.md)           | Export risk register as OSCAL POA\&M                |
| [`stave exempt history`](/docs/reference/cli-reference/stave-exempt-history.md)         | Show full audit trail including expired entries     |
| [`stave exempt list`](/docs/reference/cli-reference/stave-exempt-list.md)               | List all active risk acceptances                    |
| [`stave exempt remove`](/docs/reference/cli-reference/stave-exempt-remove.md)           | Mark an acknowledgment as revoked                   |
| [`stave exempt suggest`](/docs/reference/cli-reference/stave-exempt-suggest.md)         | Suggest exemptions for chronic/oscillating findings |
| [`stave exempt upcoming`](/docs/reference/cli-reference/stave-exempt-upcoming.md)       | Show acceptances approaching expiry                 |
| [`stave exempt validate`](/docs/reference/cli-reference/stave-exempt-validate.md)       | Validate the acceptance file                        |
