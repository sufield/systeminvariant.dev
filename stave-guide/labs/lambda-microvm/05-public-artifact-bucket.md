---
title: "Lab 5 — Public Artifact Bucket"
sidebar_label: "5 · Public S3 bucket"
sidebar_position: 5
description: "The S3 bucket holding a MicroVM image's source (Dockerfile + code zip) has Block Public Access off and versioning disabled. Two supply-chain controls fire; enable PAB + versioning and re-verify to zero."
---

# Lab 5 — Public Artifact Bucket

A MicroVM image is built from an artifact in S3 — your Dockerfile and code zip. If
that bucket allows public access, **anyone can read your source code**; if
versioning is off, you have no audit trail of which artifact produced which image.
This lab plants both, detects them, and fixes them.

Self-contained: you create one bucket; every other resource defaults to compliant.
Verified against the real `stave` binary.

## Prerequisites

Same shared exports as [Lab 1](01-baseline-compliant-microvm.md). Then:

```bash
mkdir -p lab5-public-s3 && cd lab5-public-s3 && mkdir -p snapshots
export PUB=stave-microvm-lab-public-${AWS_ACCOUNT_ID}
```

## Step 1 — Create a public, unversioned bucket

Set Block Public Access all-**off** (don't *delete* the PAB config —
`get-public-access-block` errors on a bucket with no PAB, corrupting the capture)
and leave versioning disabled:

```bash
aws s3 mb s3://$PUB
aws s3api put-public-access-block --bucket $PUB \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
```

## Step 2 — Capture, transform, evaluate

`get-bucket-versioning` prints **nothing** for an unversioned bucket — a 0-byte
file. That's fine: the transform treats an empty/absent versioning capture as
*not enabled*.

```bash
aws s3api get-public-access-block --bucket $PUB > snapshots/s3-public.json
aws s3api get-bucket-versioning   --bucket $PUB > snapshots/s3-public-versioning.json

PAB=snapshots/s3-public.json VER=snapshots/s3-public-versioning.json \
  BUCKET=$PUB bash "$TRANSFORM" public-s3

"$STAVE" apply -i "$CTRL" -o observations/public-s3 --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):", (.findings[] | "  [\(.control_severity)] \(.control_id) — \(.control_name)")'
```

```text
2 finding(s):
  [critical] CTL.LAMBDA.MICROVM.S3PUBLIC.001 — MicroVM Artifact Bucket Allows Public Access
  [medium] CTL.LAMBDA.MICROVM.S3VERSION.001 — MicroVM Artifact Bucket Versioning Not Enabled
```

`storage.public_access_blocked = false` fires **S3PUBLIC** (critical —
source-code exposure), and `storage.versioning_enabled = false` fires
**S3VERSION** (no deployment audit trail). Both are *derived* from the raw
`s3api` JSON.

## Step 3 — Remediate and re-verify

```bash
aws s3api put-public-access-block --bucket $PUB \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-versioning --bucket $PUB --versioning-configuration Status=Enabled

aws s3api get-public-access-block --bucket $PUB > snapshots/s3-fixed.json
aws s3api get-bucket-versioning   --bucket $PUB > snapshots/s3-fixed-versioning.json
PAB=snapshots/s3-fixed.json VER=snapshots/s3-fixed-versioning.json \
  BUCKET=$PUB bash "$TRANSFORM" public-s3-fixed

"$STAVE" apply -i "$CTRL" -o observations/public-s3-fixed --eval-time "$TS" --format json | jq -r '"\(.findings|length) finding(s):"'
```

```text
0 finding(s):
```

## Step 4 — Cleanup

Versioning is now on, so purge all versions + delete-markers before removing the
bucket (`rb --force` alone fails with `BucketNotEmpty`):

```bash
aws s3api delete-objects --bucket $PUB \
  --delete "$(aws s3api list-object-versions --bucket $PUB --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' --output json)" 2>/dev/null
aws s3api delete-objects --bucket $PUB \
  --delete "$(aws s3api list-object-versions --bucket $PUB --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' --output json)" 2>/dev/null
aws s3 rb s3://$PUB
```

## What you learned

- The MicroVM supply chain (its S3 artifact) is in scope — public access and
  missing versioning are derived directly from `s3api` output.
- An empty AWS response (`get-bucket-versioning` on an unversioned bucket) is a
  meaningful *not-enabled* signal, handled by the transform.

## Next

- [Lab 6 — Excessive idle and runtime](06-excessive-idle-runtime.md)
