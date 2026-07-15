# What you just discovered

If you completed the five questions, you experienced the reasoning gap firsthand. Here's what it looks like:

**Question 1 was easy.** A scanner would have found the same public buckets. `Principal: *` in a policy or `AllUsers` in an ACL — grep handles it.

**Question 2 was hard.** Bucket #3 is safe today because its Public Access Block overrides a permissive bucket policy. If the block is removed — which happens when the Terraform module it's managed by is re-applied without the block variable set — the policy takes effect immediately. This is a latent exposure. It's not dangerous now. It becomes dangerous on the next `terraform apply` that omits one variable.

No scanner reports this because the bucket is currently safe. The danger is in the configuration's relationship to itself, not in its current state.

**Question 3 exposed redundant paths.** Bucket #11 has both an ACL grant and a bucket policy grant that allow public read. Fixing the policy alone leaves the ACL path open. Fixing the ACL alone leaves the policy path open. You have to fix both. A scanner that reports "bucket is public" doesn't tell you there are two independent paths to close.

**Question 4 required understanding the blast radius.** Blocking everything is the safe default — but it breaks legitimate access patterns. Bucket #9 serves a public static website. Bucket #14 has a bucket policy scoped to a VPC endpoint that isn't public but uses `Principal: *` with a condition. Blocking public policies would break both, but only one of them is actually exposed.

**Question 5 asked for prevention, not detection.** A rule like "S3 buckets with data classification PHI must have `BlockPublicPolicy: true` AND no `Principal: *` in bucket policies" is evaluable from static configuration. It doesn't need runtime evidence. It runs before the dangerous state ever exists.

## The gap[​](#the-gap "Direct link to The gap")

Cloud security failure is a reasoning failure, not a scanning failure.

The configuration was there. The evidence was there. The gap was the reasoning — the ability to evaluate what configurations mean in combination, what they could become, and what rule would prevent the dangerous state from ever existing.

Scanners detect the current state. They answer Question 1. They don't answer Questions 2-5 because those require reasoning across multiple configuration surfaces, temporal projection, and prevention logic.

***

**Next:** [Browse the cases by attack pattern](/docs/labs/case-studies.md) — pick the category closest to your concern.
