---
title: "Fix Verification"
sidebar_label: "Fix Verification"
sidebar_position: 2
description: "Verify a remediation closed the finding: remediate, re-snapshot, diff, confirmed."
---

# Fix Verification

A finding is potential value. A closed finding is realized value. This
page shows the loop: finding → fix → re-snapshot → `stave diff` →
confirmed closed.

## The loop

### 1. You have a finding

```text
CRITICAL  CTL.S3.BUCKET.VERSIONING.001
          Bucket "prod-data" does not have versioning enabled
```

### 2. Fix it

Enable versioning on the bucket (console, CLI, Terraform — whatever
your change process is).

### 3. Re-capture the snapshot

Run the same collector or export that produced the original snapshot:

```bash
# Example: re-run your snapshot script
./collect.sh > observations/2026-07-11.json
```

### 4. Run `stave diff`

```bash
stave diff --snapshot-before observations/2026-07-10.json \
           --snapshot-after  observations/2026-07-11.json
```

### 5. Read the result

```text
RESOLVED (1):
  CTL.S3.BUCKET.VERSIONING.001 on arn:aws:s3:::prod-data
    versioning.status: "Disabled" → "Enabled"

STILL OPEN (3):
  CTL.S3.BUCKET.LOGGING.001 on arn:aws:s3:::prod-data
  CTL.IAM.KEY.ROTATION.001 on arn:aws:iam::123456789012:user/deploy
  CTL.IAM.KEY.ROTATION.001 on arn:aws:iam::123456789012:user/ci

NEW (0):
  (none)
```

The finding moved from open to resolved. The fix is verified.

## Formal closure with `stave prove`

For findings backed by formal verification, you can produce a
machine-verifiable proof that the fixed configuration no longer
contains the forbidden state:

```bash
stave prove --observations ./observations/ \
            --query invariant \
            --invariant CTL.S3.BUCKET.VERSIONING.001
```

If the result is `UNSAT`, the forbidden state is provably absent from
the current configuration — not just "not found" but mathematically
impossible given the observed settings.

This requires the binary built with Z3 support (`-tags 'cgo z3'`).

## In CI

The same loop runs in CI. After a remediation PR merges:

1. CI captures a fresh snapshot
2. CI runs `stave diff` against the previous snapshot
3. If the target finding appears in RESOLVED: the PR did its job
4. If it appears in STILL OPEN: the fix didn't take

See [Running in CI/CD](../integration/ci-cd-integration.md) for
pipeline configuration.
