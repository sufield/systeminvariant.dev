---
title: "Public read was fine — public listing leaked the whole catalog"
sidebar_label: "Greenhouse #819278"
sidebar_position: 7
description: "Marketing assets are public by design, but the same grant also exposes the full inventory — separating intended exposure from disclosure."
---

## Metadata

- **Title:** Public read was fine — public listing leaked the whole catalog
- **Source of the case:** HackerOne report #819278 (Greenhouse)
- **AWS service(s):** S3
- **Risk archetype:** intended public read compounded by unintended public listing (two paths to public)
- **One-line hook:** Can you prove a deliberately public bucket isn't also disclosing more than was decided?

---

## 0. The challenge (what the reader does first)

**Scenario given to the reader:**

A marketing team's asset bucket is publicly accessible so images can be embedded in
blog posts and landing pages. The exposure is granted *twice*: an ACL grants
`AllUsers: READ`, and a bucket policy grants `Principal: "*"` both `s3:GetObject`
and `s3:ListBucket`. There is no Public Access Block.

**Evidence they're handed (and nothing else):**

```json
{
  "bucket": "greenhouse-marketing-assets",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::greenhouse-marketing-assets", "arn:aws:s3:::greenhouse-marketing-assets/*"]}]},
  "public_access_block": null
}
```

- No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. Public read on marketing images is intended — so which part of this configuration is actually unsafe *now*?
2. Which exposure here is the latent disclosure risk that survives even after you accept "the images are public"?
3. What does path A — public read, granted both by ACL and by policy — let an anonymous caller do?
4. What does path B — `s3:ListBucket` to `Principal: "*"` — add beyond that?
5. What single rule would separate "intended public read" from "unintended public inventory" so the second can be denied without breaking the first?

---

## 1. The manual problem

Answering by hand means reconciling two independent grant mechanisms that say
overlapping things. The ACL makes the bucket readable to everyone. The bucket policy
*also* makes it readable to everyone, and additionally grants listing. To decide
what's actually exposed you have to merge the ACL grant and the policy statement into
a single effective-permission picture, then ask which slice of that picture was a
decision and which was a side effect.

"The images are public, that's the whole point" is true and it short-circuits the
review. But public read of *known* keys and public enumeration of *all* keys are
different risks, and they're tangled together across two config surfaces with no
Public Access Block to bound them. There's no tidy manual way to say "read is
approved, listing is not" when the grant is spread across an ACL and a policy array.

---

## 2. The reasoning wall (capture, don't invent)

| What they hit | What they said / would say |
| --- | --- |
| Read granted twice, by ACL and by policy | "Two different things grant public read. Which one is load-bearing?" |
| Intended exposure hides an unintended one | "Marketing said 'make it public.' They did not say 'publish a file index.'" |
| Listing reveals unlinked drafts | "Half this bucket isn't linked from any page. Listing it makes it findable anyway." |

**The insight the reader should reach on their own:**

> Accepting that something is intentionally public is not the same as bounding *how much* is public.

---

## 3. Why scanners miss or flatten it

A per-setting scanner reports "ACL grants public read" and "policy allows public
access" as two separate true facts, and stops there. On a bucket the team already
declared public, both findings read as expected and get waved through. What the
scanner cannot express is the distinction that matters here: that `s3:GetObject`
(intended) and `s3:ListBucket` (not intended) ride in the same allow statement, so
the very grant that serves the marketing images also hands out the full inventory —
draft content, internal naming conventions, and files not yet linked from any public
page. The scanner sees "public, as configured"; it cannot see that the *quantity* of
disclosure exceeds the decision.

---

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it.
> The reader has now done the work and hit the wall. Only now does the tool appear.

---

## 4. The evidence Stave consumes

- The same static snapshot the reader had: the bucket ACL grants, the bucket policy
  statement, and the missing Public Access Block.

```json
{
  "bucket": "greenhouse-marketing-assets",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::greenhouse-marketing-assets", "arn:aws:s3:::greenhouse-marketing-assets/*"]}]},
  "public_access_block": null
}
```

- ACL grants and policy statements are normalized into one effective-public-capability set, so read-via-ACL and read-via-policy collapse to a single fact and listing stands on its own.

---

## 5. The reasoning Stave performs

- **Control / invariant:** two controls fire — `CTL.S3.PUBLIC.001` (no public read) and `CTL.S3.PUBLIC.LIST.001` (no public listing).
- **What it evaluates:** `CTL.S3.PUBLIC.001` asks whether any path — ACL `AllUsers: READ` or policy `s3:GetObject` to `*` — yields anonymous read (path A). `CTL.S3.PUBLIC.LIST.001` asks whether `s3:ListBucket` is granted to `*` (path B). The two are reported separately so a team can accept the read finding while still being forced to act on the listing finding.
- **Verdict produced:** both `NON_COMPLIANT`. The read finding documents the intended-but-broad exposure; the listing finding flags the disclosure the team never decided on.

```text
control: CTL.S3.PUBLIC.001
asset:   s3://greenhouse-marketing-assets
evidence: ACL grants AllUsers READ and policy grants s3:GetObject to Principal "*" (anonymous read)
verdict: NON_COMPLIANT

control: CTL.S3.PUBLIC.LIST.001
asset:   s3://greenhouse-marketing-assets
evidence: bucket_policy grants s3:ListBucket to Principal "*" (anonymous enumeration of full inventory)
verdict: NON_COMPLIANT
```

---

## 6. The prevention artifact Stave produces

- **Artifact:** A bucket-policy Deny that strips anonymous `s3:ListBucket` while leaving the intended public `s3:GetObject` serving path untouched.
- **What it forecloses:** The latent disclosure from question 2 — the full object inventory, including unlinked drafts, being enumerable by anyone. Public read of embedded images keeps working.

```text
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:ListBucket",
  "Resource": "arn:aws:s3:::greenhouse-marketing-assets"
}
```

---

## 7. What the team no longer does manually

| Before | After Stave |
| --- | --- |
| Merge ACL grants and policy statements by hand to figure out what's effectively public | Normalization collapses both paths into one read finding plus a distinct listing finding |
| Argue whether a "public" alert is acceptable or actionable | Read vs. listing are separated, so "accept read, deny listing" is an explicit, repeatable decision |
| Trust that no one enumerated draft assets before launch | A committed Deny removes anonymous listing on every deploy |

---

## Positioning line for this case

> Stave proves this bucket's public read is reachable by two paths and that its
> object inventory is separately enumerable, then emits the Deny that keeps the
> images public while closing the listing leak.

---

## Reuse checklist

- [x] A reader could attempt section 0 with zero Stave knowledge
- [x] Stave is not named or shown before the pivot point
- [x] Section 2 quotes are real (or honestly plausible), not slogans
- [x] Section 3 names the *specific* thing per-setting tools can't see
- [x] Section 6 closes the exact latent state raised in section 0, question 2
- [x] The title names the failure, not the product
