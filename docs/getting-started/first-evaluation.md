# First Evaluation

Install Stave, then evaluate a bundled demo snapshot. No cloud credentials. No AWS account. No setup beyond the install.

## Install[​](#install "Direct link to Install")

```
brew install sufield/tap/stave
```

Or:

```
go install github.com/sufield/stave/cmd/stave@latest
```

Verify:

```
stave --version
```

## Run against the demo snapshot[​](#run-against-the-demo-snapshot "Direct link to Run against the demo snapshot")

```
stave apply --observations ./examples/demo-ai-security/ --format text
```

The demo evaluates a fixture AWS account with a Bedrock AI agent. Everything runs against local JSON files — no network, no credentials.

Exit code `3` means violations were found. This is expected for the demo snapshot — it contains intentional misconfigurations.

## What you see[​](#what-you-see "Direct link to What you see")

The output shows:

* **Security state**: `NON_COMPLIANT` (the demo has active violations)
* **Findings**: each one names a control, an asset, a severity, and the evidence line that triggered it
* **Chain findings** (marked ★): compound risks where several conditions stack into an exploitable path

```
  CRITICAL  CTL.CLOUDTRAIL.GHOST.DEST.001          ★ STAVE ONLY
        CloudTrail trail "prod-trail" references destination bucket
        "prod-logs-2024" which does not appear in this account snapshot
        evidence: trail.s3_bucket_name has no matching asset
```

Exit codes: `0` = no violations, `3` = violations found, `2` = input error, `4` = internal error.

For the full security state definitions (COMPLIANT / AT\_RISK / NON\_COMPLIANT), see [Output Formats](/docs/reference/output-formats.md).

***

**Next:** [Installation Options](/docs/getting-started/installation.md) — brew, go install, binary download, or build from source.
