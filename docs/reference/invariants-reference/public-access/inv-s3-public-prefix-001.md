# Protected Prefixes Must Not Be Publicly Readable

**ID:** `CTL.S3.PUBLIC.PREFIX.001` **Category:** Public Access **Severity:** High **Type:** `prefix_exposure`

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

S3 bucket prefixes marked as protected must not be publicly readable. This control evaluates bucket policies, ACL grants, and public access block settings to determine effective public read access for each protected prefix. It uses the `prefix_exposure` evaluation type with customizable prefix lists.

The control is parameterized with two lists:

* `protected_prefixes` -- prefixes that must not be publicly readable (default: `invoices/`, `secrets/`, `internal/`, `backups/`)
* `allowed_public_prefixes` -- prefixes that are explicitly permitted to be public (default: `images/`, `static/`, `public/`)

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Many S3 buckets legitimately serve some public content (images, static assets) while keeping other prefixes private (invoices, backups, internal documents). A blanket "no public read" control would produce false positives for mixed-use buckets. This control applies granular prefix-level controls, ensuring that sensitive directories remain private even when the bucket itself allows some public access. A single misconfigured policy statement granting `s3:GetObject` on `*` would expose every prefix, including those containing confidential data.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "control_id": "CTL.S3.PUBLIC.PREFIX.001",
  "control_name": "Protected Prefixes Must Not Be Publicly Readable",
  "resource_id": "acme-shared-assets",
  "resource_type": "aws_s3_bucket",
  "resource_vendor": "aws",
  "evidence": {
    "matched_properties": [
      {
        "path": "properties.storage.kind",
        "value": "bucket"
      }
    ]
  },
  "mitigation": {
    "description": "One or more protected S3 prefixes are publicly readable via bucket policy or ACL grants. Objects under these prefixes can be downloaded by anyone on the internet.",
    "action": "1. Review the protected_prefixes and allowed_public_prefixes lists in this control and adjust them to match your bucket layout. 2. Enable S3 Public Access Block to restrict policy and ACL exposure. 3. Remove bucket policy statements granting s3:GetObject to Principal \"*\" for protected prefixes. 4. Remove ACL grants to AllUsers or AuthenticatedUsers."
  }
}
```

## Customizing Prefix Lists[​](#customizing-prefix-lists "Direct link to Customizing Prefix Lists")

Edit the control YAML to match your bucket layout:

```
params:
  protected_prefixes:
    - "invoices/"
    - "secrets/"
    - "internal/"
    - "backups/"
  allowed_public_prefixes:
    - "images/"
    - "static/"
    - "public/"
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

Ensure bucket policies do not grant `s3:GetObject` to `Principal: "*"` for protected prefixes. Use prefix conditions in policy statements to scope public access to only the allowed prefixes:

```
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::my-bucket/public/*",
  "Condition": {}
}
```

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.PUBLIC.001`](/docs/reference/invariants-reference/public-access/inv-s3-public-001.md) -- Broad check for any public read access on the entire bucket.
* [`CTL.S3.PUBLIC.007`](/docs/reference/invariants-reference/public-access/inv-s3-public-007.md) -- Detects public read granted via bucket policy (bucket-wide, not prefix-scoped).
* [`CTL.S3.CONTROLS.001`](/docs/reference/invariants-reference/public-access/inv-s3-controls-001.md) -- Ensures Public Access Block is enabled as defense-in-depth.
* [`CTL.S3.PUBLIC.005`](/docs/reference/invariants-reference/public-access/inv-s3-public-005.md) -- Detects latent public read exposure masked by PAB.
