# Try Stave

## 1. See what it finds[​](#1-see-what-it-finds "Direct link to 1. See what it finds")

No install, no signup, nothing to run. [**See the full demo output →**](/docs/getting-started/demo-output.md) — real `stave apply` output from a misconfigured AI agent environment, with compound attack chains, near-miss chains, and standard findings annotated.

***

## 2. Run in a sandbox[​](#2-run-in-a-sandbox "Direct link to 2. Run in a sandbox")

Docker — nothing installed on your machine:

```
docker run --rm -v "$(pwd)/docs-content/demo/scenarios:/work/scenarios" \
  stave-demo
```

Stop the container and it's gone. See [Docker Scenarios](/docs/labs/docker-scenarios.md) for the full set of curated misconfiguration scenarios.

***

## 3. Install and run against demo data[​](#3-install-and-run-against-demo-data "Direct link to 3. Install and run against demo data")

```
go install github.com/sufield/stave/cmd/stave@latest  # or: brew install sufield/tap/stave (macOS)
stave apply --observations ./examples/demo-fixtures/ --format text
```

Reads local files, writes to stdout. No network calls, no credentials, no access to your AWS account.

***

## 4. Run against your own snapshots[​](#4-run-against-your-own-snapshots "Direct link to 4. Run against your own snapshots")

```
aws s3 sync s3://your-config-bucket/AWSLogs/ ./my-snapshot/
stave apply --observations ./my-snapshot/
```

Stave reads the files you give it. The snapshot is a copy — your account is unaffected.

***

## 5. Add to your pipeline[​](#5-add-to-your-pipeline "Direct link to 5. Add to your pipeline")

```
stave apply --observations ./snapshot/ --format sarif > findings.sarif
# exit 0 = clean, exit 3 = findings above threshold
```

***

**Next:** [First Evaluation](/docs/getting-started/first-evaluation.md) — install the binary and run it against demo data.
