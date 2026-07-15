# HackerOne Case Studies

30 real HackerOne bug bounty reports reconstructed as reasoning challenges. Each case: static configuration evidence, a question about what's unsafe, and what a reasoning engine finds that a scanner misses.

## Getting Started[​](#getting-started "Direct link to Getting Started")

New to the case studies? Start here — download fixtures, answer five questions by hand, then see what Stave finds.

1. [Overview](/docs/hackerone)
2. [Setup](/docs/case-studies-setup)
3. [Questions](/docs/case-study-questions)
4. [Run Stave](/docs/now-run-stave)
5. [Debrief](/docs/case-studies-debrief)

## Public Exposure (11 cases)[​](#public-exposure-11-cases "Direct link to Public Exposure (11 cases)")

Buckets open by ACL, policy, or both. Can you tell from the static config alone whether the resource is exposed?

* [Uber #361438](/docs/labs/uber-361438) — confidential tag + public policy contradiction
* [Slack #404822](/docs/labs/slack-404822) — public policy + ineffective Public Access Block
* [Shopify #1021906](/docs/labs/shopify-1021906) — internal tag + public read and list
* [Omise #1474017](/docs/labs/omise-1474017) — dual exposure path (ACL + policy)
* [Zomato #507097](/docs/labs/zomato-507097) — enumerable user data (listing + read)
* [Shopify #57505](/docs/labs/shopify-57505) — intentional public read + unintentional public list
* [Greenhouse #819278](/docs/labs/greenhouse-819278) — intended marketing exposure + unintended inventory disclosure
* [Shopify #94502](/docs/labs/shopify-94502) — incomplete remediation (listing removed, write remains)
* [Mapbox #202725](/docs/labs/mapbox-202725) — bucket-level locked, per-object ACL opens exposure
* [Mozilla #2383486](/docs/labs/mozilla-2383486) — public static content + exposed .git directory
* [HackerOne #43280](/docs/labs/hackerone-43280) — HTTP and HTTPS both serve objects

## Dangling References & Takeover (9 cases)[​](#dangling-references--takeover-9-cases "Direct link to Dangling References & Takeover (9 cases)")

DNS records pointing at deleted resources. A 404 today is a takeover tomorrow. Can you prove the reference is claimable?

These cases connect directly to Stave's ghost-reference controls and the Unit 42 bucket-hijacking research.

* [Bime #121461](/docs/labs/bime-121461) — live DNS + claimable bucket name
* [DoD #918946](/docs/labs/dod-918946) — dangling .gov CNAME (high-trust takeover)
* [Khan Academy #1777077](/docs/labs/khanacademy-1777077) — dangling website CNAME (session theft)
* [Tendermint #1397826](/docs/labs/tendermint-1397826) — dangling release-bucket CNAME (supply chain)
* [Brave #1791558](/docs/labs/brave-1791558) — deleted APT repo bucket + live install guide
* [Shopify #1295497](/docs/labs/shopify-1295497) — released Elastic IP + live DNS A record
* [Brave #1835133](/docs/labs/brave-1835133) — dangling RPM repository reference
* [HackerOne #1598347](/docs/labs/hackerone-1598347) — deleted widget bucket + live script tag (XSS)
* [IBM #2498255](/docs/labs/ibm-2498255) — inherited DNS from subsidiary merger

## Presigned URL & Policy Scope (4 cases)[​](#presigned-url--policy-scope-4-cases "Direct link to Presigned URL & Policy Scope (4 cases)")

Upload policies scoped too wide. Can you prove the write boundary is broken from the policy alone?

* [Unikrn #254200](/docs/labs/unikrn-254200) — shared prefix breaks tenant isolation
* [Shopify #93691](/docs/labs/shopify-93691) — shared prefix allows cross-merchant overwrite
* [BCM #764243](/docs/labs/bcm-764243) — empty starts-with allows write to any key
* [Shopify #94087](/docs/labs/shopify-94087) — prefix one level too wide allows cross-tenant write

## Compound & Cross-Service (6 cases)[​](#compound--cross-service-6-cases "Direct link to Compound & Cross-Service (6 cases)")

Multi-resource attack chains where no single setting is the vulnerability. The risk emerges from how settings combine across resources.

These are the strongest Stave differentiator — graph-level findings that single-resource scanners cannot produce.

* [DoD #2083771](/docs/labs/dod-2083771) — Jenkins console + IMDSv1 = credential theft chain
* [Shopify #98819](/docs/labs/shopify-98819) — anonymous write (ACL) + cross-account read (policy) = data injection pipeline
* [Kubernetes #1580493](/docs/labs/kubernetes-1580493) — EKS aws-auth maps AccessKeyID as identity
* [AWS #3021451](/docs/labs/aws-3021451) — CloudTrail configured but ElastiCache calls bypass logging
* [AWS #3022516](/docs/labs/aws-3022516) — CloudTrail configured but Forecast calls not delivered
* [Kubernetes #1238482](/docs/labs/kubernetes-1238482) — controller reconciles SGs from unchecked annotations
