# Scope and Limits

Stave is an offline configuration safety evaluator. This page defines what it does, what it does not do, and known limitations.

## In Scope[​](#in-scope "Direct link to In Scope")

* **AWS S3 public exposure** — detecting publicly accessible buckets, ACL misconfigurations, missing controls, encryption gaps, and lifecycle/retention violations.
* **Offline analysis** — all evaluation runs on local configuration snapshots. No cloud API calls, no credentials.
* **Deterministic findings** — same inputs + `--eval-time` flag = byte-identical output.

## Supported Commands[​](#supported-commands "Direct link to Supported Commands")

| Command                  | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `apply`                  | Detect violations against control rules                         |
| `apply --profile aws-s3` | Evaluate S3 observations against the healthcare control profile |
| `validate`               | Verify inputs are well-formed before evaluation                 |
| `diagnose`               | Explain unexpected evaluation results                           |
| `verify`                 | Compare before/after snapshots to confirm a fix                 |
| `capabilities`           | Show supported versions, source types, and packs                |

## Out of Scope[​](#out-of-scope "Direct link to Out of Scope")

| Area                                         | Why                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Non-S3 AWS services                          | MVP scope is S3 only. Engine supports other domains but no controls ship for them. |
| Non-AWS platforms (GCP, Azure)               | No controls or extractors exist for other clouds.                                  |
| Application-specific logic (CMS, e-commerce) | Stave evaluates infrastructure configuration, not application behavior.            |
| Continuous monitoring or agents              | Stave is a CLI tool that runs on demand. No daemon, no polling.                    |
| Runtime scanning or live API queries         | All input is pre-captured snapshots.                                               |
| Credential management                        | Stave never handles credentials. Snapshot export is the user's responsibility.     |

## Known Limitations[​](#known-limitations "Direct link to Known Limitations")

### Snapshot sensitivity[​](#snapshot-sensitivity "Direct link to Snapshot sensitivity")

Terraform plan/state exports and AWS CLI snapshots may contain embedded credentials or sensitive values in rare cases. Stave treats all asset properties as opaque data and does not detect or filter secrets within snapshots. Use `--sanitize` when sharing outputs.

### Duration requires two snapshots[​](#duration-requires-two-snapshots "Direct link to Duration requires two snapshots")

Duration-based controls (`unsafe_duration`) need at least two observation snapshots to calculate unsafe periods. A single snapshot cannot establish duration.

### Threshold comparison is strict[​](#threshold-comparison-is-strict "Direct link to Threshold comparison is strict")

The `unsafe_duration` threshold comparison uses strict greater-than (`>`). An asset that has been unsafe for exactly the `--max-unsafe` duration does not trigger a violation — it must exceed the threshold.

### Missing fields and predicate semantics[​](#missing-fields-and-predicate-semantics "Direct link to Missing fields and predicate semantics")

* Missing fields do **not** match `eq false` — only explicitly set `false` values trigger `eq false`.
* Missing fields **do** match `ne "value"` — absence counts as "not equal."

### Umask on shared systems[​](#umask-on-shared-systems "Direct link to Umask on shared systems")

Output file permissions are `0600` (owner-only), but umask settings may weaken this. On multi-user systems, ensure `umask 077` before running Stave.

### Provenance verification requires network[​](#provenance-verification-requires-network "Direct link to Provenance verification requires network")

SHA-256 checksum and Cosign signature verification work fully offline, but build provenance verification (`gh attestation verify`) requires GitHub connectivity.

### Engine capabilities beyond MVP[​](#engine-capabilities-beyond-mvp "Direct link to Engine capabilities beyond MVP")

The evaluation engine implements features not exercised by S3 controls (additional operators, identity evaluation, recurrence detection). These are retained as candidate code for future domains. See [Evaluation Engine Capabilities](/docs/reference/evaluation-engine-capabilities.md) for the full inventory.
