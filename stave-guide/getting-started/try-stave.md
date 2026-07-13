---
title: "Try Stave"
sidebar_label: "Try Stave"
sidebar_position: 0
description: "Five ways to try Stave, from zero-install to full pipeline."
---

# Try Stave

## 1. See what it finds

No install, no signup, nothing to run. Real output from
`stave apply` against a CloudGoat snapshot:

```text
FINDINGS:

  HIGH  CTL.S3.BUCKET.VERSIONING.001
        Bucket "prod-data" does not have versioning enabled
        evidence: versioning.status = "Disabled"

  CRITICAL  CTL.CLOUDTRAIL.GHOST.DEST.001          ★ STAVE ONLY
        CloudTrail trail "prod-trail" references destination bucket
        "prod-logs-2024" which does not appear in this account snapshot
        evidence: trail.s3_bucket_name has no matching asset
```

★ findings are configuration-graph findings — relationships between
resources that single-setting scanners cannot see.

---

## 2. Run in a sandbox

Docker — nothing installed on your machine:

```bash
docker run --rm -v "$(pwd)/docs-content/demo/scenarios:/work/scenarios" \
  stave-demo
```

Stop the container and it's gone. See [Docker Scenarios](../labs/docker-scenarios/)
for the full set of curated misconfiguration scenarios.

---

## 3. Install and run against demo data

```bash
go install github.com/sufield/stave/cmd/stave@latest  # or: brew install sufield/tap/stave (macOS)
stave apply --observations ./examples/demo-fixtures/ --format text
```

Reads local files, writes to stdout. No network calls, no credentials,
no access to your AWS account.

---

## 4. Run against your own snapshots

```bash
aws s3 sync s3://your-config-bucket/AWSLogs/ ./my-snapshot/
stave apply --observations ./my-snapshot/
```

Stave reads the files you give it. The snapshot is a copy — your
account is unaffected.

---

## 5. Add to your pipeline

```bash
stave apply --observations ./snapshot/ --format sarif > findings.sarif
# exit 0 = clean, exit 3 = findings above threshold
```

---

**Next:** [First Evaluation](first-evaluation) — install the binary and run it against demo data.
