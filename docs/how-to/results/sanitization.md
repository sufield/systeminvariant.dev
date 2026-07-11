# Sanitization

Stave provides output sanitization for safe sharing.

## `--sanitize` (Output Sanitization)[​](#--sanitize-output-sanitization "Direct link to --sanitize-output-sanitization")

`--sanitize` sanitizes infrastructure identifiers in command output.

Use it on commands that emit findings, diagnostics, or coverage graphs:

```
stave apply --controls ./controls --observations ./obs --sanitize
stave apply --controls ./controls --observations ./obs --sanitize --eval-time 2026-01-15T00:00:00Z
stave diagnose --controls ./controls --observations ./obs --sanitize
stave graph coverage --controls ./controls --observations ./obs --sanitize
```

What stays visible:

* control IDs and names
* counts, durations, timestamps
* schema versions and summary totals

What is intentionally *not* sanitized, and why:

* **Timestamps** (evaluation times, snapshot times, `first_unsafe_at`/`last_unsafe_at`): reveal *when* something happened, not *what* infrastructure was involved.
* **Control IDs and names**: these are public rule definitions, not identifying data.
* **Matched property paths** (schema paths like `properties.storage.visibility.public_read`): structural, not identifying.

Sanitization is deterministic: the same input identifier always maps to the same token within a run, so you can correlate findings without revealing the real identifier.

## Input Scrubbing[​](#input-scrubbing "Direct link to Input Scrubbing")

To sanitize observation files before sharing, handle scrubbing in your extractor. Your extractor (any language producing `obs.v0.1` JSON) should strip or replace sensitive identifiers before writing output. See [Building an Extractor](/docs/labs/building-extractors.md) for guidance.

## Recommended Sharing Workflow[​](#recommended-sharing-workflow "Direct link to Recommended Sharing Workflow")

1. Produce sanitized observations using your extractor (strip real bucket names, account IDs, ARNs).
2. Evaluate with sanitization: `stave apply --controls ./controls --observations ./observations --sanitize > evaluation.sanitized.json`
3. Share only sanitized observations and sanitized output.

## Path Rendering[​](#path-rendering "Direct link to Path Rendering")

Use `--path-mode` to control path visibility in errors/logs:

* `--path-mode=base` (default): basename only
* `--path-mode=full`: full absolute paths

For shared artifacts, prefer `--path-mode=base`.

## Related Docs[​](#related-docs "Direct link to Related Docs")

* [Security Policy](/docs/reference/security-policy.md)
* [Offline & Air-Gapped Operation](/docs/explanation/offline-airgapped.md)
