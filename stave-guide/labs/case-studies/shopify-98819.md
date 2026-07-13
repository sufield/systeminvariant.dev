---
title: "The drop box anyone could fill and one stranger could read"
sidebar_label: "Shopify #98819"
sidebar_position: 21
description: "Anonymous write via ACL plus cross-account read via policy form a data-injection pipeline that neither setting reveals on its own."
---

## Metadata

- **Title:** The drop box anyone could fill and one stranger could read
- **Source of the case:** HackerOne report #98819 (Shopify)
- **AWS service(s):** S3
- **Risk archetype:** compound chain (anonymous write + cross-account read)
- **One-line hook:** Can you prove this "internal" bucket isn't an open inbox for an outside account to consume?

---

## 0. The challenge (what the reader does first)

**Scenario given to the reader:**

An internal data bucket carries two grants that nobody looks at together. Its ACL
grants `AllUsers` the `WRITE` permission. Its bucket policy grants a different,
external AWS account (`987654321098`) `s3:GetObject` on every object. There is no
Public Access Block in front of either grant.

**Evidence they're handed (and nothing else):**

```json
{
  "bucket": "shopify-internal-data",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "WRITE"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": {"AWS": "arn:aws:iam::987654321098:root"}, "Action": "s3:GetObject", "Resource": "arn:aws:s3:::shopify-internal-data/*"}]},
  "public_access_block": null
}
```

- No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. Who can write objects into this bucket right now, and through which mechanism?
2. Who can read objects out of this bucket right now, and through which mechanism?
3. Which exposure comes from path A — the ACL grant?
4. Which exposure comes from path B — the bucket policy grant?
5. What single rule, applied before deploy, would have closed both the anonymous write and the cross-account read at once?

---

## 1. The manual problem

To answer by hand you have to hold two unrelated-looking documents in your head at
the same time. The ACL is an old-style access object; the `AllUsers` grantee with
`WRITE` means any anonymous caller on the internet can upload objects into the
bucket. The bucket policy is a separate document; its `Principal` is a specific
external account root, and its action is `s3:GetObject`, so that account can read
every object.

Read in isolation, each grant looks defensible. "We let a partner account read our
exports" is a normal sentence. "There's a legacy ACL grant" is a normal sentence.
The danger only appears when you compose them: a stranger writes, a named outside
account reads. Nothing in the evidence labels that composition, and with no Public
Access Block there is no backstop limiting either path. The reasoning that matters
is not about either setting — it is about the edge between them.

---

## 2. The reasoning wall (capture, don't invent)

| What they hit | What they said / would say |
| --- | --- |
| Two grants in two different documents | "The ACL and the policy were owned by different people, so nobody read them side by side." |
| Each grant looks individually reasonable | "Anonymous write is bad, sure, but the read grant to that account is supposed to be there." |
| The risk is the combination, not a setting | "Wait — if anyone can write and that account auto-ingests, we built a feed straight into their pipeline." |

**The insight the reader should reach on their own:**

> The exposure is an edge between two safe-looking nodes: a write path anyone can use and a read path a trusted outsider depends on.

---

## 3. Why scanners miss or flatten it

A per-setting scanner evaluates the ACL and the policy independently. It may flag the
`AllUsers` WRITE grant as "public write" and may note the cross-account read as a
separate, lower-severity finding — or accept it as an intentional partner grant. What
it cannot see is the pipeline the two grants form together: anonymous attacker writes
a poisoned object, the external account reads it as trusted internal data. Neither
finding, scored on its own, captures that an outsider can now inject content that a
second party consumes automatically. The dangerous thing here is not a node; it is the
write-then-read edge, and a node-by-node report has no place to put it.

---

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it.
> The reader has now done the work and hit the wall. Only now does the tool appear.

---

## 4. The evidence Stave consumes

- The same static observation snapshot the reader had: the bucket name, its ACL
  grants, its bucket policy statement, and the absence of a Public Access Block.

```json
{
  "bucket": "shopify-internal-data",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "WRITE"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": {"AWS": "arn:aws:iam::987654321098:root"}, "Action": "s3:GetObject", "Resource": "arn:aws:s3:::shopify-internal-data/*"}]},
  "public_access_block": null
}
```

- No new privileges, no live cloud call. The ACL grants and policy statements are
  normalized into the set of effective write and read capabilities, by principal.

---

## 5. The reasoning Stave performs

- **Control / invariant:** `CTL.S3.PUBLIC.003` — no anonymous principal may hold write
  access. `CTL.S3.POLICY.WRITE.001` — public/broad write exposure must not be present.
- **What it evaluates:** Does any ACL grant give `AllUsers` a write permission
  (path A)? `CTL.S3.PUBLIC.003` fires on the `AllUsers WRITE` grant. The companion
  control evaluates the effective write exposure surface, so the anonymous-write path
  is named regardless of which document carries it. The cross-account read on path B is
  surfaced as the consuming half of the chain.
- **Verdict produced:** `NON_COMPLIANT` — anonymous write is present. The cross-account
  read grant is reported alongside it as the downstream reader that turns the write into
  an injection pipeline.

```text
control: CTL.S3.PUBLIC.003
asset:   s3://shopify-internal-data
evidence: acl grants AllUsers WRITE (any anonymous caller may upload objects)
verdict: NON_COMPLIANT

control: CTL.S3.POLICY.WRITE.001
asset:   s3://shopify-internal-data
evidence: write exposure present with no Public Access Block; cross-account read granted to arn:aws:iam::987654321098:root consumes uploaded objects
verdict: NON_COMPLIANT
```

---

## 6. The prevention artifact Stave produces

- **Artifact:** A bucket-policy explicit `Deny` for anonymous write paired with a Public
  Access Block that disables both ACL-based and policy-based public grants.
- **What it forecloses:** The latent state from question 2 — an open inbox that a named
  outside account auto-consumes. The Deny removes the anonymous write; the Public Access
  Block makes the ACL grant ineffective even if it is re-added later.

```text
{
  "PublicAccessBlockConfiguration": {
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  },
  "BucketPolicyAppend": {
    "Effect": "Deny",
    "Principal": "*",
    "Action": ["s3:PutObject", "s3:PutObjectAcl"],
    "Resource": "arn:aws:s3:::shopify-internal-data/*"
  }
}
```

---

## 7. What the team no longer does manually

| Before | After Stave |
| --- | --- |
| Read the ACL and the bucket policy as separate documents and hope someone notices the combination | One evaluation names the anonymous-write path and the cross-account reader as a single chain |
| Argue whether the partner read grant is "intended" while the write path goes unreviewed | The write exposure is flagged independent of intent; the read grant is shown as its consumer |
| Trust that no Public Access Block was "probably fine" | A committed PAB plus Deny forecloses both paths on every future deploy |

---

## Positioning line for this case

> Stave proves that this bucket lets any anonymous caller write objects that a named
> external account then reads, names the ACL write path and the policy read path that
> compose the injection pipeline, and emits the Public Access Block plus Deny that
> closes both at once.

---

## Reuse checklist

- [x] A reader could attempt section 0 with zero Stave knowledge
- [x] Stave is not named or shown before the pivot point
- [x] Section 2 quotes are real (or honestly plausible), not slogans
- [x] Section 3 names the *specific* thing per-setting tools can't see
- [x] Section 6 closes the exact latent state raised in section 0, question 2
- [x] The title names the failure, not the product
