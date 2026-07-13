---
title: "The Five Questions"
sidebar_label: "Questions"
sidebar_position: 2
description: "Five questions about S3 security to answer from static configuration — before you see what Stave finds."
---

# The Five Questions

Answer each from the four JSON files. Write your answers down before
checking the debrief.

## Question 1: Which buckets are publicly readable right now?

List every bucket where an unauthenticated user can read objects today.
For each, state whether the exposure is from the bucket policy, the ACL,
or both.

## Question 2: Which buckets could become publicly readable?

List every bucket that is NOT public today but WOULD become public if
one configuration setting changed. Name the setting.

## Question 3: Redundant exposure paths

For each public bucket from Question 1: does fixing the bucket policy
alone eliminate the exposure? Or does the ACL also need to change?
Identify any bucket where two independent paths grant public access.

## Question 4: What breaks if you block everything?

If you applied `BlockPublicPolicy: true` and `BlockPublicAcls: true`
to every bucket, which existing access patterns would stop working?
Name the buckets and the access that would break.

## Question 5: Write a prevention rule

Write a rule — in plain English — that would have prevented the most
dangerous exposure you found. The rule should be evaluable from static
configuration alone (no runtime behavior, no CloudTrail logs).

---

When you have your answers, proceed to [Run Stave](now-run-stave) to
see what the engine finds.

If you gave up or want to skip ahead, that's fine — the next step
shows what the exercise was designed to reveal.
