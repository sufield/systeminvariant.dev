# Offline & Air-Gapped Operation

Stave runtime commands are designed for offline execution against local files.

## Runtime Behavior is Offline[​](#runtime-behavior-is-offline "Direct link to Runtime Behavior is Offline")

The runtime CLI (`stave`) operates on local inputs and does not require cloud credentials or network access.

Typical offline flow:

1. Prepare local observation and control files.
2. Run `stave validate`, `stave apply`, `stave apply --profile aws-s3`, or `stave diagnose`.
3. Consume local JSON/text output.

## Runtime Guarantees[​](#runtime-guarantees "Direct link to Runtime Guarantees")

The `stave` binary:

* **No network access** — contains zero networking code; makes no HTTP requests, DNS lookups, or socket connections.
* **No subprocess execution** — never calls `os/exec` or shells out to external tools.
* **No credential access** — does not read AWS credentials, environment variables for cloud APIs, or key stores.
* **Local files only** — reads observation JSON and control YAML from disk, writes evaluation results to stdout.
* **Embedded schemas** — JSON Schemas are compiled into the binary via `//go:embed`; no download step at runtime.

You can verify this yourself:

```
# Confirm no net or os/exec imports in the runtime binary
go list -deps ./cmd/stave | grep -E '^net$|^net/http$|^os/exec$'
# Expected: no output
```

## What is in Scope for Air-Gapped Use[​](#what-is-in-scope-for-air-gapped-use "Direct link to What is in Scope for Air-Gapped Use")

* Running the released `stave` binary
* Validating observations/controls
* Evaluating findings from local snapshots
* Diagnosing previous output with local inputs
* Logic trace audit trail (`--trace` writes a local JSON file, no network calls)

## What is Not Offline[​](#what-is-not-offline "Direct link to What is Not Offline")

These activities are outside runtime execution and may require network:

* downloading dependencies while building from source
* CI workflows
* release signing and attestation publication
* uploading release artifacts

### Build-Time Network Dependencies[​](#build-time-network-dependencies "Direct link to Build-Time Network Dependencies")

Building Stave from source requires network access for the following:

| Dependency                           | Purpose                        | When              |
| ------------------------------------ | ------------------------------ | ----------------- |
| Go module proxy (`proxy.golang.org`) | Download Go dependencies       | `go mod download` |
| GitHub Actions runners               | CI pipeline execution          | On push/PR        |
| govulncheck DB (`vuln.go.dev`)       | Known-vulnerability scanning   | CI lint step      |
| OpenSSF Scorecard                    | Supply-chain security scoring  | Scheduled CI      |
| Docker Hub / GHCR                    | Base images for demo container | `docker build`    |
| Sigstore (`rekor.sigstore.dev`)      | Keyless release signing        | Release workflow  |
| GitHub Releases API                  | Upload release archives        | Release workflow  |

For fully air-gapped builds, vendor dependencies first on a connected machine:

```
go mod vendor
# Then copy the repository (with vendor/) to the air-gapped host
GOFLAGS=-mod=vendor make build
```

### Test-Time Notes[​](#test-time-notes "Direct link to Test-Time Notes")

* **Unit tests** (`make test`) — fully local, no network required.
* **E2E tests** (`make e2e` / `go test ./e2e/...`) — fully local, but require `jq`, `diff`, and `bash` to be installed.
* No test downloads fixtures or contacts external services.

### Release-Time Notes[​](#release-time-notes "Direct link to Release-Time Notes")

Release signing and attestation require network access:

* **Sigstore cosign** — keyless signing via Fulcio CA and Rekor transparency log
* **SBOM generation** — Syft produces SPDX SBOMs (runs locally, but the release workflow uploads them)
* **Build provenance** — GitHub-native SLSA attestation on release archives
* **Artifact upload** — release archives, checksums, and SBOMs are uploaded to GitHub Releases

## Operational Guidance[​](#operational-guidance "Direct link to Operational Guidance")

* Treat observation and output files as sensitive.
* Use `--sanitize` for shared outputs.
* Prefer deterministic runs in CI with `--eval-time`.

## FAQ[​](#faq "Direct link to FAQ")

### Why do the ACL constants contain `http://` URLs?[​](#why-do-the-acl-constants-contain-http-urls "Direct link to why-do-the-acl-constants-contain-http-urls")

The constants `GroupURIAllUsers` and `GroupURIAuthenticatedUsers` in `internal/platform/providers/aws/s3/acl/facts.go` contain URIs like `http://acs.amazonaws.com/groups/global/AllUsers`. These are **opaque identifiers defined by the AWS S3 ACL specification** — they are string comparisons, not HTTP endpoints. Stave never fetches these URLs.

See: [AWS ACL grantee documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/acl-overview.html#specifying-grantee)

### What are the `urn:stave:schema:...` identifiers?[​](#what-are-the-urnstaveschema-identifiers "Direct link to what-are-the-urnstaveschema-identifiers")

The JSON Schema specification requires `$id` to be a URI. Stave uses URN-scheme identifiers (e.g. `urn:stave:schema:obs.v0.1`) as **in-memory identifiers** for the schema compiler. Schemas are loaded from embedded files (`//go:embed`), never fetched over the network. The URN scheme was chosen specifically to avoid false positives from security scanners looking for HTTP endpoints.

### Does `genrecordings` make network calls?[​](#does-genrecordings-make-network-calls "Direct link to does-genrecordings-make-network-calls")

No. `cmd/genrecordings` is a developer-only build tool (not part of the shipped binary) that uses `os/exec` to run the local `stave` binary and capture terminal recordings. It makes no network connections.

## Related Docs[​](#related-docs "Direct link to Related Docs")

* [Execution Safety](/docs/explanation/execution-safety.md)
* [Data Flow and I/O](/docs/explanation/data-flow.md)
* [Release Security](/docs/explanation/release-security.md)
* [Sanitization and Scrubbing](/docs/how-to/results/sanitization.md)
