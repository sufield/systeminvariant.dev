---
title: "The website endpoint that would serve anyone's index.html"
sidebar_label: "Khan Academy #1777077"
sidebar_position: 14
description: "Reasoning that a dangling website-hosting CNAME is a seamless takeover-and-session-theft primitive while it still returns a 404."
---

## Metadata

- **Title:** The website endpoint that would serve anyone's index.html
- **Source of the case:** HackerOne report — Khan Academy #1777077
- **AWS service(s):** S3 (static website hosting), DNS (CNAME)
- **Risk archetype:** Ghost reference to a website-hosting endpoint under a shared parent domain
- **One-line hook:** Can you prove this subdomain cannot serve an attacker's page as your own?

---

## 0. The challenge (what the reader does first)

**Scenario given to the reader:**

An education site served a content subdomain from an S3 bucket configured for static website hosting. The bucket was deleted in a content migration, but the CNAME still points at the S3 *website* endpoint. The subdomain returns an error, and it sits under the same parent domain that issues session cookies for the main site.

**Evidence they're handed (and nothing else):**

```json
{
  "dns_record": {"name": "smarthistory.khanacademy.org", "type": "CNAME", "value": "smarthistory.khanacademy.org.s3-website-us-east-1.amazonaws.com"},
  "s3_bucket_exists": false,
  "website_hosting": true,
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

- The DNS record, the absent bucket, the website-hosting flag, and the HTTP response above.
- No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. What is the state *now* — what does a visitor to `smarthistory.khanacademy.org` see, and is it currently harmful?
2. This is a harmless 404 today — so what is the latent risk the moment anyone creates a website-hosting bucket of the same name, and why does the website endpoint make the takeover seamless?
3. Which exposure comes from the DNS path — the CNAME resolving to the S3 *website* endpoint?
4. Which exposure comes from the storage path — the bucket name being unowned and globally claimable?
5. What single rule would have prevented this — a constraint binding DNS records to buckets the account owns?

---

## 1. The manual problem

The page is a 404, so triage wants to close it. The two extra facts in this evidence are what make it worse than a plain dangling record, and they are easy to skim past: the CNAME points at the `s3-website-*` endpoint, and the subdomain shares the `khanacademy.org` parent.

The website endpoint matters because S3 website hosting serves `index.html` by default and renders raw HTML — no API ceremony. So a takeover is *seamless*: the attacker creates the bucket, drops an `index.html`, and the subdomain immediately serves a page that looks like the real site. The shared parent matters because cookies scoped to `.khanacademy.org` can be sent by the browser to this subdomain — so a takeover here can harvest live sessions from the main property.

Reasoning this out by hand means joining a DNS fact (record resolves to a website endpoint), an S3 fact (bucket gone, name claimable), an endpoint behavior (website hosting serves attacker HTML directly), and a cookie-scope fact (parent-domain cookies reach the subdomain) — four facts across four mental models, about an attack that hasn't happened.

---

## 2. The reasoning wall (capture, don't invent)

| What they hit | What they said / would say |
| --- | --- |
| The current response is a benign 404 | "It's just NoSuchBucket. Looks like a dead content page." |
| The website endpoint makes takeover invisible to users | "If someone claims it, their index.html just *is* the page — nobody would notice." |
| Cookie scope ties the subdomain to the main site | "Wait — cookies for the parent domain would go to whatever serves this subdomain." |

**The insight the reader should reach on their own:**

> A dangling website-hosting subdomain under a shared parent is not a dead page — it is a turnkey lookalike site and a session-theft channel waiting for the name to be claimed.

---

## 3. Why scanners miss or flatten it

A DNS scanner confirms `smarthistory.khanacademy.org` resolves and the CNAME is well-formed — healthy. An S3 scanner finds no bucket to enumerate, so it reports nothing. Each, looking at one node, sees a clean state.

What no per-setting tool sees is the combination: a live record pointing at a *website-hosting* endpoint whose backing name is globally claimable, beneath a parent domain whose cookies reach the subdomain. The danger is the edge plus the endpoint semantics: claimable name + website endpoint (serves attacker HTML as the page) + shared cookie scope (delivers sessions to the attacker). A node-at-a-time scanner has no field for "this reference is hijackable, the hijack is visually seamless, and it inherits parent-domain cookies," so it reduces a session-theft primitive to two passing checks.

---

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it.
> The reader has now done the work and hit the wall. Only now does the tool appear.

---

## 4. The evidence Stave consumes

The same static facts the reader had — no live cloud, no credentials:

```json
{
  "dns_record": {"name": "smarthistory.khanacademy.org", "type": "CNAME", "value": "smarthistory.khanacademy.org.s3-website-us-east-1.amazonaws.com"},
  "s3_bucket_exists": false,
  "website_hosting": true,
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

- Normalized into an `obs.v0.1` snapshot: the DNS record is an asset whose CNAME target (an S3 website endpoint) is correlated against the S3 bucket inventory, where the referenced bucket is absent.

---

## 5. The reasoning Stave performs

- **Control / invariant:** `CTL.DNS.DANGLING.001` — a DNS record targeting an AWS resource must point at a resource that exists and is owned by the account. Paired with `CTL.S3.BUCKET.TAKEOVER.001` — a referenced S3 bucket must exist.
- **What it evaluates:** the predicate fails when a CNAME resolves to an S3 website endpoint (DNS path) while the named bucket does not exist (storage path), leaving the name claimable; the website-hosting target makes any claim immediately serve attacker HTML — both paths from section 0 in one verdict.
- **Verdict produced:** NON_COMPLIANT. The record resolves to a website endpoint whose bucket name is unowned and claimable.

```text
control:  CTL.DNS.DANGLING.001
asset:    smarthistory.khanacademy.org (CNAME -> ...s3-website-us-east-1.amazonaws.com)
evidence: CNAME live to S3 website endpoint; s3_bucket_exists=false; name claimable
verdict:  NON_COMPLIANT — CNAME points to an unclaimed S3 website bucket

control:  CTL.S3.BUCKET.TAKEOVER.001
asset:    smarthistory.khanacademy.org.s3-website-us-east-1.amazonaws.com
evidence: referenced bucket does not exist (http 404 NoSuchBucket)
verdict:  NON_COMPLIANT — referenced bucket missing; name available to attacker
```

---

## 6. The prevention artifact Stave produces

- **Artifact:** a guardrail / SCP that requires every DNS record targeting an S3 (website) endpoint to reference a bucket owned by the account, and refuses CNAME creation toward an unowned bucket name.
- **What it forecloses:** the latent state from question 2 — no dangling website CNAME can sit waiting to be claimed and turned into a seamless lookalike that harvests parent-domain cookies, because a record pointing at an unowned bucket name is rejected (and the existing one is surfaced for removal or re-claim).

```text
# Guardrail: DNS records to S3 (incl. website endpoints) must target an owned bucket.
rule require_owned_bucket_for_s3_cname:
  for each dns_record where target matches "*.s3*.amazonaws.com":
    assert s3_bucket(target).exists AND s3_bucket(target).owner == self.account
    else: BLOCK "CNAME targets an S3 bucket not owned by this account"

# SCP companion: require bucket ownership before the name is wired into DNS.
{
  "Sid": "NoCnameToUnownedBucket",
  "Effect": "Deny",
  "Action": "route53:ChangeResourceRecordSets",
  "Resource": "*",
  "Condition": { "Null": { "aws:ResourceTag/s3-bucket-owned": "true" } }
}

# Manual fix for the record in this case (do one, not neither):
#   - Delete the dangling CNAME smarthistory.khanacademy.org, OR
#   - Re-create the website bucket smarthistory.khanacademy.org in this account to re-claim it.
```

---

## 7. What the team no longer does manually

| Before | After Stave |
| --- | --- |
| Judge whether a 404 content subdomain is dead or a seamless-lookalike risk | A control proves the website reference is claimable and emits NON_COMPLIANT |
| Cross-check DNS website endpoints against the live S3 inventory by hand | The correlation runs deterministically from a snapshot |
| Hope no future bucket claim turns a dead page into a cookie-harvesting clone | A guardrail rejects records pointing at unowned bucket names |

---

## Positioning line for this case

> Stave proves that a live CNAME to a deleted S3 website bucket is a seamless-takeover and session-theft primitive — not a dead page — and emits the guardrail that forbids records targeting names you do not own.

---

## Reuse checklist

- [x] A reader could attempt section 0 with zero Stave knowledge
- [x] Stave is not named or shown before the pivot point
- [x] Section 2 quotes are real (or honestly plausible), not slogans
- [x] Section 3 names the *specific* thing per-setting tools can't see
- [x] Section 6 closes the exact latent state raised in section 0, question 2
- [x] The title names the failure, not the product
