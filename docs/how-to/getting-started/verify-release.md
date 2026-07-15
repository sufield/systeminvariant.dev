# Verify a Release

This guide walks through verifying a downloaded Stave release artifact: checksums, Cosign signatures, SBOM, and build provenance.

Checksum and signature verification run **offline** after downloading artifacts. Build-provenance verification requires GitHub connectivity.

For *why* each layer exists and what it defends against, see the [Release Security](/docs/explanation/release-security.md) trust and supply-chain model.

## Connectivity Requirements[​](#connectivity-requirements "Direct link to Connectivity Requirements")

| Step                                                    | Offline? | Notes                                                |
| ------------------------------------------------------- | -------- | ---------------------------------------------------- |
| Download artifacts                                      | No       | Requires GitHub connectivity                         |
| Verify checksums (`sha256sum -c`)                       | **Yes**  | Local computation only                               |
| Verify Cosign signature (`cosign verify-blob --bundle`) | **Yes**  | Bundle contains certificate chain; no network needed |
| Verify SBOM signature (`cosign verify-blob --bundle`)   | **Yes**  | Bundle contains certificate chain; no network needed |
| Inspect SBOM (`jq`, `syft validate`)                    | **Yes**  | Local file parsing                                   |
| Verify build provenance (`gh attestation verify`)       | No       | Queries GitHub attestation API                       |

After downloading, checksum and Cosign verification work fully offline.

***

## Tool Installation[​](#tool-installation "Direct link to Tool Installation")

### Cosign[​](#cosign "Direct link to Cosign")

```
# macOS
brew install cosign

# Linux (official binary)
COSIGN_VERSION=v2.4.3
curl -fsSLO "https://github.com/sigstore/cosign/releases/download/${COSIGN_VERSION}/cosign-linux-amd64"
chmod +x cosign-linux-amd64
sudo mv cosign-linux-amd64 /usr/local/bin/cosign

# Container-based (no local install)
docker run --rm -v "$(pwd):/work" -w /work ghcr.io/sigstore/cosign:v2.4.3 \
  verify-blob --bundle SHA256SUMS.sigstore.json SHA256SUMS
```

### GitHub CLI[​](#github-cli "Direct link to GitHub CLI")

```
# macOS
brew install gh

# Linux (Debian/Ubuntu)
sudo apt install gh

# Linux (Fedora/RHEL)
sudo dnf install gh

# Linux (binary)
GH_VERSION=2.67.0
curl -fsSLO "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_amd64.tar.gz"
tar xzf gh_${GH_VERSION}_linux_amd64.tar.gz
sudo mv gh_${GH_VERSION}_linux_amd64/bin/gh /usr/local/bin/
```

### Syft (optional, for SBOM validation)[​](#syft-optional-for-sbom-validation "Direct link to Syft (optional, for SBOM validation)")

```
# macOS
brew install syft

# Linux
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
```

***

## Verification[​](#verification "Direct link to Verification")

### 1. Download artifacts[​](#1-download-artifacts "Direct link to 1. Download artifacts")

Download the archive and verification files from the GitHub Release page:

* `stave_<version>_<os>_<arch>.tar.gz`
* `SHA256SUMS`
* `SHA256SUMS.sigstore.json`
* `sbom.spdx.json`
* `sbom.spdx.json.sigstore.json`

Or via CLI:

```
gh release download vX.Y.Z --repo sufield/stave --pattern "*"
```

***

### 2. Verify checksums (offline)[​](#2-verify-checksums-offline "Direct link to 2. Verify checksums (offline)")

```
sha256sum -c SHA256SUMS
```

Expected output:

```
stave_<version>_<os>_<arch>.tar.gz: OK
```

The SBOM is also included in `SHA256SUMS`, so its integrity is verified here too.

***

### 3. Verify Cosign signature (offline)[​](#3-verify-cosign-signature-offline "Direct link to 3. Verify Cosign signature (offline)")

Stave releases are signed using Sigstore keyless signing via GitHub Actions OIDC. The `SHA256SUMS` file is signed (not each tarball individually), so verifying the checksums file covers all archives and the SBOM.

```
cosign verify-blob \
  --bundle SHA256SUMS.sigstore.json \
  --certificate-identity "https://github.com/sufield/stave/.github/workflows/release.yml@refs/tags/vX.Y.Z" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  SHA256SUMS
```

Replace `vX.Y.Z` with the actual release tag.

**What the identity constraints verify:**

* `--certificate-identity` ensures the signature came from the Stave release workflow at the expected tag
* `--certificate-oidc-issuer` ensures the signing identity was issued by GitHub Actions

If verification succeeds, Cosign prints signature details and exits 0.

***

### 4. Verify SBOM signature (offline)[​](#4-verify-sbom-signature-offline "Direct link to 4. Verify SBOM signature (offline)")

The SBOM is independently signed with Cosign keyless signing, in addition to being covered by the checksums signature.

```
cosign verify-blob \
  --bundle sbom.spdx.json.sigstore.json \
  --certificate-identity "https://github.com/sufield/stave/.github/workflows/release.yml@refs/tags/vX.Y.Z" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  sbom.spdx.json
```

Replace `vX.Y.Z` with the actual release tag.

***

### 5. Inspect SBOM (offline)[​](#5-inspect-sbom-offline "Direct link to 5. Inspect SBOM (offline)")

The SBOM lists all Stave source dependencies used in the build.

```
jq . sbom.spdx.json | less
```

Validate SBOM structure:

```
syft validate sbom.spdx.json
```

The release workflow also runs `syft validate` before uploading, so released SBOMs are guaranteed to be well-formed.

***

### 6. Verify build provenance (online)[​](#6-verify-build-provenance-online "Direct link to 6. Verify build provenance (online)")

Each release archive has a GitHub-native build provenance attestation. This step **requires internet connectivity** to query the GitHub attestation API.

```
gh attestation verify stave_<version>_<os>_<arch>.tar.gz \
  --repo sufield/stave
```

This proves the binary was built by the official GitHub Actions release workflow in this repository.

***

### 7. Full verification example[​](#7-full-verification-example "Direct link to 7. Full verification example")

```
VERSION=vX.Y.Z
FILE=stave_${VERSION}_linux_amd64.tar.gz

# Download
gh release download $VERSION --repo sufield/stave --pattern "*"

# Offline: checksum
sha256sum -c SHA256SUMS

# Offline: Cosign signature on checksums
cosign verify-blob \
  --bundle SHA256SUMS.sigstore.json \
  --certificate-identity "https://github.com/sufield/stave/.github/workflows/release.yml@refs/tags/${VERSION}" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  SHA256SUMS

# Offline: Cosign signature on SBOM
cosign verify-blob \
  --bundle sbom.spdx.json.sigstore.json \
  --certificate-identity "https://github.com/sufield/stave/.github/workflows/release.yml@refs/tags/${VERSION}" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  sbom.spdx.json

# Online: provenance
gh attestation verify $FILE --repo sufield/stave
```

If all commands succeed, the release is authentic and untampered.

***

## Verifying the SBOM via both trust paths[​](#verifying-the-sbom-via-both-trust-paths "Direct link to Verifying the SBOM via both trust paths")

The SBOM (`sbom.spdx.json`) has two independent verification paths:

1. **Checksums path**: `SHA256SUMS` contains the checksum for `sbom.spdx.json`, and `SHA256SUMS` is signed by Cosign (`SHA256SUMS.sigstore.json`). Verifying the checksums signature covers the SBOM.
2. **Direct signature**: `sbom.spdx.json.sigstore.json` is a Cosign bundle signing the SBOM directly.

To verify SBOM integrity via both paths:

```
# Path 1: Via signed checksums
cosign verify-blob \
  --bundle SHA256SUMS.sigstore.json \
  --certificate-identity "https://github.com/sufield/stave/.github/workflows/release.yml@refs/tags/vX.Y.Z" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  SHA256SUMS
sha256sum -c SHA256SUMS --ignore-missing 2>/dev/null | grep sbom

# Path 2: Direct SBOM signature
cosign verify-blob \
  --bundle sbom.spdx.json.sigstore.json \
  --certificate-identity "https://github.com/sufield/stave/.github/workflows/release.yml@refs/tags/vX.Y.Z" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  sbom.spdx.json
```

Expected output for path 1: `sbom.spdx.json: OK`

***

## If Verification Fails[​](#if-verification-fails "Direct link to If Verification Fails")

If any verification step fails:

1. **Do not run the binary.** Delete the downloaded artifacts.

2. **Re-download** from the official [GitHub Releases page](https://github.com/sufield/stave/releases) and try again. Corrupt downloads are the most common cause of checksum failures.

3. **Verify the release tag** matches the version you expect. Check that the release exists at `https://github.com/sufield/stave/releases/tag/vX.Y.Z`.

4. **Check tool versions.** Ensure `cosign` and `gh` are up to date. Older versions may not support current Sigstore bundle formats.

5. **Open a GitHub issue** at [github.com/sufield/stave/issues](https://github.com/sufield/stave/issues) if the failure persists. Include:

   * Which verification step failed
   * The exact error message
   * Your OS and architecture
   * The release version you downloaded
   * Output of `cosign version` and `gh version`

***

## Reproduce the build locally[​](#reproduce-the-build-locally "Direct link to Reproduce the build locally")

Stave uses deterministic build flags so that anyone with the same Go version can reproduce the release binaries and compare checksums.

### Requirements[​](#requirements "Direct link to Requirements")

* **Go version**: Must match the release workflow exactly (see `go-version` in `.github/workflows/release.yml`)
* **Build flags**: `CGO_ENABLED=0 -trimpath -buildid= -ldflags "-s -w"`
* **Version injection**: `-X github.com/sufield/stave/internal/version.String=v<VERSION>`

### Reproduce[​](#reproduce "Direct link to Reproduce")

```
# Clone the release tag
git clone --branch vX.Y.Z https://github.com/sufield/stave.git
cd stave

# Build all targets with the same flags as CI
make reproduce-release

# Compare binary checksums with the release
# Download release binaries and compute their checksums:
gh release download vX.Y.Z --repo sufield/stave --pattern "*.tar.gz" --pattern "*.zip"
for f in *.tar.gz; do tar xzf "$f"; done
for f in *.zip; do unzip -o "$f"; done
sha256sum stave_*
```

### Limitations[​](#limitations "Direct link to Limitations")

* **Archive metadata differs**: `tar.gz` and `.zip` archives include timestamps and filesystem metadata that vary between builds. Compare the raw binary checksums, not the archive checksums.
* **Go version must match exactly**: Different Go patch versions may produce different binaries even with the same flags.
* **OS does not matter**: Because `CGO_ENABLED=0` is set, cross-compilation from any OS produces identical binaries for a given target.

***

## See also[​](#see-also "Direct link to See also")

* [Release Security](/docs/explanation/release-security.md) — the trust, build, and supply-chain model behind these verification steps.
