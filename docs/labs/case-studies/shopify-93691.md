# The merchant upload that could rewrite any other merchant

## Metadata[​](#metadata "Direct link to Metadata")

* **Title:** The merchant upload that could rewrite any other merchant
* **Source of the case:** Real HackerOne report #93691 (Shopify)
* **AWS service(s):** S3 (presigned POST upload policy)
* **Risk archetype:** Latent broad write — a valid signed-upload policy whose key scope spans every merchant instead of one
* **One-line hook:** Can you prove this signed upload keeps one merchant out of another merchant's images?

***

## 0. The challenge (what the reader does first)[​](#0-the-challenge-what-the-reader-does-first "Direct link to 0. The challenge (what the reader does first)")

**Scenario given to the reader:**

Shopify lets merchants upload product images by issuing each merchant a presigned POST policy for the `shopify-merchant-uploads` bucket. Files are meant to live under one folder per merchant (`merchants/{merchant_id}/`). The policy is well-formed and unexpired; its only key constraint is a `starts-with` condition on `$key`. You have the policy below and nothing else.

**Evidence they're handed (and nothing else):**

```
{
  "bucket": "shopify-merchant-uploads",
  "upload_policy": {
    "conditions": [["starts-with", "$key", "merchants/"]],
    "expiration": "2024-12-31T00:00:00Z"
  }
}
```

* The JSON export above. No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. What set of keys can a holder of this policy write — is it bounded to one merchant, or to every key under `merchants/`?
2. No merchant has overwritten another's images yet, but the prefix spans all merchants — what is the latent blast radius the moment merchant 12345 sets `$key` to `merchants/12346/hero.png`? (The exposure is structural: every merchant can already reach every other merchant's product images, with no further misconfiguration needed.)
3. Which path makes this exploitable — the `starts-with $key, "merchants/"` condition stopping above the per-merchant folder?
4. Is there a second constraint in the policy that re-narrows scope to the issuing merchant, or is the shared prefix the only gate?
5. What single rule would have forced every issued policy to scope `$key` to the requesting merchant's own prefix?

***

## 1. The manual problem[​](#1-the-manual-problem "Direct link to 1. The manual problem")

To answer by hand you read the policy the way S3 enforces it: the only barrier is `starts-with $key, "merchants/"`. It looks like a restriction, and the word "merchants" lulls you — it reads as "scoped to merchant uploads." But `merchants/` is the parent of *every* merchant's folder, not one merchant's. To catch it you must hold the intended layout in your head (`merchants/{merchant_id}/`) and notice the policy never binds `$key` to the issuing merchant's id. And there is nothing wrong in the bucket *right now* — no overwritten image, no tampered file on record. The flaw is entirely in what the policy permits, so auditing current contents proves nothing. By hand there is no clean way to demonstrate "every merchant who holds one of these can already overwrite every other merchant's product images."

***

## 2. The reasoning wall[​](#2-the-reasoning-wall "Direct link to 2. The reasoning wall")

| What they hit                                             | What they said / would say                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `starts-with merchants/` looks like a per-merchant scope  | "It says `merchants/`. I read that as 'this merchant's files' and never questioned whether the id was actually in there." |
| Nothing in the bucket is wrong, so nothing trips an alarm | "Every object looked legit. The danger wasn't in any file — it was in the door we'd already handed out."                  |
| The exposure is about reachable keys, not stored keys     | "I can list what's in the bucket. What I couldn't answer was: whose images can merchant X *reach* if they want to?"       |

**The insight the reader should reach on their own:**

> A prefix isolates merchants only when it carries the merchant id; a prefix that stops at `merchants/` is a standing overwrite primitive for the entire platform, and proving it means reasoning about reachable keys, not current contents.

***

## 3. Why scanners miss or flatten it[​](#3-why-scanners-miss-or-flatten-it "Direct link to 3. Why scanners miss or flatten it")

A per-setting scanner verifies the policy is syntactically valid: conditions well-formed, expiration in the future, `$key` constrained by a `starts-with`. All green, because each field is individually correct. What it cannot do is reason that `merchants/` is a *tenant-shared* prefix and therefore violates the per-merchant isolation invariant. To the scanner, `starts-with $key, "merchants/"` and `starts-with $key, "merchants/${merchant_id}/"` are the same shape — a non-empty prefix — and both pass. It has no model of "one merchant per subfolder," so it cannot distinguish a scope that isolates from one that only appears scoped. The specific thing it cannot see is that this valid policy lets any merchant overwrite any other merchant's images. That is a fact about the relationship between the prefix and Shopify's tenancy model, not about any single field a checklist inspects.

***

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it. The reader has now done the work and hit the wall. Only now does the tool appear.

***

## 4. The evidence Stave consumes[​](#4-the-evidence-stave-consumes "Direct link to 4. The evidence Stave consumes")

The same static export the reader had — no new privileges, no live cloud:

```
{
  "bucket": "shopify-merchant-uploads",
  "upload_policy": {
    "conditions": [["starts-with", "$key", "merchants/"]],
    "expiration": "2024-12-31T00:00:00Z"
  }
}
```

Stave normalizes this into an observation snapshot: an upload-policy asset whose key-scope condition and per-merchant tenancy model are both evaluable facts, so the predicate can compare the granted prefix against the merchant boundary the application declares.

***

## 5. The reasoning Stave performs[​](#5-the-reasoning-stave-performs "Direct link to 5. The reasoning Stave performs")

* **Control / invariant:** `CTL.S3.TENANT.ISOLATION.001` — a presigned upload policy must scope `$key` to a single merchant's prefix; a prefix shared across merchants is a violation.
* **What it evaluates:** The control reads the `starts-with $key` condition and tests whether the granted prefix is bounded by a per-merchant component (e.g. `merchants/${merchant_id}/`). A prefix that stops at `merchants/` fails, because the policy authorizes writes across merchant boundaries. It evaluates reachable keys, not stored keys, so it fires even though no cross-merchant overwrite has occurred.
* **Verdict produced:** The control fires NON\_COMPLIANT on the latent over-broad scope. If the tenancy model is unknown rather than provably per-merchant, it reports the finding rather than assuming isolation holds.

```
Issue: shopify-merchant-uploads — upload policy prefix is merchant-shared

CTL.S3.TENANT.ISOLATION.001  NON_COMPLIANT
  asset:    s3://shopify-merchant-uploads (presigned upload policy)
  evidence: condition starts-with $key "merchants/" is shared by all merchants;
            no per-merchant component (expected merchants/${merchant_id}/)
  verdict:  any merchant can overwrite any other merchant's product images —
            latent cross-tenant write, exploitable at will

security_state: NON_COMPLIANT
```

***

## 6. The prevention artifact Stave produces[​](#6-the-prevention-artifact-stave-produces "Direct link to 6. The prevention artifact Stave produces")

* **Artifact:** A corrected presigned POST policy whose `starts-with $key` condition is scoped to the requesting merchant's own prefix, issued per-merchant at signing time.
* **What it forecloses:** The latent state from question 2 — merchant 12345 setting `$key` to `merchants/12346/...`. Once the condition is bound to `merchants/${merchant_id}/`, the signed policy cannot authorize a write outside the issuing merchant's folder, so the cross-merchant overwrite is unreachable rather than merely unobserved.

```
# Corrected presigned POST policy — per-merchant key scope
{
  "expiration": "2024-12-31T00:00:00Z",
  "conditions": [
    {"bucket": "shopify-merchant-uploads"},
    ["starts-with", "$key", "merchants/${merchant_id}/"],
    ["content-length-range", 0, 10485760]
  ]
}
# ${merchant_id} is substituted from the authenticated merchant session at
# signing time, so each issued policy admits only that merchant's own prefix.
# A request with $key = "merchants/12346/hero.png" issued to merchant 12345
# no longer satisfies the condition and S3 rejects the upload.
```

***

## 7. What the team no longer does manually[​](#7-what-the-team-no-longer-does-manually "Direct link to 7. What the team no longer does manually")

| Before                                                                                | After Stave                                                                                    |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Read each upload policy and mentally check its prefix against the per-merchant layout | One control proves the prefix carries the merchant id or flags it deterministically            |
| Try to gauge risk by auditing existing objects in the bucket                          | The control reasons over reachable keys, catching the overwrite primitive before any tampering |
| Trust that every signing path appended the merchant id to the prefix                  | A corrected per-merchant policy template makes the scoped prefix the only issuable shape       |

***

## Positioning line for this case[​](#positioning-line-for-this-case "Direct link to Positioning line for this case")

> Stave proves that `shopify-merchant-uploads` hands every merchant an upload policy reaching every other merchant's prefix, proves the cross-merchant overwrite is reachable today even though none has happened, and emits the per-merchant policy that makes it unreachable.

***

## Reuse checklist[​](#reuse-checklist "Direct link to Reuse checklist")

* [x] A reader could attempt section 0 with zero Stave knowledge
* [x] Stave is not named or shown before the pivot point
* [x] Section 2 quotes are real (or honestly plausible), not slogans
* [x] Section 3 names the *specific* thing per-setting tools can't see
* [x] Section 6 closes the exact latent state raised in section 0, question 2
* [x] The title names the failure, not the product
