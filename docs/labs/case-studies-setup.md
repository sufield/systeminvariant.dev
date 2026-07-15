# Challenge Setup

You have 30 minutes. Use jq, grep, a text editor — whatever you want. No AWS account. No credentials. No special tools.

## Download the fixtures[​](#download-the-fixtures "Direct link to Download the fixtures")

```
# From the stave repo
cp -r stave/examples/challenge-fixtures/ ./challenge/
ls challenge/
```

You should see four files:

| File                        | What it contains                          |
| --------------------------- | ----------------------------------------- |
| `buckets.json`              | 14 S3 bucket configurations               |
| `bucket-policies.json`      | Bucket policy documents for each bucket   |
| `public-access-blocks.json` | Account-level and per-bucket PAB settings |
| `acls.json`                 | Bucket ACL grants                         |

## What you're looking at[​](#what-youre-looking-at "Direct link to What you're looking at")

These are real AWS configuration snapshots (sanitized). Each bucket has a different combination of:

* Public Access Block settings (some enabled, some disabled, some partial)
* Bucket policies (some allow `Principal: *`, some restrict by VPC, some have explicit Deny statements)
* ACL grants (some grant public read, some are private)

The configurations interact. A bucket can be "safe" because its Public Access Block overrides a permissive bucket policy — but if the block is removed, the policy takes effect immediately.

## Rules[​](#rules "Direct link to Rules")

* You may use any tool except a cloud security scanner
* The goal is to reason through the configurations yourself
* There are known answers — this is not open-ended
* 30 minutes is generous; most people spend 15-20 minutes

When you're ready, proceed to [the questions](/docs/labs/case-study-questions.md).
