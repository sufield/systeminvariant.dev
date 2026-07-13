---
title: "HIPAA S3 Control Mapping"
sidebar_label: "HIPAA Control Mapping"
description: "Mapping of HIPAA Security Rule sections to Stave S3 controls, with AWS CLI evidence and pass/fail observation shapes."
---

# HIPAA S3 Control Mapping

This reference maps HIPAA Security Rule sections (45 CFR §§ 164.3xx) to
Stave S3 controls, the AWS CLI command that produces the evidence, and the
pass/fail observation shapes each control evaluates.

See also: [HIPAA per-control CLI evidence](hipaa-cli.md) for the
control-by-control CLI output schemas, and the
[HIPAA Compliance how-to](../how-to/compliance/hipaa-compliance.md) for running the
HIPAA pack.

## S3 HIPAA pack control spec

| Control ID              | HIPAA section                        | What to check in AWS                                    | AWS CLI evidence                                            | Pass condition                                                       | Fail condition                            | Bucket-only?                                |
| ----------------------- | ------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| HIPAA.ENCRYPT.001       | 45 CFR § 164.312(a)(2)(iv)           | Default bucket encryption is enabled                    | `aws s3api get-bucket-encryption --bucket <bucket>`         | `ServerSideEncryptionConfiguration.Rules` exists                     | encryption config missing                 | Yes                                         |
| HIPAA.ENCRYPT.002       | 45 CFR § 164.312(a)(2)(iv)           | Prefer SSE-KMS for stronger key control                 | `aws s3api get-bucket-encryption --bucket <bucket>`         | `SSEAlgorithm = aws:kms`                                             | `SSEAlgorithm != aws:kms`                 | Yes                                         |
| HIPAA.PUBLIC.001        | 45 CFR § 164.312(a)(1)               | Bucket public access block is fully enabled             | `aws s3api get-public-access-block --bucket <bucket>`       | all four flags are `true`                                            | any flag is `false`                       | Yes, but account-level settings also matter |
| HIPAA.TRANSPORT.001     | 45 CFR § 164.312(e)(1)               | Bucket policy denies non-TLS requests                   | `aws s3api get-bucket-policy --bucket <bucket>`             | policy has `Deny` with `aws:SecureTransport = false`                 | no matching deny statement                | Yes                                         |
| HIPAA.AUDIT.001         | 45 CFR § 164.312(b)                  | Server access logging is enabled                        | `aws s3api get-bucket-logging --bucket <bucket>`            | `LoggingEnabled.TargetBucket` exists                                 | `LoggingEnabled` absent                   | Yes                                         |
| HIPAA.AUDIT.002         | 45 CFR § 164.312(b)                  | CloudTrail object-level data events are enabled         | `aws cloudtrail get-event-selectors --trail-name <trail>`   | selector includes `AWS::S3::Object` for target bucket or all buckets | no S3 object data selector                | No                                          |
| HIPAA.INTEGRITY.001     | 45 CFR § 164.312(c)(1)               | Bucket versioning is enabled                            | `aws s3api get-bucket-versioning --bucket <bucket>`         | `Status = Enabled`                                                   | `Status` absent or `Suspended`            | Yes                                         |
| HIPAA.INTEGRITY.002     | 45 CFR § 164.312(c)(1)               | Object Lock is enabled                                  | `aws s3api get-object-lock-configuration --bucket <bucket>` | `ObjectLockEnabled = Enabled`                                        | object lock config absent or disabled     | Yes                                         |
| HIPAA.ACCESS.001        | 45 CFR § 164.312(a)(1)               | No public bucket policy or ACL path to data             | bucket policy + public access block + ACL evidence          | no public read/list/write path                                       | any public path exists                    | Partly                                      |
| HIPAA.ACCESS.002        | 45 CFR § 164.312(a)(1), § 164.502(b) | Least privilege and minimum necessary scope             | IAM role policies, bucket policy scope, prefixes            | access limited to exact principals and prefixes needed               | broad bucket or object access beyond need | No                                          |
| HIPAA.REVIEW.001        | 45 CFR § 164.308(a)(1)(ii)(D)        | Logs are regularly reviewed                             | process evidence, alerts, review workflow                   | documented and operating review process                              | logs exist but no review evidence         | No                                          |
| HIPAA.MALWARE.001       | 45 CFR § 164.308(a)(5)(ii)(B)        | Uploaded files are scanned for malware                  | GuardDuty/Lambda/AV pipeline evidence                       | scanning pipeline exists and is active                               | no malware-scanning evidence              | No                                          |
| HIPAA.BREACHSUPPORT.001 | 45 CFR §§ 164.400–414                | Misconfigurations and suspicious access can be detected | GuardDuty, Config, CloudTrail, access logs                  | evidence exists for incident investigation                           | no detection/investigation evidence       | No                                          |
| HIPAA.REPLICATION.001   | 45 CFR § 164.308(a)(7)               | Compliance-tagged buckets have replication enabled       | `aws s3api get-bucket-replication --bucket <bucket>`        | `ReplicationConfiguration.Rules` exists and is Enabled               | replication config absent or disabled     | Yes                                         |
| HIPAA.REPLICATION.002   | 45 CFR § 164.308(a)(7)(ii)(A)        | PHI bucket replication is cross-region                  | `aws s3api get-bucket-replication --bucket <bucket>`        | destination bucket ARN is in a different region than source           | destination in same region as source      | Yes                                         |
| HIPAA.REPLICATION.003   | 45 CFR § 164.312(a)(2)(iv)           | Replication destination bucket is encrypted             | destination bucket encryption config                        | destination has SSE-S3 or SSE-KMS default encryption                 | destination encryption absent             | No                                          |
| HIPAA.MACIE.001         | 45 CFR § 164.312(b)                  | Macie enabled for sensitive data buckets                | `aws macie2 get-bucket-statistics`                          | Macie classification job active for bucket                           | Macie not enabled or no active job        | Yes                                         |
| HIPAA.MACIE.002         | 45 CFR § 164.308(a)(1)(ii)(D)        | Macie automated discovery is running                    | `aws macie2 get-automated-discovery-configuration`          | `status = ENABLED`                                                   | automated discovery disabled              | No                                          |
| HIPAA.OWNERSHIP.001     | 45 CFR § 164.312(a)(1)               | Object Ownership is BucketOwnerEnforced                 | `aws s3api get-bucket-ownership-controls --bucket <bucket>` | `OwnershipControls.Rules[0].ObjectOwnership = BucketOwnerEnforced`   | ObjectOwnership is not BucketOwnerEnforced| Yes                                         |
| HIPAA.OBJECTACL.001     | 45 CFR § 164.312(a)(1)               | No objects individually public via ACL                  | bucket public access status + object ACL audit              | no objects with public ACL grants                                    | objects can be public via ACL             | Partly                                      |
| HIPAA.ACCOUNTPAB.001    | 45 CFR § 164.312(a)(1)               | Account-level Block Public Access is enabled            | `aws s3control get-public-access-block --account-id <id>`   | all four account-level PAB flags are `true`                          | any account-level flag is `false`         | No                                          |
| HIPAA.INVENTORY.001     | 45 CFR § 164.312(b)                  | S3 Inventory enabled for bucket content visibility      | `aws s3api list-bucket-inventory-configurations --bucket <b>`| at least one inventory configuration exists                          | no inventory configuration                | Yes                                         |
| HIPAA.MFA.HWKEY.001    | 45 CFR § 164.312(d)                  | Privileged accounts use hardware MFA                    | `aws iam list-mfa-devices` + device type check              | admin users have hardware MFA device                                 | admin user has virtual/SMS MFA            | No                                          |
| HIPAA.INACTIVE.001     | 45 CFR § 164.312(a)(2)(i)            | IAM accounts inactive 90+ days are flagged              | `aws iam generate-credential-report` + last activity check  | no accounts inactive > 90 days                                       | accounts inactive > 90 days exist         | No                                          |
| HIPAA.ACCESS.PHI.001   | 45 CFR § 164.502(b)                  | PHI bucket access scoped to specific principals         | bucket policy + IAM role policies + prefix scoping          | access limited to exact principals and prefixes needed               | broad access beyond minimum necessary     | No                                          |
| HIPAA.MALWARE.001      | 45 CFR § 164.308(a)(5)(ii)(B)        | PHI bucket has malware scanning enabled                 | `aws guardduty get-detector` + S3 protection status         | GuardDuty S3 malware protection or Lambda AV active                  | no malware scanning configured            | Partly                                      |
| HIPAA.BREACHSUPPORT.001| 45 CFR §§ 164.400–414                | PHI bucket has all detection infrastructure active       | access logs + CloudTrail + GuardDuty + Config evidence       | all four detection components present                                | any component missing                     | No                                          |

## CLI output and pass/fail JSON

### HIPAA.ENCRYPT.001 / HIPAA.ENCRYPT.002

Source: AWS `GetBucketEncryption` says S3 returns the default encryption configuration, and by default buckets have SSE-S3 unless configured otherwise. ([AWS Documentation][1])

CLI:

```bash
aws s3api get-bucket-encryption --bucket <bucket>
```

Representative output:

```json
{
  "ServerSideEncryptionConfiguration": {
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "aws:kms",
          "KMSMasterKeyID": "arn:aws:kms:us-east-1:123456789012:key/11111111-2222-3333-4444-555555555555"
        },
        "BucketKeyEnabled": true
      }
    ]
  }
}
```

Pass:

```json
{
  "encryption": {
    "enabled": true,
    "mode": "aws:kms",
    "kms_key_id": "arn:aws:kms:us-east-1:123456789012:key/11111111-2222-3333-4444-555555555555",
    "bucket_key_enabled": true
  }
}
```

Fail:

```json
{
  "encryption": {
    "enabled": false,
    "mode": null,
    "kms_key_id": null,
    "bucket_key_enabled": false,
    "reason": "No compliant default bucket encryption configuration found"
  }
}
```

### HIPAA.PUBLIC.001

Source: AWS `GetPublicAccessBlock` returns the bucket-level public access block config only, and AWS says effective behavior also depends on account-level settings. ([AWS Documentation][2])

CLI:

```bash
aws s3api get-public-access-block --bucket <bucket>
```

Representative output:

```json
{
  "PublicAccessBlockConfiguration": {
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }
}
```

Pass:

```json
{
  "public_access": {
    "block_public_acls": true,
    "ignore_public_acls": true,
    "block_public_policy": true,
    "restrict_public_buckets": true,
    "compliant": true
  }
}
```

Fail:

```json
{
  "public_access": {
    "block_public_acls": true,
    "ignore_public_acls": false,
    "block_public_policy": true,
    "restrict_public_buckets": false,
    "compliant": false,
    "reason": "One or more PublicAccessBlock settings are not enabled"
  }
}
```

### HIPAA.TRANSPORT.001

HIPAA transmission security requires protection against unauthorized access during transmission. ([eCFR][3]) AWS supports this with bucket policy conditions, including TLS-related conditions. ([AWS Documentation][4])

CLI:

```bash
aws s3api get-bucket-policy --bucket <bucket>
```

Representative output:

```json
{
  "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Deny\",\"Principal\":\"*\",\"Action\":\"s3:*\",\"Resource\":[\"arn:aws:s3:::example-bucket\",\"arn:aws:s3:::example-bucket/*\"],\"Condition\":{\"Bool\":{\"aws:SecureTransport\":\"false\"}}}]}"
}
```

Pass:

```json
{
  "transport_security": {
    "bucket_policy_present": true,
    "https_only_enforced": true,
    "matching_statement": {
      "effect": "Deny",
      "condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  }
}
```

Fail:

```json
{
  "transport_security": {
    "bucket_policy_present": true,
    "https_only_enforced": false,
    "reason": "Bucket policy does not deny requests where aws:SecureTransport is false"
  }
}
```

### HIPAA.AUDIT.001

HIPAA audit controls require mechanisms that record and examine activity. ([eCFR][3]) AWS `get-bucket-logging` returns server access logging status. ([AWS Documentation][5])

CLI:

```bash
aws s3api get-bucket-logging --bucket <bucket>
```

Representative output:

```json
{
  "LoggingEnabled": {
    "TargetPrefix": "",
    "TargetBucket": "example-bucket-logs"
  }
}
```

Pass:

```json
{
  "logging": {
    "server_access_logging": {
      "enabled": true,
      "target_bucket": "example-bucket-logs",
      "target_prefix": ""
    }
  }
}
```

Fail:

```json
{
  "logging": {
    "server_access_logging": {
      "enabled": false
    },
    "reason": "Server access logging is not enabled"
  }
}
```

### HIPAA.AUDIT.002

CloudTrail supports S3 object data events, and `get-event-selectors` exposes whether those selectors are configured. ([AWS Documentation][6])

CLI:

```bash
aws cloudtrail get-event-selectors --trail-name <trail>
```

Representative output:

```json
{
  "EventSelectors": [
    {
      "IncludeManagementEvents": true,
      "DataResources": [
        {
          "Type": "AWS::S3::Object",
          "Values": [
            "arn:aws:s3:::example-bucket/"
          ]
        }
      ],
      "ReadWriteType": "All"
    }
  ],
  "TrailARN": "arn:aws:cloudtrail:us-east-1:123456789012:trail/org-trail"
}
```

Pass:

```json
{
  "logging": {
    "object_level_logging": {
      "enabled": true,
      "source": "cloudtrail",
      "trail_arn": "arn:aws:cloudtrail:us-east-1:123456789012:trail/org-trail",
      "selectors": [
        {
          "read_write_type": "All",
          "data_resources": [
            {
              "type": "AWS::S3::Object",
              "values": [
                "arn:aws:s3:::example-bucket/"
              ]
            }
          ]
        }
      ]
    }
  }
}
```

Fail:

```json
{
  "logging": {
    "object_level_logging": {
      "enabled": false,
      "reason": "No CloudTrail data event selector for AWS::S3::Object"
    }
  }
}
```

### HIPAA.INTEGRITY.001

HIPAA integrity requires protection against improper alteration or destruction. ([eCFR][3]) AWS says `GetBucketVersioning` returns the versioning state and MFA Delete status. ([AWS Documentation][7])

CLI:

```bash
aws s3api get-bucket-versioning --bucket <bucket>
```

Representative output:

```json
{
  "Status": "Enabled",
  "MFADelete": "Enabled"
}
```

Pass:

```json
{
  "integrity": {
    "versioning": {
      "enabled": true,
      "mfa_delete": true
    }
  }
}
```

Fail:

```json
{
  "integrity": {
    "versioning": {
      "enabled": false,
      "mfa_delete": false
    },
    "reason": "Bucket versioning is not enabled"
  }
}
```

### HIPAA.INTEGRITY.002

AWS says Object Lock uses a write-once-read-many model and prevents deletion or overwrite for a fixed time or indefinitely. It also requires versioning. ([AWS Documentation][8])

CLI:

```bash
aws s3api get-object-lock-configuration --bucket <bucket>
```

Representative output:

```json
{
  "ObjectLockConfiguration": {
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "COMPLIANCE",
        "Days": 30
      }
    }
  }
}
```

Pass:

```json
{
  "integrity": {
    "object_lock": {
      "enabled": true,
      "mode": "COMPLIANCE",
      "days": 30
    }
  }
}
```

Fail:

```json
{
  "integrity": {
    "object_lock": {
      "enabled": false
    },
    "reason": "Object lock is not configured"
  }
}
```

## Not fully provable from bucket-only data

These are valid HIPAA mappings, but bucket config alone cannot prove them:

| Control ID              | Why not bucket-only                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| HIPAA.ACCESS.002        | Need IAM role policies, caller identity paths, prefix scoping, maybe KMS and VPC evidence              |
| HIPAA.REVIEW.001        | HIPAA requires regular review procedures, not just log collection ([eCFR][9])                          |
| HIPAA.MALWARE.001       | Need GuardDuty, Lambda, or another malware-scanning pipeline                                           |
| HIPAA.BREACHSUPPORT.001 | Need incident detection and response evidence; breach notification is not just S3 config               |
| HIPAA.ACCESS.001        | Partly bucket-testable, but full proof may require IAM, ACL, policy, account-level public access block |

## Source links

* HIPAA technical safeguards: ([eCFR][3])
* HIPAA activity review requirement: ([eCFR][9])
* S3 GetBucketEncryption: ([AWS Documentation][1])
* S3 GetPublicAccessBlock: ([AWS Documentation][2])
* S3 bucket policy examples: ([AWS Documentation][10])
* S3 server access logging: ([AWS Documentation][5])
* CloudTrail S3 data events: ([AWS Documentation][6])
* S3 GetBucketVersioning: ([AWS Documentation][7])
* S3 Object Lock: ([AWS Documentation][8])

[1]: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketEncryption.html "GetBucketEncryption - Amazon Simple Storage Service"
[2]: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetPublicAccessBlock.html "GetPublicAccessBlock - Amazon Simple Storage Service"
[3]: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312 "
    eCFR :: 45 CFR 164.312 -- Technical safeguards.
  "
[4]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingEncryptionInTransit.html "Protecting data in transit with encryption"
[5]: https://docs.aws.amazon.com/code-library/latest/ug/s3_example_s3_GetBucketLogging_section.html "Use GetBucketLogging with a CLI"
[6]: https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/get-event-selectors.html "get-event-selectors - cloudtrail"
[7]: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketVersioning.html "GetBucketVersioning - Amazon Simple Storage Service"
[8]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-configure.html "Configuring S3 Object Lock - Amazon Simple Storage Service"
[9]: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C "
    eCFR :: 45 CFR Part 164 Subpart C -- Security Standards for the Protection of Electronic Protected Health Information
  "
[10]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html "Examples of Amazon S3 bucket policies - Amazon Simple Storage Service"
