# stave controls alias-explain

Show expanded predicate for an alias

## Usage[​](#usage "Direct link to Usage")

```
stave controls alias-explain <alias>
```

## Description[​](#description "Direct link to Description")

Show the full predicate tree that a semantic alias expands to. Use this to understand what an alias checks before using it in a custom control definition.

Exit Codes: 0 Success 2 Unknown alias name 4 Internal error

## Examples[​](#examples "Direct link to Examples")

```
stave controls alias-explain s3.public_read
  stave controls alias-explain s3.encrypted_kms
```
