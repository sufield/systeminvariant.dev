---
title: "OWASP NHI Top 10"
sidebar_label: "OWASP NHI Top 10"
---

# OWASP Non-Human Identity Top 10 — Stave coverage

The [OWASP Non-Human Identity (NHI) Top 10](https://owasp.org/www-project-non-human-identities-top-10/)
catalogues the most common failure modes for service
accounts, machine identities, API keys, and
infrastructure resources that act on behalf of
applications rather than humans. This page maps Stave
controls to NHI categories.

## NHI1 — Improper Offboarding

**Category:** Resources, identities, and credentials
that outlive their purpose. The most common form: a
staging or demo resource created for a single sprint,
deployed once, never decommissioned. The asset
accumulates configuration drift (TLS certs unrotated,
IAM roles unscoped, dependencies unpatched) while
remaining reachable.

**Stave control:** `CTL.LIFECYCLE.STAGING.STALE.001`

Detects non-production-tagged resources (staging, dev,
test, qa, sandbox, demo, poc, prototype) that are
dormant or unused beyond a configurable threshold.
Reuses the lifecycle signals existing per-service
dormancy controls already populate (`is_dormant`,
`appears_unused`, `last_request_days`,
`last_deployment_days`); adds the environment-tag
dimension.

**Compound:** `chains/staging_endpoint_exposed.yaml`
elevates compound severity to HIGH when
`CTL.LIFECYCLE.STAGING.STALE.001` fires together with
any public-access control on the same asset (S3 bucket
policy, EC2 SG ingress, API Gateway resource policy,
ALB topology). This is the canonical NHI-offboarding
crisis: forgotten ephemeral infrastructure retained on
the public internet.

**Example fixture:**
`stave/examples/staging-stale-endpoint/fixtures/stale-staging-public/`
— a `demo`-tagged S3 bucket with `appears_unused: true`
and public list access. Both controls fire; the chain
escalates to HIGH.

**See also:**
- `stave/examples/staging-stale-endpoint/README.md` —
  end-to-end demonstration with four scenarios
  (positive, two negatives, compound).
- `CTL.CLOUDFRONT.LIFECYCLE.DORMANT.001`,
  `CTL.APIGATEWAY.ORPHAN.API.001`,
  `CTL.LAMBDA.LIFECYCLE.DORMANT.001`,
  `CTL.IAM.VENDOR.DORMANT.001` — per-service dormancy
  controls. Environment-agnostic; complement
  `CTL.LIFECYCLE.STAGING.STALE.001` rather than being
  replaced by it.

## Other NHI categories

This page currently covers NHI1 only. The remaining
categories (NHI2 secret leakage, NHI3 vulnerable
third-party identities, etc.) map to other Stave
control families documented at
`reference/control-catalog.md`.
This file should be expanded as the NHI mapping
matures.
