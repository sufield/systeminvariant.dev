---
title: "The install command pointing at a bucket someone else could fill"
sidebar_label: "Tendermint #1397826"
sidebar_position: 15
description: "Reasoning that a dangling release-bucket CNAME referenced by install docs is a supply-chain takeover primitive while it still returns a 404."
---

## Metadata

- **Title:** The install command pointing at a bucket someone else could fill
- **Source of the case:** HackerOne report — Tendermint #1397826
- **AWS service(s):** S3, DNS (CNAME)
- **Risk archetype:** Ghost reference in a trusted software-distribution path (supply chain)
- **One-line hook:** Can you prove the binaries your install docs point to come only from you?

---

## 0. The challenge (what the reader does first)

**Scenario given to the reader:**

A software project distributed release binaries from an S3 bucket reachable at `releases.tendermint.com`. The bucket was deleted when release tooling moved elsewhere, but the CNAME was left in place — and the official install docs and README still tell users to download from that URL. Fetching it returns an error.

**Evidence they're handed (and nothing else):**

```json
{
  "dns_record": {"name": "releases.tendermint.com", "type": "CNAME", "value": "releases.tendermint.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "referenced_in": ["docs/install.md", "README.md"],
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

- The DNS record, the absent bucket, the docs that reference it, and the HTTP response above.
- No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. What is the state *now* — what happens when a developer follows the install docs today, and is it currently harmful?
2. This is a harmless 404 today — so what is the latent risk the moment anyone creates an S3 bucket of the same name, given that the install docs send users straight to it?
3. Which exposure comes from the DNS path — the CNAME still resolving to S3?
4. Which exposure comes from the storage path — the bucket name being unowned and globally claimable?
5. What single rule would have prevented this — a constraint binding DNS records to buckets the account owns?

---

## 1. The manual problem

A failed download looks like a stale-docs bug: the page 404s, a developer hits an error, files an issue, moves on. The severity hides in two facts you have to connect: the bucket name is globally claimable, and the project's *own documentation* drives users to fetch executable code from that exact name.

If an attacker claims the bucket, the still-live CNAME resolves to their content, and every developer who follows `docs/install.md` downloads and runs whatever the attacker placed there — trojaned binaries served from the project's official release URL. The docs are a trusted distribution channel; the takeover hijacks the channel, not just a page. That is the definition of a supply-chain attack.

Reasoning this by hand means joining a DNS fact (record resolves), an S3 fact (bucket gone, name claimable), and a usage fact (install docs point users here to download binaries) across three places — and projecting forward to an attacker who hasn't acted yet. The current 404 shows none of it.

---

## 2. The reasoning wall (capture, don't invent)

| What they hit | What they said / would say |
| --- | --- |
| The current response is a benign 404 | "Install link's broken — that's a docs fix, not a security bug." |
| The docs make the bucket a distribution channel | "These docs tell people to download binaries from there. Whoever owns that bucket owns our install." |
| The risk is a future claim, not a current state | "Nobody's hosting anything there now, so what is there to flag?" |

**The insight the reader should reach on their own:**

> A dangling release-bucket reference in install docs is not a broken link — it is an open slot in your supply chain waiting for an attacker to claim the name.

---

## 3. Why scanners miss or flatten it

A DNS scanner confirms `releases.tendermint.com` resolves and the CNAME is well-formed — healthy. An S3 scanner finds no bucket, so it reports nothing. A docs linter might flag a broken link, at most a content warning. Each tool, on its own node, sees something benign.

What no per-setting tool sees is the combination: a live record whose target is a globally claimable name, *and* that name is the binary-download endpoint named in the project's trusted install docs. The supply-chain primitive is the edge plus the usage context: claimable name + live record + docs that drive code execution from it. A node-at-a-time scanner has no representation for "this reference is hijackable and the hijack delivers attacker binaries through our official channel," so it flattens a supply-chain compromise into a broken-link ticket.

---

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it.
> The reader has now done the work and hit the wall. Only now does the tool appear.

---

## 4. The evidence Stave consumes

The same static facts the reader had — no live cloud, no credentials:

```json
{
  "dns_record": {"name": "releases.tendermint.com", "type": "CNAME", "value": "releases.tendermint.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "referenced_in": ["docs/install.md", "README.md"],
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

- Normalized into an `obs.v0.1` snapshot: the DNS record is an asset whose CNAME target is correlated against the S3 bucket inventory (absent), carrying the doc references that mark it a distribution endpoint.

---

## 5. The reasoning Stave performs

- **Control / invariant:** `CTL.DNS.DANGLING.001` — a DNS record targeting an AWS resource must point at a resource that exists and is owned by the account. Paired with `CTL.S3.BUCKET.TAKEOVER.001` — a referenced S3 bucket must exist.
- **What it evaluates:** the predicate fails when a CNAME resolves to an S3 endpoint (DNS path) while the named bucket does not exist (storage path), leaving the name claimable; here the name is the install-docs download endpoint, making the claim a supply-chain hijack — both paths from section 0 in one verdict.
- **Verdict produced:** NON_COMPLIANT. The release domain resolves but its target bucket name is unowned and claimable.

```text
control:  CTL.DNS.DANGLING.001
asset:    releases.tendermint.com (CNAME -> releases.tendermint.com.s3.amazonaws.com)
evidence: CNAME live; s3_bucket_exists=false; name claimable; referenced_in install docs
verdict:  NON_COMPLIANT — release domain points to an unclaimed bucket

control:  CTL.S3.BUCKET.TAKEOVER.001
asset:    releases.tendermint.com.s3.amazonaws.com
evidence: referenced bucket does not exist (http 404 NoSuchBucket)
verdict:  NON_COMPLIANT — package distribution bucket deleted; name available to attacker
```

---

## 6. The prevention artifact Stave produces

- **Artifact:** a guardrail / SCP that requires every DNS record targeting an S3 bucket to reference a bucket owned by the account, and refuses CNAME creation toward an unowned bucket name.
- **What it forecloses:** the latent state from question 2 — no dangling release CNAME can sit waiting to be claimed and serve trojaned binaries through the official install docs, because a record pointing at an unowned bucket name is rejected (and the existing one is surfaced for removal or re-claim).

```text
# Guardrail: DNS records to S3 must target a bucket this account owns.
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
#   - Delete the dangling CNAME releases.tendermint.com (and update install docs), OR
#   - Re-create the S3 bucket releases.tendermint.com in this account to re-claim the name.
```

---

## 7. What the team no longer does manually

| Before | After Stave |
| --- | --- |
| Decide whether a 404 install link is a docs bug or a supply-chain hole | A control proves the release reference is claimable and emits NON_COMPLIANT |
| Cross-check release-domain CNAMEs against the live S3 inventory by hand | The correlation runs deterministically from a snapshot |
| Hope no future bucket claim turns the official download URL into a malware feed | A guardrail rejects records pointing at unowned bucket names |

---

## Positioning line for this case

> Stave proves that a live CNAME to a deleted release bucket named in your install docs is a supply-chain takeover primitive — not a broken link — and emits the guardrail that forbids records targeting names you do not own.

---

## Reuse checklist

- [x] A reader could attempt section 0 with zero Stave knowledge
- [x] Stave is not named or shown before the pivot point
- [x] Section 2 quotes are real (or honestly plausible), not slogans
- [x] Section 3 names the *specific* thing per-setting tools can't see
- [x] Section 6 closes the exact latent state raised in section 0, question 2
- [x] The title names the failure, not the product
