# Import AWS Config Snapshots

If your AWS account has AWS Config enabled, your configuration snapshots are already sitting in an S3 bucket. This is the fastest path to your first finding if you already run Config — no new credentials, no collector setup.

## Find your Config delivery bucket[​](#find-your-config-delivery-bucket "Direct link to Find your Config delivery bucket")

```
aws configservice describe-delivery-channels --query 'DeliveryChannels[].s3BucketName'
```

## Sync snapshots locally[​](#sync-snapshots-locally "Direct link to Sync snapshots locally")

```
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET=your-config-delivery-bucket

aws s3 sync \
  s3://$BUCKET/AWSLogs/$ACCOUNT_ID/Config/ \
  ./config-snapshots/ \
  --exclude "*" \
  --include "*/ConfigSnapshot/*.json"
```

## Convert to observation format[​](#convert-to-observation-format "Direct link to Convert to observation format")

AWS Config snapshots use a different schema than Stave's `obs.v0.1`. Use `stave transform` to convert:

```
stave transform --source aws-config \
  --input ./config-snapshots/ \
  --output ./observations/
```

## Run the evaluation[​](#run-the-evaluation "Direct link to Run the evaluation")

```
stave apply --observations ./observations/
```

## What you get[​](#what-you-get "Direct link to What you get")

Config delivery snapshots cover all resource types Config records in your account. Stave evaluates the subset that matches its control catalog — S3, IAM, CloudTrail, KMS, Lambda, and 80+ more domains.

Resources Config doesn't record (or hasn't recorded yet) won't appear in findings. To extend coverage beyond what Config delivers, see [Create Snapshots](/docs/how-to/getting-started/create-snapshots.md) for AWS CLI and Steampipe collection recipes.
