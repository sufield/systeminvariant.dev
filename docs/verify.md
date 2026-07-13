---
title: Verify Command Interpretation
sidebar_position: 99
---

# `stave verify`: How To Interpret Output

`stave verify` compares violations between two observation sets:

- `--before`: state before remediation
- `--after`: state after remediation

It runs the same invariants against both and then compares findings by:

- `invariant_id`
- `resource_id`

## What Was Verified

You verified whether a remediation actually changed violation outcomes.

This is not just “did command run”; it is “did violations disappear, remain, or regress after change”.

## Quick Result Read

Look at:

- `summary.before_violations`
- `summary.after_violations`
- `summary.resolved`
- `summary.remaining`
- `summary.introduced`

Interpretation:

- `resolved`: existed before, gone after (fix worked)
- `remaining`: existed before and still exists after (fix incomplete)
- `introduced`: new after change (regression)

## Exit Code Meaning

- `0`: verification passed (no `remaining`, no `introduced`)
- `3`: verification failed (`remaining` and/or `introduced` present)

## Minimal Commands To Interpret A Large JSON

```bash
stave verify --before ./obs-before --after ./obs-after --invariants ./inv --eval-time 2026-01-11T00:00:00Z > verify.json || true
jq '.summary' verify.json
jq '.remaining[]? | {invariant_id, resource_id}' verify.json
jq '.introduced[]? | {invariant_id, resource_id}' verify.json
jq '.resolved[]? | {invariant_id, resource_id}' verify.json
```

## Practical Outcome Patterns

- **Good remediation**: `after_violations` down, `introduced=0`
- **No effective change**: high `remaining`, low `resolved`
- **Risky fix**: `introduced>0` even if some resolved

## Related Docs

- Command interpretation index: [`command-interpretation.md`](/docs/command-interpretation)
- CLI reference: `stave verify` (`/docs/cli-reference/stave-verify`)
- Workflow context: `stave plan` -> `stave apply` -> `stave diagnose` -> `stave verify`
