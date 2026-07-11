# Try Stave

Five levels, each earns enough trust for the next. Start anywhere, but if you're evaluating Stave for the first time, go in order.

## 1. See what it finds[​](#1-see-what-it-finds "Direct link to 1. See what it finds")

No install, no signup, nothing to run. Here's real output from `stave apply` against a CloudGoat snapshot:

```
FINDINGS:

  HIGH  CTL.S3.BUCKET.VERSIONING.001
        Bucket "prod-data" does not have versioning enabled
        evidence: versioning.status = "Disabled"

  CRITICAL  CTL.CLOUDTRAIL.GHOST.DEST.001          ★ STAVE ONLY
        CloudTrail trail "prod-trail" references destination bucket
        "prod-logs-2024" which does not appear in this account snapshot
        evidence: trail.s3_bucket_name has no matching asset
```

The ★ findings are configuration-graph findings — relationships between resources that single-setting scanners cannot see.

***

## 2. Run in a sandbox[​](#2-run-in-a-sandbox "Direct link to 2. Run in a sandbox")

Docker — nothing installed on your machine:

```
docker run --rm -v "$(pwd)/docs-content/demo/scenarios:/work/scenarios" \
  stave-demo
```

You see the same kind of findings from Step 1, live in your terminal. Nothing is installed on your host. Stop the container and it's gone.

See [Docker Scenarios](/docs/labs/docker-scenarios.md) for the full set of curated misconfiguration scenarios.

***

## 3. Install and run against demo data[​](#3-install-and-run-against-demo-data "Direct link to 3. Install and run against demo data")

```
brew install sufield/tap/stave
stave apply --observations ./examples/demo-fixtures/ --format text
```

The binary is on your machine. It evaluates bundled lab fixtures. It reads local files and writes to stdout. No network calls, no credentials, no access to your AWS account.

**Next:** [First Evaluation](/docs/getting-started/first-evaluation.md) walks through this step with explanation of every output field.

***

## 4. Run against your own snapshots[​](#4-run-against-your-own-snapshots "Direct link to 4. Run against your own snapshots")

Already running AWS Config? Your snapshots are in S3:

```
aws s3 sync s3://your-config-bucket/AWSLogs/ ./my-snapshot/
stave apply --observations ./my-snapshot/
```

Stave reads the files you give it. It never touches your AWS account. It has no credentials. The snapshot is a copy — your account is unaffected.

* [Import from AWS Config](/docs/how-to/getting-started/import-config-snapshots.md)
* [Import from Steampipe](/docs/labs/from-steampipe-to-stave.md)

**Next:** [Time to First Finding](/docs/getting-started/first-finding.md) walks through importing and evaluating your own account data.

***

## 5. Add to your pipeline[​](#5-add-to-your-pipeline "Direct link to 5. Add to your pipeline")

```
stave apply --observations ./snapshot/ --format sarif > findings.sarif
# exit 0 = clean, exit 3 = findings above threshold
```

* [GitHub Actions integration](/docs/how-to/integration/ci-cd-integration.md)
* [Scheduled operation](/docs/how-to/integration/scheduled-operation.md)
* [Compliance evidence generation](/docs/labs/compliance-evidence.md)

**Next:** [Add to CI](/docs/getting-started/add-to-ci.md) sets up a gate that blocks merges when findings exceed your threshold.
