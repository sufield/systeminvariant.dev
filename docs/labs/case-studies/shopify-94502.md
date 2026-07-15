# The remediation that fixed listing and left write wide open

## Metadata[​](#metadata "Direct link to Metadata")

* **Title:** The remediation that fixed listing and left write wide open
* **Source of the case:** HackerOne report #94502 (Shopify)
* **AWS service(s):** S3
* **Risk archetype:** incomplete remediation (public read + public write persist via ACL)
* **One-line hook:** Can you prove this "fixed" bucket is actually safe, or just less broken?

***

## 0. The challenge (what the reader does first)[​](#0-the-challenge-what-the-reader-does-first "Direct link to 0. The challenge (what the reader does first)")

**Scenario given to the reader:**

Three buckets were reported as public. The team responded by removing listing. On this bucket the policy now has an empty statement list — but the ACL still grants `AllUsers: READ` *and* `AllUsers: WRITE`, and there is no Public Access Block.

**Evidence they're handed (and nothing else):**

```
{
  "bucket": "shopify-uploads-partial-fix",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}, {"grantee": "AllUsers", "permission": "WRITE"}]},
  "bucket_policy": {"Statement": []},
  "public_access_block": null
}
```

* No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. After the listing fix, which grants are still unsafe *right now*?
2. The policy is empty — which surface is still wide open and was the empty policy mistaken for a complete fix?
3. What can an anonymous caller do through path A (`AllUsers: READ`)?
4. What can an anonymous caller do through path B (`AllUsers: WRITE`)?
5. What single rule would have caught that "we removed listing" was not the same as "we removed public access"?

***

## 1. The manual problem[​](#1-the-manual-problem "Direct link to 1. The manual problem")

The dangerous move here is reading the empty `bucket_policy.Statement` array and concluding the bucket was fixed. The policy is one of two grant surfaces; the ACL is the other, and it still carries two public grants. To answer by hand you have to ignore the reassuring-looking empty policy and read the ACL, then reason about each grant separately: public read means anyone who knows or guesses a key can fetch the object; public write means anyone can upload new objects or overwrite existing ones.

The original report said "public," the team removed listing, and the ticket got closed. Nobody re-derived the full set of effective public capabilities after the change. With no Public Access Block to catch the leftover ACL grants, the "fix" silently left the worst capability — anonymous write — in place.

***

## 2. The reasoning wall (capture, don't invent)[​](#2-the-reasoning-wall-capture-dont-invent "Direct link to 2. The reasoning wall (capture, don't invent)")

| What they hit                     | What they said / would say                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| Empty policy read as "done"       | "The policy's empty now, so we figured it was closed."                                     |
| ACL grants survived the fix       | "We removed listing. We never touched the ACL."                                            |
| Write was never on anyone's radar | "Read felt expected for an uploads bucket. Nobody clocked that the same ACL grants write." |

**The insight the reader should reach on their own:**

> Removing one grant does not prove the bucket is safe — only re-checking every path does.

***

## 3. Why scanners miss or flatten it[​](#3-why-scanners-miss-or-flatten-it "Direct link to 3. Why scanners miss or flatten it")

A per-setting scanner will happily confirm the policy has zero statements — a true fact that reads like a clean result. If the scanner reports ACL grants at all, it lists "READ" and "WRITE" as two separate line items with no notion of which one matters more or whether the remediation was complete. What it cannot see is the gap between *what was reported and partially fixed* and *what remains*: the listing path is gone, but anonymous WRITE — the ability to upload malware or overwrite served objects — survives in the ACL, and the empty policy creates a false impression that the bucket was remediated. The scanner reports settings; it cannot assert "this fix was incomplete."

***

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it. The reader has now done the work and hit the wall. Only now does the tool appear.

***

## 4. The evidence Stave consumes[​](#4-the-evidence-stave-consumes "Direct link to 4. The evidence Stave consumes")

* The same static snapshot the reader had: the post-fix ACL grants, the now-empty bucket policy, and the missing Public Access Block.

```
{
  "bucket": "shopify-uploads-partial-fix",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}, {"grantee": "AllUsers", "permission": "WRITE"}]},
  "bucket_policy": {"Statement": []},
  "public_access_block": null
}
```

* ACL grants are normalized into the effective public-capability set; an empty policy contributes nothing, so the ACL grants stand alone and remain visible.

***

## 5. The reasoning Stave performs[​](#5-the-reasoning-stave-performs "Direct link to 5. The reasoning Stave performs")

* **Control / invariant:** two controls fire — `CTL.S3.PUBLIC.001` (no public read) and `CTL.S3.PUBLIC.003` (no public write).
* **What it evaluates:** `CTL.S3.PUBLIC.001` checks every path for anonymous read — here, the surviving `AllUsers: READ` ACL grant (path A). `CTL.S3.PUBLIC.003` checks for anonymous write — the surviving `AllUsers: WRITE` ACL grant (path B). The empty policy does not suppress either; the ACL alone is sufficient to violate both.
* **Verdict produced:** both `NON_COMPLIANT`. The remediation that removed listing did not clear these, so the "fixed" bucket still fails.

```
control: CTL.S3.PUBLIC.001
asset:   s3://shopify-uploads-partial-fix
evidence: ACL grants AllUsers READ (anonymous object read persists after partial fix)
verdict: NON_COMPLIANT

control: CTL.S3.PUBLIC.003
asset:   s3://shopify-uploads-partial-fix
evidence: ACL grants AllUsers WRITE (anonymous upload/overwrite persists after partial fix)
verdict: NON_COMPLIANT
```

***

## 6. The prevention artifact Stave produces[​](#6-the-prevention-artifact-stave-produces "Direct link to 6. The prevention artifact Stave produces")

* **Artifact:** A Public Access Block configuration that neutralizes public ACL grants regardless of what the ACL says, plus an explicit Deny on anonymous write.
* **What it forecloses:** The latent state from question 2 — an "already fixed" bucket whose ACL still grants anonymous WRITE (and READ). The Public Access Block makes leftover public ACL grants ineffective so a partial fix can never again leave a public surface behind.

```
PublicAccessBlockConfiguration:
  BlockPublicAcls:       true
  IgnorePublicAcls:      true
  BlockPublicPolicy:     true
  RestrictPublicBuckets: true

# plus, explicit bucket-policy Deny on anonymous write:
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": ["s3:PutObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::shopify-uploads-partial-fix/*"
}
```

***

## 7. What the team no longer does manually[​](#7-what-the-team-no-longer-does-manually "Direct link to 7. What the team no longer does manually")

| Before                                                        | After Stave                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Read the policy, see it's empty, assume the bucket is fixed   | Every grant path is re-evaluated, so an empty policy can't mask surviving ACL grants |
| Close a remediation ticket without re-deriving total exposure | Read and write are independently asserted, so "incomplete fix" is a hard verdict     |
| Discover lingering anonymous write only after abuse           | A Public Access Block + Deny forecloses public write on every future deploy          |

***

## Positioning line for this case[​](#positioning-line-for-this-case "Direct link to Positioning line for this case")

> Stave proves the listing fix was incomplete — that anonymous read and anonymous write still survive via ACL — and emits the Public Access Block and Deny that make a partial fix impossible to mistake for a complete one.

***

## Reuse checklist[​](#reuse-checklist "Direct link to Reuse checklist")

* [x] A reader could attempt section 0 with zero Stave knowledge
* [x] Stave is not named or shown before the pivot point
* [x] Section 2 quotes are real (or honestly plausible), not slogans
* [x] Section 3 names the *specific* thing per-setting tools can't see
* [x] Section 6 closes the exact latent state raised in section 0, question 2
* [x] The title names the failure, not the product
