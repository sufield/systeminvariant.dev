# Release Integrity & Trust Model

This document explains how Stave releases are built and what makes them trustworthy: the trust layers, the build pipeline, the supply-chain properties, and the threat model they defend against.

For the **step-by-step verification recipe** (tool install, checksum and Cosign verification, provenance, reproducing the build), see [Verify a Release](/docs/how-to/getting-started/verify-release.md).

***

## What this release covers[​](#what-this-release-covers "Direct link to What this release covers")

The Stave release pipeline produces **only the `stave` Go binary** and its packaging artifacts (Linux packages, Homebrew formula, Docker image). The binary is pure Go (`CGO_ENABLED=0`) and has no native library dependencies — what you download is what runs.

The optional Z3 solver backend is published through a **separate distribution channel** with its own release cadence and supply chain. It is never bundled into the Stave Go binary, the Docker image, or any of the OS packages listed below. Operators that want the Z3 backend install it independently — see [Enable the Z3 Solver](/docs/how-to/controls/enable-z3-solver.md) for the install steps and the [Z3 Solver explainer](/docs/explanation/z3-solver.md) for what each backend does.

This split is intentional:

* The Stave binary release stays small, signature-attested, and free of native-library transitive dependencies.
* Z3 versioning and supply-chain provenance are owned by the upstream `z3-solver` PyPI wheel (or the operator's own containerised solver image), not by the Stave release tag.
* Operators that don't need Z3 don't carry libz3 in their attack surface or audit scope.

The Z3 distribution shapes (PyPI install, container image, vendored mirror) are listed alongside the install steps in the how-to. Each shape has its own checksum / signature provenance owned by its upstream — Stave's release pipeline never re-signs them.

***

## How Releases Are Built[​](#how-releases-are-built "Direct link to How Releases Are Built")

Every tagged release (`v*`) triggers an automated GitHub Actions workflow powered by [GoReleaser](https://goreleaser.com/) that:

1. **Validates the VERSION file** matches the git tag before building.

2. **Cross-compiles** for five targets: `linux/amd64`, `linux/arm64`, `darwin/amd64`, `darwin/arm64`, `windows/amd64`.

3. **Uses deterministic build flags** to ensure reproducibility:

   * `CGO_ENABLED=0` — pure Go, no C dependencies
   * `-trimpath` — removes local filesystem paths from the binary
   * `-buildid=` — removes the build ID for reproducibility
   * `-ldflags "-s -w"` — strips debug symbols and DWARF information

4. **Injects build metadata** at build time via ldflags (version, commit, date, built-by).

5. **Builds Docker images** for linux/amd64 and linux/arm64, published as multi-arch manifests to `ghcr.io/sufield/stave`.

6. **Updates the Homebrew formula** in `sufield/homebrew-tap`.

7. **Builds Linux packages** (deb, rpm, apk).

No matrix build is needed — Go cross-compiles natively from a single runner.

***

## Release Artifacts[​](#release-artifacts "Direct link to Release Artifacts")

Each GitHub Release includes:

| Artifact                                            | Description                                                       |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `stave_<version>_<os>_<arch>.tar.gz`                | Compressed binary for Linux and macOS targets                     |
| `stave_<version>_windows_amd64.zip`                 | Compressed binary for Windows                                     |
| `stave_<version>_<os>_<arch>.deb` / `.rpm` / `.apk` | Linux packages (Debian, RPM, Alpine)                              |
| `SHA256SUMS`                                        | SHA-256 checksums for all archives and packages                   |
| `SHA256SUMS.sigstore.json`                          | Sigstore cosign bundle signing the checksums                      |
| `sbom.spdx.json`                                    | SPDX SBOM for the Stave source and its dependencies               |
| `sbom.spdx.json.sigstore.json`                      | Sigstore cosign bundle signing the SBOM independently             |
| Build provenance attestation                        | GitHub-native SLSA provenance (attached to each release artifact) |

### Installation Methods[​](#installation-methods "Direct link to Installation Methods")

| Method            | Command                                                          |
| ----------------- | ---------------------------------------------------------------- |
| Homebrew          | `brew tap sufield/tap && brew install stave`                     |
| Docker            | `docker pull ghcr.io/sufield/stave:v<version>`                   |
| Debian/Ubuntu     | `sudo dpkg -i stave_<version>_linux_amd64.deb`                   |
| RPM (Fedora/RHEL) | `sudo rpm -i stave_<version>_linux_amd64.rpm`                    |
| Alpine            | `sudo apk add --allow-untrusted stave_<version>_linux_amd64.apk` |
| Binary            | Download archive from GitHub Releases                            |

***

## Reproducible Builds[​](#reproducible-builds "Direct link to Reproducible Builds")

Stave uses deterministic build flags so that anyone with the same Go version can reproduce the release binaries and compare checksums. This is what makes the supply chain auditable end-to-end: the published binary is not a trust root you have to accept blindly — it is reproducible from source.

Because `CGO_ENABLED=0` is set, cross-compilation from any OS produces identical binaries for a given target, so the build host's OS is not part of the trust surface. The Go patch version *is* — different patch versions may produce different binaries even with identical flags.

For the exact commands to reproduce a release locally and compare checksums, see [Verify a Release → Reproduce the build locally](/docs/how-to/getting-started/verify-release.md#reproduce-the-build-locally).

***

## SBOM Trust Chain[​](#sbom-trust-chain "Direct link to SBOM Trust Chain")

The SBOM (`sbom.spdx.json`) has two independent verification paths:

1. **Checksums path**: `SHA256SUMS` contains the checksum for `sbom.spdx.json`, and `SHA256SUMS` is signed by Cosign (`SHA256SUMS.sigstore.json`). Verifying the checksums signature covers the SBOM.
2. **Direct signature**: `sbom.spdx.json.sigstore.json` is a Cosign bundle signing the SBOM directly.

The release workflow also validates SBOM structure with `syft validate` before uploading, ensuring released SBOMs are well-formed SPDX.

Having two independent paths means a single bad link — a tampered checksums file or a corrupted direct-signature bundle — does not silently pass: each path anchors the SBOM to the Sigstore OIDC identity of the release workflow on its own.

***

## Trust Model[​](#trust-model "Direct link to Trust Model")

Verification layers:

* **Checksum** — file integrity
* **Cosign** — signed by Stave CI
* **SBOM** — transparent dependencies
* **Provenance** — built from this repo in GitHub Actions

All must pass for a trusted release.

## Threat Model[​](#threat-model "Direct link to Threat Model")

Stave release verification defends against the following supply-chain risks:

| Threat                                                                  | Remediation                                                                                               |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Artifact tampering in transit** (mirror compromise, MITM, CDN attack) | SHA-256 checksums detect any modification                                                                 |
| **Malicious replacement of release files**                              | Cosign signature ensures artifacts originate from the Stave release workflow identity                     |
| **Compromised or untrusted build host**                                 | GitHub provenance attestation proves binaries were built by the official CI workflow from this repository |
| **Hidden or vulnerable dependencies**                                   | SBOM provides full dependency transparency for audit and scanning                                         |
| **Repository compromise after release**                                 | Signed checksums + provenance bind artifacts to the exact build event and commit                          |
| **Insider or unauthorized release upload**                              | Sigstore OIDC identity ties signing to GitHub Actions permissions and workflow context                    |

A release should be trusted only if:

* Checksum verification passes
* Cosign signature verification passes
* Provenance verification passes

SBOM inspection is recommended for dependency review and compliance auditing.

***

## Supply Chain Security[​](#supply-chain-security "Direct link to Supply Chain Security")

| Property                         | How it's achieved                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Tamper-evident checksums**     | SHA-256 checksums for all archives                                                                       |
| **Signed checksums**             | Sigstore cosign with OIDC-based keyless signing                                                          |
| **Build provenance**             | GitHub-native SLSA attestation                                                                           |
| **Software Bill of Materials**   | SPDX SBOM generated by Syft, independently signed with Cosign, validated before release                  |
| **License compliance**           | Automated `go-licenses` check in CI; forbidden licenses (GPL, AGPL, SSPL, LGPL) fail build               |
| **Dependency monitoring**        | Dependabot for Go modules and GitHub Actions                                                             |
| **Vulnerability scanning**       | govulncheck runs on every PR                                                                             |
| **No network access at runtime** | Stave makes zero network connections (see [Security and Trust](/docs/explanation/trust-and-security.md)) |

***

## CI Quality Gates[​](#ci-quality-gates "Direct link to CI Quality Gates")

Every pull request must pass six checks before merging:

1. **Test** — `go test -v -race ./...`
2. **Lint** — `golangci-lint` v2.8.0 with gosec, errcheck, govet, staticcheck
3. **Vulnerability check** — `govulncheck` against the Go vulnerability database
4. **License compliance** — `go-licenses check` with allowlist (Apache-2.0, MIT, BSD-2-Clause, BSD-3-Clause, ISC). Fails on GPL, AGPL, SSPL, LGPL, or unknown licenses. Run locally: `go-licenses check ./cmd/stave --allowed_licenses=Apache-2.0,MIT,BSD-2-Clause,BSD-3-Clause,ISC`
5. **E2E** — Full end-to-end test suite (`go test ./e2e/...` via `make e2e`)
6. **Release config** — `goreleaser check` validates the release configuration

***

## See also[​](#see-also "Direct link to See also")

* [Verify a Release](/docs/how-to/getting-started/verify-release.md) — step-by-step recipe to verify checksums, Cosign signatures, the SBOM, and build provenance, plus reproducing the build locally.
