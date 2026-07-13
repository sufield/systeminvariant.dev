---
title: "The upload token that trusted the path it was handed"
sidebar_label: "Shopify #94087"
sidebar_position: 22
description: "A presigned URL scoped one prefix too wide lets one tenant write into another tenant's space — isolation that lives in a single Resource string."
---

## Metadata

- **Title:** The upload token that trusted the path it was handed
- **Source of the case:** HackerOne report #94087 (Shopify)
- **AWS service(s):** S3
- **Risk archetype:** broken tenant isolation (presigned URL scope)
- **One-line hook:** Can you prove merchant 12345's upload token cannot reach merchant 12346's files?

---

## 0. The challenge (what the reader does first)

**Scenario given to the reader:**

A multi-tenant platform lets each merchant upload files into one shared bucket. Every
merchant's objects live under a per-tenant prefix, `merchants/{merchant_id}/`. The
application mints a presigned URL for each upload so the browser can write directly to
S3 without the file passing through the app servers. Merchant 12345 just received an
upload token. The question is what that token can actually reach.

**Evidence they're handed (and nothing else):**

There is no static settings export for this case — the risk lives in how the token is
minted, not in a stored bucket attribute. The reader is handed:

- The shared bucket layout: one bucket, per-merchant prefixes of the form
  `merchants/{merchant_id}/`.
- The fact that the app issues presigned URLs for direct browser uploads.
- The shape of the presigned request that produced the token for merchant 12345 —
  specifically the `Resource` (or signed key/prefix) the signature commits to. The
  reader must determine whether that `Resource` is pinned to `merchants/12345/*` or is
  broader (a wildcard, the bucket root, or a prefix that does not terminate at the
  tenant boundary).
- No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. If the presigned URL authorizes writes to `merchants/12345/*`, can the holder write to `merchants/12346/*` right now?
2. Which exact field in the presigned request decides whether prefix isolation holds?
3. Which exposure comes from path A — a `Resource` that uses a wildcard broader than one tenant?
4. Which exposure comes from path B — a prefix that allows traversal across the tenant boundary (e.g. not anchored, or `merchants/*`)?
5. What single rule, applied at token-minting time, would have guaranteed every token is pinned to exactly one tenant's prefix?

---

## 1. The manual problem

To answer by hand you have to reconstruct what the signature actually commits to.
A presigned URL is a signed assertion: "the bearer may perform this action on this
resource until this expiry." Tenant isolation here is not a bucket setting, an ACL, or
a policy that you can read once and trust forever — it is recreated on every single
upload, in the code path that builds the `Resource` string before signing.

So the manual check is per-request and per-deploy. You have to read the signing code,
confirm the merchant ID is interpolated correctly, confirm the resource is anchored to
`merchants/{id}/` and terminated so it cannot match a sibling prefix, and confirm no
wildcard widens it. A single broad token — `merchants/*`, or a key that lets `../`
style traversal land outside the tenant prefix — silently lets one merchant write into
another's space. There is no stored artifact to scan; the isolation guarantee exists
only for as long as the minting logic keeps producing correctly scoped tokens.

---

## 2. The reasoning wall (capture, don't invent)

| What they hit | What they said / would say |
| --- | --- |
| Isolation lives in code, not in a stored setting | "There's nothing to point a scanner at — the boundary is whatever string we sign at request time." |
| The token looks fine for its own tenant | "The 12345 token works perfectly for 12345. We never tested what it does against 12346." |
| Prefix scope is one character away from wrong | "If the Resource is `merchants/*` instead of `merchants/12345/*`, every merchant can write into every other merchant." |

**The insight the reader should reach on their own:**

> Tenant isolation is an invariant on every token we mint, not a property of the bucket — and we were proving it by hand, one URL at a time.

---

## 3. Why scanners miss or flatten it

A per-setting scanner inventories the bucket: it can tell you the Public Access Block
state, the bucket policy, the encryption mode. All of those can be perfectly green here
— the bucket is private, locked down, and correctly configured. The thing that breaks
isolation never appears in any of those settings. It appears in the ephemeral
`Resource` scope of a presigned URL that the application generates and discards
thousands of times a day. A scanner has no object to read, because the dangerous
artifact does not persist. It cannot reason that "this token, scoped to `merchants/*`,
violates the per-tenant boundary the prefixes imply," because it never sees the token
and does not know the tenant model. The specific thing it cannot see is the scope of a
credential that exists only between mint and expiry.

---

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it.
> The reader has now done the work and hit the wall. Only now does the tool appear.

---

## 4. The evidence Stave consumes

- The same static input the reader had, expressed as an observation of the minting
  contract rather than a live token capture:
  - The tenant model: one shared bucket, isolation enforced by the per-merchant prefix
    `merchants/{merchant_id}/`.
  - The presigned request template the application signs, including the `Resource`
    scope it commits to and the merchant ID it is supposed to pin to.
  - For the merchant 12345 instance: the resolved `Resource` the signature was built
    over.
- No new privileges, no live cloud call. The `Resource` scope is normalized against the
  declared tenant prefix to determine whether the signed scope is wider than one tenant.

---

## 5. The reasoning Stave performs

- **Control / invariant:** `CTL.S3.TENANT.ISOLATION.001` — a presigned URL's resource
  scope must enforce the tenant boundary; it must be pinned to exactly the issuing
  tenant's prefix.
- **What it evaluates:** Is the signed `Resource` anchored to `merchants/{this_merchant}/`
  and terminated so it cannot match a sibling prefix? Path A: a wildcard scope (e.g.
  `merchants/*`) that is broader than one tenant is a violation. Path B: a prefix that is
  not anchored to the tenant boundary and permits traversal into `merchants/12346/*` is
  a violation. A `Resource` exactly equal to `merchants/12345/*` is compliant.
- **Verdict produced:** `NON_COMPLIANT` when the signed scope can reach a tenant other
  than the issuing one; `COMPLIANT` only when the scope is pinned to the single tenant
  prefix.

```text
control: CTL.S3.TENANT.ISOLATION.001
asset:   presigned-url(merchant=12345) -> s3://shared-uploads
evidence: signed Resource scope is broader than one tenant prefix (does not pin to merchants/12345/*), permitting writes into merchants/12346/*
verdict: NON_COMPLIANT
```

---

## 6. The prevention artifact Stave produces

- **Artifact:** A tenant-scoped presigned policy template that pins every minted token's
  `Resource` to exactly the issuing merchant's prefix, with the merchant ID bound at
  signing time.
- **What it forecloses:** The latent state from question 2 — a token whose `Resource`
  scope is wide enough to write into a sibling tenant's prefix. Every future token is
  anchored to one tenant and cannot match another.

```text
{
  "presigned_policy": {
    "expiration": "<short TTL>",
    "conditions": [
      {"bucket": "shared-uploads"},
      ["starts-with", "$key", "merchants/${merchant_id}/"],
      ["eq", "$x-amz-meta-tenant", "${merchant_id}"]
    ],
    "resource": "arn:aws:s3:::shared-uploads/merchants/${merchant_id}/*"
  }
}
```

---

## 7. What the team no longer does manually

| Before | After Stave |
| --- | --- |
| Read the signing code path by hand to confirm each token is pinned to one tenant | One control proves the signed `Resource` cannot reach another tenant's prefix |
| Test a token only against its own tenant and assume isolation holds | The cross-tenant path (wildcard or traversal) is evaluated explicitly |
| Re-verify isolation by inspection on every deploy of the minting logic | The tenant-scoped policy template makes the boundary deterministic and repeatable |

---

## Positioning line for this case

> Stave proves that this merchant's upload token cannot write outside its own tenant
> prefix, names whether the leak comes from a wildcard scope or a traversable prefix,
> and emits the tenant-pinned presigned policy that keeps every token bound to one
> tenant.

---

## Reuse checklist

- [x] A reader could attempt section 0 with zero Stave knowledge
- [x] Stave is not named or shown before the pivot point
- [x] Section 2 quotes are real (or honestly plausible), not slogans
- [x] Section 3 names the *specific* thing per-setting tools can't see
- [x] Section 6 closes the exact latent state raised in section 0, question 2
- [x] The title names the failure, not the product
