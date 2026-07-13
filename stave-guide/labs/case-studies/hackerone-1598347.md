---
title: "The widget script that's one bucket registration from XSS"
sidebar_label: "HackerOne #1598347"
sidebar_position: 29
description: "A deleted widget bucket plus a live <script> tag — can you see that claiming the name turns a dead reference into attacker JavaScript on the parent domain?"
---

## Metadata

- **Title:** The widget script that's one bucket registration from XSS
- **Source of the case:** HackerOne report #1598347
- **AWS service(s):** S3, Route 53 / DNS
- **Risk archetype:** ghost reference — dangling subdomain feeding an active `<script>` tag
- **One-line hook:** Can you prove this widget subdomain can't be claimed and used to run JS on hackerone.com?

---

## 0. The challenge (what the reader does first)

**Scenario given to the reader:**

An embedded widget is loaded from an S3-backed subdomain via a `<script>` tag on the
company's main site. The widget bucket was deleted, but the DNS record still points at
the S3 endpoint and the `<script src="https://widgets.hackerone.com/widget.js">` tag is
still present on pages served from the parent domain.

**Evidence they're handed (and nothing else):**

```json
{
  "dns_record": {"name": "widgets.hackerone.com", "type": "CNAME", "value": "widgets.hackerone.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "script_tag": "<script src=\"https://widgets.hackerone.com/widget.js\"></script>",
  "parent_domain": "hackerone.com"
}
```

- The DNS record, the fact the bucket no longer exists, the live script tag, and the
  parent domain it loads into.
- No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. Is the widget subdomain in an unsafe state *right now*, or only conditionally?
2. The reference looks dead (the bucket is gone), but the instant an attacker
   *claims* the `widgets.hackerone.com` bucket name, who controls `widget.js`? And
   because this is a `<script>` tag — not a static asset — what does attacker-served
   JavaScript get to do in the context of `hackerone.com`?
3. Which path creates the exposure: the DNS record outliving the bucket, or the
   bucket name being globally claimable?
4. Why is a `<script>` reference categorically worse than an `<img>` or a download
   link to the same dangling bucket?
5. What single rule would have prevented a DNS record from pointing at a deleted,
   claimable bucket whose content executes on the parent domain?

---

## 1. The manual problem

By hand, the reviewer again faces two boring facts — a DNS record and a missing
bucket — but here a third fact raises the stakes: the dangling target feeds a
`<script>` tag on the parent domain. To assess it, someone has to join the DNS zone
against the S3 namespace (the bucket is gone and the name is globally claimable),
then trace where the subdomain's content is *consumed*. The consumption point is
script execution, which means attacker content wouldn't be sandboxed — it would run
with the origin and cookies of `hackerone.com`.

That chain spans three artifacts that no one owner reviews together: the DNS zone,
the S3 namespace, and the HTML of the parent site. The current state looks inert —
the bucket 404s — so it sails through point-in-time review. The reviewer has to model
a future where the name is re-registered and reason forward to full XSS, all from a
snapshot that today just shows a broken include.

---

## 2. The reasoning wall (capture, don't invent)

| What they hit | What they said / would say |
| --- | --- |
| Dead include looks harmless | "The bucket's gone, so the widget just fails to load — no harm." |
| `<script>` vs. static asset | "I'd have worried about a broken image, but a script tag? I didn't connect it to code execution." |
| Latent, parent-domain impact | "So if someone claims that bucket, their JS runs *as* hackerone.com? On every page with the tag?" |

**The insight the reader should reach on their own:**

> A dangling `<script>` source isn't a broken include — it's pre-authorized code
> execution on the parent domain, waiting for someone to claim the name.

---

## 3. Why scanners miss or flatten it

A per-setting scanner finds no bucket to inspect (it's deleted) and a valid CNAME, so
it reports nothing. A web/content scanner might note a 404 on `widget.js` and call it
a broken link. None of them represent the *edge* that matters: a live DNS record
resolving to a globally claimable bucket whose content is loaded via `<script>` into
`hackerone.com`. The danger is the combination of three relationships — dangling DNS,
claimable name, and script-context consumption — and a node-by-node tool has no cell
for "this dead reference becomes arbitrary JavaScript on the parent origin the moment
the name is claimed."

---

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it.
> The reader has now done the work and hit the wall. Only now does the tool appear.

---

## 4. The evidence Stave consumes

The same static facts the reader had — the DNS record, the bucket's non-existence,
the script tag, and the parent domain — captured as an observation snapshot. No live
AWS calls, no new privileges.

```json
{
  "dns_record": {"name": "widgets.hackerone.com", "type": "CNAME", "value": "widgets.hackerone.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "script_tag": "<script src=\"https://widgets.hackerone.com/widget.js\"></script>",
  "parent_domain": "hackerone.com"
}
```

- Normalization: the CNAME target resolves to an S3 bucket name joined against bucket
  existence; the script-tag consumption is recorded so the dangling reference is
  classified as code-execution exposure on `parent_domain`, not a static asset.

---

## 5. The reasoning Stave performs

- **Control / invariant:** `CTL.DNS.DANGLING.001` — no DNS record may point at an S3
  target that no longer exists; `CTL.S3.BUCKET.TAKEOVER.001` — no referenced bucket
  name may be in a deleted, claimable state.
- **What it evaluates:** does a DNS record resolve to an S3 bucket name whose bucket
  does not exist (globally claimable), and is that subdomain consumed via a `<script>`
  tag on a parent domain? Both the dangling reference and the claimable name are
  evaluated as one takeover condition, with the script context raising the impact to
  parent-domain code execution.
- **Verdict produced:** NON_COMPLIANT when the record resolves to a non-existent,
  claimable bucket. The 404/missing bucket confirms the unsafe latent state rather
  than clearing it.

```text
control: CTL.DNS.DANGLING.001
dns:     widgets.hackerone.com (CNAME -> ...s3.amazonaws.com)
evidence: s3_bucket_exists = false; consumed via <script> on parent_domain hackerone.com
verdict: NON_COMPLIANT — live DNS points at a deleted, claimable bucket

control: CTL.S3.BUCKET.TAKEOVER.001
asset:   s3://widgets.hackerone.com
evidence: bucket deleted; name globally registrable; serves widget.js into hackerone.com
verdict: NON_COMPLIANT — claiming the bucket yields XSS on the parent domain
```

---

## 6. The prevention artifact Stave produces

- **Artifact:** a guardrail/SCP that forbids creating or retaining a DNS record whose
  S3 target does not resolve to an existing bucket, paired with the manual
  remediation.
- **What it forecloses:** the exact latent state from question 2 — an attacker
  claiming `widgets.hackerone.com`, serving a malicious `widget.js`, and executing
  arbitrary JavaScript in the context of `hackerone.com` (cookie theft, redirects,
  form exfiltration). Manual fix: delete the orphaned DNS record (and remove the
  `<script>` tag from the parent site), or re-claim the bucket so the name can't fall
  to an outsider.

```text
# SCP / guardrail: deny dangling S3-backed DNS references
deny:
  action: route53:ChangeResourceRecordSets
  when:
    record.type in ["CNAME", "ALIAS"]
    record.target matches "*.s3.amazonaws.com" or "*.s3.<region>.amazonaws.com"
    resolve_s3_bucket(record.target).exists == false
  reason: "DNS record points at a non-existent, claimable S3 bucket (dangling takeover -> XSS via <script>)"

# Manual remediation (one of):
#   1. Remove the orphaned record AND the parent-site script tag:
#      route53 ChangeResourceRecordSets DELETE widgets.hackerone.com
#      (delete <script src="https://widgets.hackerone.com/widget.js">)
#   2. Re-claim the bucket so the name cannot be registered by an attacker:
#      aws s3api create-bucket --bucket widgets.hackerone.com
```

---

## 7. What the team no longer does manually

| Before | After Stave |
| --- | --- |
| Join the DNS zone, S3 namespace, and parent-site HTML by hand | One control resolves the target, checks existence, and flags script consumption |
| Treat a 404 widget as a broken include | A dangling, claimable script source is reported as latent parent-domain XSS |
| Re-audit after every bucket decommission | The guardrail blocks dangling references at creation, deterministically |

---

## Positioning line for this case

> Stave proves that a widget subdomain can't be claimed and weaponized — by
> evaluating the edge between a live DNS record, a deleted claimable bucket, and a
> `<script>` tag on the parent domain — and emits the guardrail and remediation that
> close the path to XSS on hackerone.com.

---

## Reuse checklist

- [x] A reader could attempt section 0 with zero Stave knowledge
- [x] Stave is not named or shown before the pivot point
- [x] Section 2 quotes are real (or honestly plausible), not slogans
- [x] Section 3 names the *specific* thing per-setting tools can't see
- [x] Section 6 closes the exact latent state raised in section 0, question 2
- [x] The title names the failure, not the product
