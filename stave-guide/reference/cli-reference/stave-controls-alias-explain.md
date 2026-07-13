---
title: "stave controls alias-explain"
sidebar_label: "controls alias-explain"
sidebar_position: 60
description: "Show expanded predicate for an alias"
---

# stave controls alias-explain

Show expanded predicate for an alias

## Usage

```
stave controls alias-explain <alias>
```

## Description

Show the full predicate tree that a semantic alias expands to.
Use this to understand what an alias checks before using it in
a custom control definition.

Exit Codes:
  0    Success
  2    Unknown alias name
  4    Internal error

## Examples

```bash
stave controls alias-explain s3.public_read
  stave controls alias-explain s3.encrypted_kms
```
