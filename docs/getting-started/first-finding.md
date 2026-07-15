# Time To First Finding

Get your first finding against your own AWS environment. Pick the path that matches what you already have — lowest friction first.

## Already running AWS Config?[​](#already-running-aws-config "Direct link to Already running AWS Config?")

Your snapshots are already in S3. Sync them down and evaluate:

```
aws s3 sync s3://your-config-bucket/AWSLogs/ ./my-snapshot/
stave apply --observations ./my-snapshot/ --format text
```

For detailed import options, see [Import Config Snapshots](/docs/how-to/getting-started/import-config-snapshots.md).

## Have Steampipe?[​](#have-steampipe "Direct link to Have Steampipe?")

Export your Steampipe data and convert:

```
steampipe query "select * from aws_s3_bucket" --output json > steampipe-raw.json
stave transform -i ./steampipe-raw.json -o ./observations
stave apply --observations ./observations --format text
```

For the full guide, see [From Steampipe to Stave](/docs/labs/from-steampipe-to-stave.md).

## Starting from scratch?[​](#starting-from-scratch "Direct link to Starting from scratch?")

Extract S3 bucket configuration with the AWS CLI. This requires read-only access to the target account.

```
mkdir -p snapshot-raw
aws s3api list-buckets > snapshot-raw/list-buckets.json
for bucket in $(jq -r '.Buckets[].Name' snapshot-raw/list-buckets.json); do
  aws s3api get-public-access-block --bucket "$bucket" > "snapshot-raw/${bucket}-pab.json" 2>/dev/null || true
  aws s3api get-bucket-acl --bucket "$bucket" > "snapshot-raw/${bucket}-acl.json" 2>/dev/null || true
  aws s3api get-bucket-policy --bucket "$bucket" > "snapshot-raw/${bucket}-policy.json" 2>/dev/null || true
  aws s3api get-bucket-encryption --bucket "$bucket" > "snapshot-raw/${bucket}-encryption.json" 2>/dev/null || true
  aws s3api get-bucket-versioning --bucket "$bucket" > "snapshot-raw/${bucket}-versioning.json" 2>/dev/null || true
done
```

Convert to observations and evaluate:

```
stave transform -i ./snapshot-raw -o ./observations
stave apply --observations ./observations --format text
```

Stave never sees your credentials. The extractor runs in your terminal; Stave evaluates the resulting files offline.

## Reading the output[​](#reading-the-output "Direct link to Reading the output")

Exit code `3` means violations found — you have your first findings. Each finding names the control, the asset, and the remediation step.

Exit code `0` means your infrastructure is clean against the evaluated controls. Run `stave diagnose` to see why specific controls didn't fire (threshold too high, data shape issues, etc).

## What's next[​](#whats-next "Direct link to What's next")

You have findings with specific remediation guidance. Pick one and fix it, then re-snapshot and re-evaluate to confirm the fix worked.

***

**Next:** [Fix and Verify](/docs/getting-started/fix-and-verify.md) — remediate a finding and prove the fix worked.
