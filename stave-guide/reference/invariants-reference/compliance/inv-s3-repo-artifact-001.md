---
title: "Public Buckets Must Not Expose VCS Artifacts"
sidebar_label: "CTL.S3.REPO.ARTIFACT.001"
sidebar_position: 3
description: "Publicly accessible S3 buckets must not contain .git/ or .svn/ directories."
---

# Public Buckets Must Not Expose VCS Artifacts

**ID:** `CTL.S3.REPO.ARTIFACT.001`
**Category:** Compliance
**Severity:** High

## What This Checks

Buckets that allow public read or public list access must not contain version control artifacts such as `.git/` or `.svn/` directories. This control fires when `public_read` or `public_list` is `true` and `exposed_repo_artifacts` is `true`.

## Why It Matters

Exposed `.git/` directories on public buckets allow full repository reconstruction using tools like `git-dumper`. Attackers can recover the entire commit history, including secrets, API keys, database credentials, and internal source code that were committed at any point. The Mozilla Foundation disclosed a case where a public S3 bucket exposed `.git/` artifacts, enabling recovery of internal tooling and credentials. This is not a theoretical risk -- automated scanners actively probe for `.git/HEAD` on public endpoints.

## What A Violation Looks Like

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```json
{
  "dsl_version": "out.v0.1",
  "summary": {
    "total_findings": 1,
    "unsafe_count": 1,
    "safe_count": 0
  },
  "findings": [
    {
      "control_id": "CTL.S3.REPO.ARTIFACT.001",
      "resource_id": "arn:aws:s3:::acme-static-website",
      "status": "unsafe",
      "severity": "high",
      "message": "Public Buckets Must Not Expose VCS Artifacts: Public bucket exposes version control artifacts (.git/, .svn/) that enable full repository reconstruction.",
      "evidence": {
        "matched_properties": [
          {
            "path": "properties.storage.visibility.public_read",
            "value": true
          },
          {
            "path": "properties.storage.content.exposed_repo_artifacts",
            "value": true
          }
        ]
      },
      "mitigation": {
        "description": "Public bucket exposes version control artifacts (.git/, .svn/) that enable full repository reconstruction and may leak secrets, credentials, or internal code.",
        "action": "Remove .git/, .svn/, and other VCS directories from the bucket. Add a lifecycle rule or deployment script that excludes VCS artifacts from uploads."
      }
    }
  ]
}
```

## Correct Configuration

A safe observation either has no public access, or has no VCS artifacts exposed:

```json
{
  "storage": {
    "visibility": {
      "public_read": false,
      "public_list": false
    },
    "content": {
      "exposed_repo_artifacts": false
    }
  }
}
```

Configure your CI/CD pipeline to strip `.git/`, `.svn/`, and `.hg/` directories before uploading to S3. Use `--exclude '.git/*'` with `aws s3 sync`.

## Related Controls

- [`CTL.S3.PUBLIC.001`](../public-access/inv-s3-public-001.md) -- Checks whether the bucket has public read access at all.
- [`CTL.S3.PUBLIC.PREFIX.001`](../public-access/inv-s3-public-prefix-001.md) -- Restricts public read to approved prefixes only.
