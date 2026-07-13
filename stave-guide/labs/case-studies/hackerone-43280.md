---
title: "The bucket that shipped attachments in the clear"
sidebar_label: "HackerOne #43280"
sidebar_position: 26
description: "Both HTTP and HTTPS serve the same objects — can you prove, from the policy alone, that nothing is leaking on the wire?"
---

## Metadata

- **Title:** The bucket that shipped attachments in the clear
- **Source of the case:** HackerOne report #43280
- **AWS service(s):** S3
- **Risk archetype:** false protection — encryption "available" but not enforced
- **One-line hook:** Can you prove this attachment bucket can't be read over plaintext HTTP?

---

## 0. The challenge (what the reader does first)

**Scenario given to the reader:**

A company stores user-uploaded attachments in an S3 bucket. The bucket is reachable
over both HTTP and HTTPS, and the team assumes "we use HTTPS everywhere" makes it
safe. The bucket policy document exists but its `Statement` array is empty. TLS is
offered by the endpoint, so a quick check sees a green padlock and moves on.

**Evidence they're handed (and nothing else):**

```json
{
  "bucket": "hackerone-attachments",
  "bucket_policy": {"Statement": []},
  "secure_transport_enforced": false,
  "http_accessible": true,
  "https_accessible": true
}
```

- The bucket name, its (empty) policy, and the transport facts above.
- No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. Is plaintext HTTP access to objects in this bucket possible *right now*?
2. The endpoint serves HTTPS today — does that prevent a client (or an attacker on
   the path) from simply requesting the same object over HTTP and getting it?
3. Which path exposes data: a missing TLS certificate, or a missing *policy
   condition* that refuses non-TLS requests?
4. What is actually at risk during a plaintext transfer — object bytes only, or also
   auth headers and presigned-URL parameters?
5. What single rule, applied to the policy, would make HTTP access impossible
   regardless of how a client connects?

---

## 1. The manual problem

To answer by hand, the team has to separate two things that look identical from the
outside: TLS being *available* and TLS being *required*. The padlock in a browser
proves the first and says nothing about the second. To prove the second, someone has
to read the bucket policy, confirm there is a `Deny` keyed on
`aws:SecureTransport=false`, and confirm no other statement overrides it.

Here the policy is empty, so there is nothing to read — which is exactly the trap.
An empty policy is not "secure by default"; it is "no transport requirement at all."
The reviewer has to know that absence of a deny means HTTP is permitted, then
cross-check that against every client and presigned URL that might be generated
without the `https://` scheme. There is no single artifact that says "plaintext is
refused." The proof has to be reconstructed from what *isn't* in the policy.

---

## 2. The reasoning wall (capture, don't invent)

| What they hit | What they said / would say |
| --- | --- |
| TLS available vs. TLS required | "The site loads over HTTPS, so what's the problem?" |
| Empty policy read as safe | "There's no policy, so there's nothing wrong — right?" |
| Presigned URLs and headers | "I only thought about the file contents, not the auth header that rides along." |

**The insight the reader should reach on their own:**

> An endpoint that *offers* HTTPS but still *answers* HTTP has not enforced anything —
> enforcement is a deny rule, not a capability.

---

## 3. Why scanners miss or flatten it

A per-setting scanner checks "is TLS supported?" and gets `yes`, then reports the
bucket as encrypted-in-transit and moves on. That report is correct about the
capability and wrong about the guarantee. The thing it cannot see is the *negative*:
that no statement in the policy refuses a request when `aws:SecureTransport` is
false. The risk lives in the gap between "HTTPS is possible" and "HTTP is
impossible," and a checkbox-per-setting model has no cell for "the absence of a deny
condition." It flattens an enforcement question into a support question.

---

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it.
> The reader has now done the work and hit the wall. Only now does the tool appear.

---

## 4. The evidence Stave consumes

The same static facts the reader had — the bucket's policy document and its observed
transport state — captured as an observation snapshot. No live AWS calls, no new
privileges.

```json
{
  "bucket": "hackerone-attachments",
  "bucket_policy": {"Statement": []},
  "secure_transport_enforced": false,
  "http_accessible": true,
  "https_accessible": true
}
```

- Normalization: the bucket policy is parsed into statements; the absence of a
  `Deny` keyed on `aws:SecureTransport=false` is recorded as `secure_transport_enforced: false`.

---

## 5. The reasoning Stave performs

- **Control / invariant:** `CTL.S3.ENCRYPT.002` — every bucket must deny all actions
  when the request is not made over TLS.
- **What it evaluates:** does the bucket policy contain a statement with
  `Effect: Deny`, `Condition: {"Bool": {"aws:SecureTransport": "false"}}`, applied to
  all principals and all bucket actions? If not, plaintext access is permitted.
- **Verdict produced:** NON_COMPLIANT when no such deny exists. There is no "unknown"
  here — an empty or missing statement is a definite absence of enforcement, which is
  itself the violation.

```text
control: CTL.S3.ENCRYPT.002
asset:   s3://hackerone-attachments
evidence: bucket_policy.Statement = [] (no aws:SecureTransport=false deny)
          http_accessible = true
verdict: NON_COMPLIANT — plaintext HTTP access to objects is permitted
```

---

## 6. The prevention artifact Stave produces

- **Artifact:** a bucket-policy `Deny` statement keyed on `aws:SecureTransport=false`,
  ready to merge into the bucket policy.
- **What it forecloses:** the exact latent state from question 2 — a client or
  on-path attacker requesting the object over HTTP and getting it. With the deny in
  place, every non-TLS request is refused regardless of which scheme the caller picks.

```text
{
  "Sid": "DenyInsecureTransport",
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:*",
  "Resource": [
    "arn:aws:s3:::hackerone-attachments",
    "arn:aws:s3:::hackerone-attachments/*"
  ],
  "Condition": { "Bool": { "aws:SecureTransport": "false" } }
}
```

---

## 7. What the team no longer does manually

| Before | After Stave |
| --- | --- |
| Read each bucket policy to confirm a TLS-deny exists | One control proves the deny is present or fails the bucket |
| Trust the browser padlock as proof of enforcement | Enforcement is checked as a policy condition, not a capability |
| Reconstruct "HTTP is impossible" from what's missing | The absence of the deny is reported directly as the violation |

---

## Positioning line for this case

> Stave proves that an attachment bucket refuses plaintext HTTP — not by checking
> that TLS is offered, but by checking that a `aws:SecureTransport=false` deny makes
> HTTP impossible — and emits the exact policy statement that closes the gap.

---

## Reuse checklist

- [x] A reader could attempt section 0 with zero Stave knowledge
- [x] Stave is not named or shown before the pivot point
- [x] Section 2 quotes are real (or honestly plausible), not slogans
- [x] Section 3 names the *specific* thing per-setting tools can't see
- [x] Section 6 closes the exact latent state raised in section 0, question 2
- [x] The title names the failure, not the product
