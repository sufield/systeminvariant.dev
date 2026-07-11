# The Five Questions

Answer each from the four JSON files. Write your answers down before checking the debrief.

## Question 1: Which buckets are publicly readable right now?[​](#question-1-which-buckets-are-publicly-readable-right-now "Direct link to Question 1: Which buckets are publicly readable right now?")

List every bucket where an unauthenticated user can read objects today. For each, state whether the exposure is from the bucket policy, the ACL, or both.

## Question 2: Which buckets could become publicly readable?[​](#question-2-which-buckets-could-become-publicly-readable "Direct link to Question 2: Which buckets could become publicly readable?")

List every bucket that is NOT public today but WOULD become public if one configuration setting changed. Name the setting.

## Question 3: Redundant exposure paths[​](#question-3-redundant-exposure-paths "Direct link to Question 3: Redundant exposure paths")

For each public bucket from Question 1: does fixing the bucket policy alone eliminate the exposure? Or does the ACL also need to change? Identify any bucket where two independent paths grant public access.

## Question 4: What breaks if you block everything?[​](#question-4-what-breaks-if-you-block-everything "Direct link to Question 4: What breaks if you block everything?")

If you applied `BlockPublicPolicy: true` and `BlockPublicAcls: true` to every bucket, which existing access patterns would stop working? Name the buckets and the access that would break.

## Question 5: Write a prevention rule[​](#question-5-write-a-prevention-rule "Direct link to Question 5: Write a prevention rule")

Write a rule — in plain English — that would have prevented the most dangerous exposure you found. The rule should be evaluable from static configuration alone (no runtime behavior, no CloudTrail logs).

***

When you have your answers, proceed to [Run Stave](/docs/labs/now-run-stave.md) to see what the engine finds.

If you gave up or want to skip ahead, that's fine — the next step shows what the exercise was designed to reveal.
