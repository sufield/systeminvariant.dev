# The public bucket that also handed out its own index

## Metadata[​](#metadata "Direct link to Metadata")

* **Title:** The public bucket that also handed out its own index
* **Source of the case:** HackerOne report #57505 (Shopify)
* **AWS service(s):** S3
* **Risk archetype:** over-broad public grant (intended read + unintended list)
* **One-line hook:** Can you prove this "public on purpose" bucket only does what it was meant to?

***

## 0. The challenge (what the reader does first)[​](#0-the-challenge-what-the-reader-does-first "Direct link to 0. The challenge (what the reader does first)")

**Scenario given to the reader:**

A storefront assets bucket is intentionally public so the web frontend can serve product images directly. The team meant to grant only object reads. The bucket policy grants `Principal: "*"`, and there is no Public Access Block in front of it.

**Evidence they're handed (and nothing else):**

```
{
  "bucket": "shopify-storefront-assets",
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::shopify-storefront-assets", "arn:aws:s3:::shopify-storefront-assets/*"]}]},
  "public_access_block": null
}
```

* No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. Which action in this policy creates exposure *now* that the team did not intend?
2. The bucket is "supposed" to be public — which part of that public surface is latent risk that nobody reviewed?
3. What can an anonymous caller do through path A (`s3:GetObject`)?
4. What additional capability does path B (`s3:ListBucket`) hand to that same caller?
5. What single rule, applied at policy-authoring time, would have kept "public" meaning only "readable by key"?

***

## 1. The manual problem[​](#1-the-manual-problem "Direct link to 1. The manual problem")

To answer by hand, you have to read the policy statement and mentally separate two permissions that are bundled into one `Action` array. `s3:GetObject` is the one the team talked about: it lets the frontend (and anyone) fetch an object *if they already know its key*. `s3:ListBucket` is the one nobody discussed: it lets anyone enumerate every key in the bucket.

The trap is that both are granted to `Principal: "*"` in the same statement, so a quick read says "yes, it's public, that's intended." Confirming whether the *listing* half was intended means cross-referencing the design intent ("serve images") against the literal grant ("read and enumerate"). With no Public Access Block to backstop it, the policy is the only thing standing between the public and the bucket's full inventory, and there is no clean way to assert "read yes, list no" by eyeballing a JSON array.

***

## 2. The reasoning wall (capture, don't invent)[​](#2-the-reasoning-wall-capture-dont-invent "Direct link to 2. The reasoning wall (capture, don't invent)")

| What they hit                                     | What they said / would say                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Two permissions hidden in one Action array        | "We approved 'public images.' Nobody approved a directory listing."                                      |
| Intended public read masks unintended public list | "It's *supposed* to be public, so the alert looked like noise."                                          |
| No backstop to limit the blast radius             | "There's no Public Access Block, so the policy is doing all the work and we never split read from list." |

**The insight the reader should reach on their own:**

> Public is not one thing. "Readable by key" and "enumerable" are different exposures, and only one of them was a decision.

***

## 3. Why scanners miss or flatten it[​](#3-why-scanners-miss-or-flatten-it "Direct link to 3. Why scanners miss or flatten it")

A per-setting scanner sees `Principal: "*"` and reports "bucket is public." That finding is technically true and operationally useless here, because the team already knows the bucket is public on purpose. The scanner cannot distinguish the *intended* public surface (`s3:GetObject`) from the *unintended* one (`s3:ListBucket`) — it collapses both into a single "public" verdict. What it cannot see is the difference between an object store you can read from and an object store whose entire index you can download: the file paths of staging assets, unreleased product images, and internal naming conventions that were never meant to be enumerable.

***

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it. The reader has now done the work and hit the wall. Only now does the tool appear.

***

## 4. The evidence Stave consumes[​](#4-the-evidence-stave-consumes "Direct link to 4. The evidence Stave consumes")

* The same static observation snapshot the reader had: the bucket name, its bucket policy statement, and the absence of a Public Access Block.

```
{
  "bucket": "shopify-storefront-assets",
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::shopify-storefront-assets", "arn:aws:s3:::shopify-storefront-assets/*"]}]},
  "public_access_block": null
}
```

* No new privileges, no live cloud call. The policy actions are normalized into the set of effective public capabilities.

***

## 5. The reasoning Stave performs[​](#5-the-reasoning-stave-performs "Direct link to 5. The reasoning Stave performs")

* **Control / invariant:** `CTL.S3.PUBLIC.LIST.001` — a public principal must not hold `s3:ListBucket`.
* **What it evaluates:** Does any statement grant `s3:ListBucket` (path B) to `Principal: "*"`? The control separates listing from `s3:GetObject` (path A), so an intentionally public read does not suppress the finding on the unintended public enumeration.
* **Verdict produced:** `NON_COMPLIANT` — public listing is present. `s3:GetObject` alone would not trigger this control; the listing grant does.

```
control: CTL.S3.PUBLIC.LIST.001
asset:   s3://shopify-storefront-assets
evidence: bucket_policy grants s3:ListBucket to Principal "*" (anonymous enumeration of all object keys)
verdict: NON_COMPLIANT
```

***

## 6. The prevention artifact Stave produces[​](#6-the-prevention-artifact-stave-produces "Direct link to 6. The prevention artifact Stave produces")

* **Artifact:** A bucket-policy guardrail that explicitly denies anonymous `s3:ListBucket` while leaving `s3:GetObject` intact.
* **What it forecloses:** The latent state from question 2 — a "public on purpose" bucket whose object index is silently enumerable. The frontend keeps serving images; the directory listing goes away.

```
{
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:ListBucket",
  "Resource": "arn:aws:s3:::shopify-storefront-assets"
}
```

***

## 7. What the team no longer does manually[​](#7-what-the-team-no-longer-does-manually "Direct link to 7. What the team no longer does manually")

| Before                                                                            | After Stave                                                                               |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Read each policy `Action` array and argue about which permissions were "intended" | One control proves whether public listing is present, independent of intended public read |
| Treat every "bucket is public" alert as noise on a deliberately public bucket     | Listing exposure is separated from read exposure, so the signal is actionable             |
| Hope nobody enumerated the bucket before someone noticed                          | A committed guardrail denies anonymous listing on every future deploy                     |

***

## Positioning line for this case[​](#positioning-line-for-this-case "Direct link to Positioning line for this case")

> Stave proves that this bucket exposes its full object index to the public, that the exposure comes from an `s3:ListBucket` grant bundled with the intended read, and emits the Deny that keeps "public" meaning read-only.

***

## Reuse checklist[​](#reuse-checklist "Direct link to Reuse checklist")

* [x] A reader could attempt section 0 with zero Stave knowledge
* [x] Stave is not named or shown before the pivot point
* [x] Section 2 quotes are real (or honestly plausible), not slogans
* [x] Section 3 names the *specific* thing per-setting tools can't see
* [x] Section 6 closes the exact latent state raised in section 0, question 2
* [x] The title names the failure, not the product
