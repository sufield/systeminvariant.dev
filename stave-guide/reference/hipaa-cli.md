---
title: "HIPAA Per-Control CLI Evidence"
sidebar_label: "HIPAA CLI Evidence"
description: "Per-control AWS CLI evidence commands, expected output shapes, and pass/fail observation JSON for HIPAA S3 controls."
---

# HIPAA Per-Control CLI Evidence

Control-by-control mapping to AWS docs, the AWS CLI command to collect
evidence, the CLI output shape to expect, and the pass/fail JSON structures
used in the observation schema.

**AWS docs as source of truth.** Where AWS docs show an explicit CLI example,
that shape is used directly. Where AWS docs define the response schema but do
not show the exact S3 example, the JSON is marked as **representative of the
documented output schema**.

See also: [HIPAA S3 control mapping](hipaa-table.md) for the full
HIPAA-section-to-control table, and the
[HIPAA Compliance how-to](../how-to/compliance/hipaa-compliance.md) for running the
HIPAA pack.

---

## AUDIT.002 — object-level logging

**What AWS says**

S3 object-level logging is a **CloudTrail data event** concern, not S3 server
access logging. AWS states that data events include S3 object API activity such
as `GetObject`, `PutObject`, and `DeleteObject`, and that trails do **not** log
data events by default. AWS also documents that `AWS::S3::Object` is the
resource type used in event selectors.

**CLI evidence**

```bash
aws cloudtrail get-event-selectors --trail-name <trail-name>
```

**CLI output shown by AWS docs**

```json
{
  "EventSelectors": [
    {
      "IncludeManagementEvents": true,
      "DataResources": [],
      "ReadWriteType": "All"
    }
  ],
  "TrailARN": "arn:aws:cloudtrail:us-east-1:123456789012:trail/Trail1"
}
```

A trail without matching data event selectors will not log S3 object data
events.

### Pass JSON structure

Use this when at least one selector covers `AWS::S3::Object` for the target
bucket, prefix, or all S3 buckets.

```json
{
  "audit": {
    "object_level_logging": {
      "enabled": true,
      "source": "cloudtrail",
      "trail_arn": "arn:aws:cloudtrail:us-east-1:123456789012:trail/org-trail",
      "selectors": [
        {
          "read_write_type": "All",
          "include_management_events": true,
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

### Fail JSON structure

Use this when no selector covers S3 object data events.

```json
{
  "audit": {
    "object_level_logging": {
      "enabled": false,
      "source": "cloudtrail",
      "trail_arn": "arn:aws:cloudtrail:us-east-1:123456789012:trail/Trail1",
      "selectors": [
        {
          "read_write_type": "All",
          "include_management_events": true,
          "data_resources": []
        }
      ],
      "reason": "No CloudTrail data event selector for AWS::S3::Object"
    }
  }
}
```

---

## ACCESS.003 — VPC endpoint

**What AWS says**

AWS documents that Amazon S3 supports **gateway** and **interface** VPC
endpoints. A gateway endpoint lets a VPC access S3 without an internet gateway
or NAT. AWS CLI `describe-vpc-endpoints` returns endpoint objects with fields
such as `VpcEndpointType`, `ServiceName`, `VpcEndpointId`, `RouteTableIds`, and
`PolicyDocument`.

**CLI evidence**

```bash
aws ec2 describe-vpc-endpoints \
  --filters Name=service-name,Values=com.amazonaws.<region>.s3
```

**Representative CLI output shape from AWS docs**

```json
{
  "VpcEndpoints": [
    {
      "PolicyDocument": "{\"Version\":\"2008-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"*\",\"Resource\":\"*\"}]}",
      "VpcId": "vpc-12345678",
      "RouteTableIds": [
        "rtb-11111111"
      ],
      "State": "available",
      "ServiceName": "com.amazonaws.us-east-1.s3",
      "VpcEndpointId": "vpce-0123456789abcdef0",
      "VpcEndpointType": "Gateway",
      "CreationTimestamp": "2026-03-30T10:00:00Z",
      "OwnerId": "123456789012"
    }
  ]
}
```

### Pass JSON structure

```json
{
  "network": {
    "s3_vpc_endpoints": [
      {
        "vpc_endpoint_id": "vpce-0123456789abcdef0",
        "service_name": "com.amazonaws.us-east-1.s3",
        "vpc_endpoint_type": "Gateway",
        "state": "available",
        "vpc_id": "vpc-12345678",
        "route_table_ids": [
          "rtb-11111111"
        ],
        "present": true
      }
    ]
  }
}
```

### Fail JSON structure

```json
{
  "network": {
    "s3_vpc_endpoints": [],
    "s3_vpc_endpoint_required": true,
    "reason": "No S3 VPC endpoint found for service com.amazonaws.us-east-1.s3"
  }
}
```

---

## ACCESS.006 — VPC endpoint policy

**What AWS says**

AWS says a VPC endpoint policy is a JSON resource policy attached to the
endpoint. If you do not attach one, AWS attaches the **default endpoint
policy**, which grants full access. For gateway endpoints, `Principal` must be
`*`. AWS CLI returns the endpoint `PolicyDocument` in `describe-vpc-endpoints`.

**CLI evidence**

```bash
aws ec2 describe-vpc-endpoints \
  --filters Name=service-name,Values=com.amazonaws.<region>.s3
```

**Key AWS default policy**

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

AWS documents this as the default endpoint policy.

### Pass JSON structure

Use this when the endpoint policy is **not** the default full-access policy and
matches your restriction model.

```json
{
  "network": {
    "s3_vpc_endpoint_policy": {
      "attached": true,
      "is_default_full_access": false,
      "vpc_endpoint_id": "vpce-0123456789abcdef0",
      "policy": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
              "s3:GetObject"
            ],
            "Resource": [
              "arn:aws:s3:::example-bucket/*"
            ],
            "Condition": {
              "StringEquals": {
                "aws:PrincipalArn": "arn:aws:iam::123456789012:role/app-role"
              }
            }
          }
        ]
      }
    }
  }
}
```

### Fail JSON structure

Use this when the endpoint policy is missing or is the default full-access
policy.

```json
{
  "network": {
    "s3_vpc_endpoint_policy": {
      "attached": true,
      "is_default_full_access": true,
      "vpc_endpoint_id": "vpce-0123456789abcdef0",
      "policy": {
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "*",
            "Resource": "*"
          }
        ]
      },
      "reason": "Endpoint policy is default full-access policy"
    }
  }
}
```

---

## ACCESS.009 — presigned URL restriction

**What AWS says**

AWS documents S3 Signature Version 4 condition keys for bucket policies,
including `s3:signatureAge` and `s3:authType`. AWS gives explicit bucket policy
examples: one denies presigned URL requests when the signature is older than 10
minutes, and one denies requests unless authentication uses the `Authorization`
header, which blocks POST or presigned URL requests. AWS CLI `get-bucket-policy`
returns the bucket policy as a JSON string.

**CLI evidence**

```bash
aws s3api get-bucket-policy --bucket <bucket-name>
```

**CLI output shown by AWS docs**

```json
{
  "Policy": "{\"Version\":\"2008-10-17\",\"Statement\":[{\"Sid\":\"\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::amzn-s3-demo-bucket/*\"},{\"Sid\":\"\",\"Effect\":\"Deny\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::amzn-s3-demo-bucket/secret/*\"}]}"
}
```

The `Policy` field is a JSON document returned as a string.

### Pass JSON structure

Use this when the bucket policy contains a deny guardrail with S3 SigV4
condition keys relevant to presigned URLs.

```json
{
  "access": {
    "presigned_url_restriction": {
      "bucket_policy_present": true,
      "restricted": true,
      "policy_checks": {
        "has_signature_age_guardrail": true,
        "signature_age_ms_max": 600000,
        "has_auth_type_guardrail": true,
        "allowed_auth_type": "REST-HEADER"
      },
      "matching_statements": [
        {
          "sid": "DenyOldPresignedUrls",
          "effect": "Deny",
          "condition": {
            "NumericGreaterThan": {
              "s3:signatureAge": 600000
            }
          }
        },
        {
          "sid": "DenyPresignedUrls",
          "effect": "Deny",
          "condition": {
            "StringNotEquals": {
              "s3:authType": "REST-HEADER"
            }
          }
        }
      ]
    }
  }
}
```

### Fail JSON structure

Use this when the bucket policy is absent or present but lacks both condition
keys.

```json
{
  "access": {
    "presigned_url_restriction": {
      "bucket_policy_present": true,
      "restricted": false,
      "policy_checks": {
        "has_signature_age_guardrail": false,
        "has_auth_type_guardrail": false
      },
      "reason": "Bucket policy does not contain s3:signatureAge or s3:authType guardrails"
    }
  }
}
```

---

## Observation areas for these controls

Based on AWS's configuration boundaries, these controls draw on the following
observation areas:

```json
{
  "audit": {
    "object_level_logging": {
      "enabled": true,
      "source": "cloudtrail",
      "trail_arn": "string",
      "selectors": []
    }
  },
  "network": {
    "s3_vpc_endpoints": [],
    "s3_vpc_endpoint_policy": {
      "attached": true,
      "is_default_full_access": false,
      "policy": {}
    }
  },
  "access": {
    "presigned_url_restriction": {
      "bucket_policy_present": true,
      "restricted": true,
      "policy_checks": {
        "has_signature_age_guardrail": true,
        "has_auth_type_guardrail": true
      }
    }
  }
}
```

This matches AWS's actual service split:

* CloudTrail for S3 object data events.
* EC2/VPC for S3 endpoint inventory and endpoint policy.
* S3 bucket policy for presigned URL restrictions.

[1]: https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/get-event-selectors.html "get-event-selectors — AWS CLI 2.34.19 Command Reference"
[2]: https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html "Logging data events - AWS CloudTrail"
[3]: https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html "Gateway endpoints for Amazon S3 - Amazon Virtual Private Cloud"
[4]: https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-vpc-endpoints.html "describe-vpc-endpoints — AWS CLI 2.34.14 Command Reference"
[5]: https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-access.html "Control access to VPC endpoints using endpoint policies - Amazon Virtual Private Cloud"
[6]: https://docs.aws.amazon.com/AmazonS3/latest/API/bucket-policy-s3-sigv4-conditions.html "Amazon S3 Signature Version 4 Authentication Specific Policy Keys - Amazon Simple Storage Service"
[7]: https://docs.aws.amazon.com/prescriptive-guidance/latest/presigned-url-best-practices/appendix-b.html "Appendix B: How controls for presigned URLs affect AWS services - AWS Prescriptive Guidance"
[8]: https://docs.aws.amazon.com/cli/latest/reference/s3api/get-bucket-policy.html "get-bucket-policy — AWS CLI 2.34.14 Command Reference"

---

# Directly testable HIPAA controls — CLI evidence detail

For each directly testable item: the HIPAA section, the AWS source, the AWS CLI
command, the CLI output shape, the pass JSON, and the fail JSON. HIPAA defines
the **requirement**; the AWS CLI provides the **evidence**.

## Encryption

### HIPAA mapping

**45 CFR § 164.312(a)(2)(iv) – Encryption and decryption.** The rule says to
implement a mechanism to encrypt and decrypt electronic protected health
information. It is an **addressable** implementation specification, not an
automatic exemption.

### AWS source

AWS documents S3 bucket default encryption and the `get-bucket-encryption` CLI.
AWS also states that buckets now have default encryption using SSE-S3 unless
configured otherwise, and the API returns the active encryption configuration.

* `get-bucket-encryption`: [AWS CLI get-bucket-encryption](https://docs.aws.amazon.com/cli/latest/reference/s3api/get-bucket-encryption.html)
* S3 default encryption: [AWS S3 default bucket encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-bucket-encryption.html)

### CLI command

```bash
aws s3api get-bucket-encryption --bucket <bucket-name>
```

### CLI output shape

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

### Pass JSON

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

### Fail JSON

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

---

## Public access block

### HIPAA mapping

This supports **45 CFR § 164.312(a)(1) – Access Control**, which requires
technical policies and procedures to allow access only to authorized persons or
software programs. Public access block is not named in HIPAA, but it is a strong
AWS control for preventing unauthorized public exposure.

### AWS source

AWS documents bucket-level public access block and the four flags returned by
`get-public-access-block`. AWS also notes that effective behavior can also
depend on account-level settings.

* `get-public-access-block`: [AWS CLI get-public-access-block](https://docs.aws.amazon.com/cli/latest/reference/s3api/get-public-access-block.html)
* API: [S3 GetPublicAccessBlock](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetPublicAccessBlock.html)

### CLI command

```bash
aws s3api get-public-access-block --bucket <bucket-name>
```

### CLI output shape

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

### Pass JSON

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

### Fail JSON

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

---

## Transport security

### HIPAA mapping

**45 CFR § 164.312(e)(1) – Transmission security** requires technical security
measures to guard against unauthorized access to ePHI transmitted over an
electronic communications network.

### AWS source

AWS recommends using a bucket policy with `aws:SecureTransport` to deny non-HTTPS
requests. AWS gives explicit example policies. `get-bucket-policy` returns the
bucket policy as a JSON string.

* HTTPS enforcement with S3 bucket policy: [Protecting data in transit](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingEncryptionInTransit.html)
* Policy example using `aws:SecureTransport`: [S3 bucket policy examples](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html)
* `get-bucket-policy`: [AWS CLI get-bucket-policy](https://docs.aws.amazon.com/cli/latest/reference/s3api/get-bucket-policy.html)

### CLI command

```bash
aws s3api get-bucket-policy --bucket <bucket-name>
```

### CLI output shape

The CLI returns this wrapper shape, with the policy itself inside the `Policy`
string.

```json
{
  "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Deny\",\"Principal\":\"*\",\"Action\":\"s3:*\",\"Resource\":[\"arn:aws:s3:::example-bucket\",\"arn:aws:s3:::example-bucket/*\"],\"Condition\":{\"Bool\":{\"aws:SecureTransport\":\"false\"}}}]}"
}
```

### Pass JSON

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

### Fail JSON

```json
{
  "transport_security": {
    "bucket_policy_present": true,
    "https_only_enforced": false,
    "reason": "Bucket policy does not deny requests where aws:SecureTransport is false"
  }
}
```

---

## Logging

### HIPAA mapping

**45 CFR § 164.312(b) – Audit controls** requires mechanisms that record and
examine activity in information systems that contain or use ePHI. AWS S3
evidence splits into two parts:

* **server access logging**
* **CloudTrail data events for object-level access**

### AWS source

AWS documents `get-bucket-logging` for server access logging and CloudTrail
data events for object operations. AWS also states that S3 object data events
are CloudTrail data events and are not logged by default unless configured on
the trail.

* `get-bucket-logging`: [AWS CLI get-bucket-logging](https://docs.aws.amazon.com/cli/latest/reference/s3api/get-bucket-logging.html)
* Example output: [AWS CLI v1 get-bucket-logging example](https://docs.aws.amazon.com/cli/v1/reference/s3api/get-bucket-logging.html)
* CloudTrail S3 data events: [CloudTrail data events for S3](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html)
* `get-event-selectors`: [AWS CLI get-event-selectors](https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/get-event-selectors.html)

### CLI commands

```bash
aws s3api get-bucket-logging --bucket <bucket-name>
aws cloudtrail get-event-selectors --trail-name <trail-name>
```

### CLI output shapes

**Server access logging**

```json
{
  "LoggingEnabled": {
    "TargetPrefix": "",
    "TargetBucket": "example-bucket-logs"
  }
}
```

**CloudTrail data events**

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

### Pass JSON

```json
{
  "logging": {
    "server_access_logging": {
      "enabled": true,
      "target_bucket": "example-bucket-logs",
      "target_prefix": ""
    },
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
    },
    "compliant": true
  }
}
```

### Fail JSON

```json
{
  "logging": {
    "server_access_logging": {
      "enabled": false
    },
    "object_level_logging": {
      "enabled": false
    },
    "compliant": false,
    "reason": "Neither bucket server access logging nor CloudTrail S3 object data event logging is configured"
  }
}
```

---

## Integrity

### HIPAA mapping

**45 CFR § 164.312(c)(1) – Integrity** requires policies and procedures to
protect ePHI from improper alteration or destruction. S3 Versioning and Object
Lock are strong AWS controls for this.

### AWS source

AWS documents `get-bucket-versioning` and states it returns the bucket
versioning state and MFA delete state. AWS also documents
`GetObjectLockConfiguration` for object lock configuration.

* `get-bucket-versioning`: [S3 GetBucketVersioning API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketVersioning.html)
* Versioning guide: [Enabling versioning on buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/manage-versioning-examples.html)
* Object Lock example: [GetObjectLockConfiguration](https://docs.aws.amazon.com/AmazonS3/latest/API/s3_example_s3_GetObjectLockConfiguration_section.html)

### CLI commands

```bash
aws s3api get-bucket-versioning --bucket <bucket-name>
aws s3api get-object-lock-configuration --bucket <bucket-name>
```

### CLI output shapes

**Versioning**

```json
{
  "Status": "Enabled",
  "MFADelete": "Enabled"
}
```

**Object Lock**

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

### Pass JSON

```json
{
  "integrity": {
    "versioning": {
      "enabled": true,
      "mfa_delete": true
    },
    "object_lock": {
      "enabled": true,
      "mode": "COMPLIANCE",
      "days": 30
    },
    "compliant": true
  }
}
```

### Fail JSON

```json
{
  "integrity": {
    "versioning": {
      "enabled": false,
      "mfa_delete": false
    },
    "object_lock": {
      "enabled": false
    },
    "compliant": false,
    "reason": "Bucket versioning is not enabled and object lock is not configured"
  }
}
```

---

# Mappable, but not fully checkable from a bucket-only S3 snapshot

These are real HIPAA requirements, but they need more than bucket config.

## § 164.312(a)(1) – Access Control

HIPAA requires technical policies and procedures for access control. In AWS S3,
that can involve IAM roles, bucket policies, ACLs, VPC endpoint policies, KMS
key policies, and application identity boundaries. Bucket-only evidence is not
enough to prove full compliance.

**What you can check**

* public access block
* bucket policy scope
* absence of public ACL/policy
* optional MFA delete

**What you cannot prove from bucket-only data**

* least privilege across IAM roles
* app-to-prefix scoping across all callers
* KMS authorization path
* network path constraints unless VPC endpoint data is included

### Partial pass JSON

```json
{
  "access_control": {
    "bucket_level_controls_present": true,
    "public_exposure_blocked": true,
    "least_privilege_globally_verified": false,
    "reason": "Bucket-only evidence cannot prove IAM-wide least privilege"
  }
}
```

---

## § 164.308(a)(1)(ii)(D) – Information system activity review

HIPAA requires regular review of logs, access reports, and security incident
tracking reports. That is a **process** requirement, not just a configuration
requirement. Logs existing is necessary, but not sufficient.

### What AWS config can prove

* logs are being generated

### What it cannot prove

* someone reviews them regularly
* review procedures exist
* alerts are triaged
* evidence is retained for audit

### Partial pass JSON

```json
{
  "activity_review": {
    "logs_collected": true,
    "regular_review_process_verified": false,
    "reason": "Configuration shows logging, not operational review"
  }
}
```

---

## § 164.308(a)(5)(ii)(B) – Protection from malicious software

HIPAA requires procedures for guarding against, detecting, and reporting
malicious software. S3 by itself does not scan uploaded files. This usually
needs GuardDuty Malware Protection, Lambda-based scanning, AV pipeline, or
another scanning system.

### Bucket-only limitation

You cannot prove malware protection from standard S3 bucket config alone.

### Partial pass JSON

```json
{
  "malware_protection": {
    "bucket_only_evidence": false,
    "requires_additional_service_data": true,
    "reason": "Need GuardDuty, Lambda scanning, or equivalent evidence"
  }
}
```

---

## § 164.502(b) – Minimum necessary

HIPAA says reasonable efforts must limit PHI to the minimum necessary. In AWS
this maps well to IAM policy scoping and prefix-level access boundaries, but
this is not provable from bucket config alone.

### What you need

* IAM role policies
* bucket policy conditions
* app identity mapping
* prefix/resource scope rules

### Partial pass JSON

```json
{
  "minimum_necessary": {
    "bucket_policy_scope_checked": true,
    "iam_scope_verified": false,
    "reason": "Need IAM policy evidence to verify minimum necessary access"
  }
}
```

---

## Breach notification rule – §§ 164.400–414

The breach notification rule governs what happens after discovery of a breach of
unsecured PHI. Detection tooling such as GuardDuty or AWS Config may help, but
those tools are not the rule itself. The rule focuses on breach determination
and notification duties.

### What AWS config can support

* fast detection of public exposure
* evidence for whether access occurred
* logs for incident investigation

### What it cannot prove

* legal breach determination
* notice timelines
* required notifications to individuals, HHS, or media

### Partial pass JSON

```json
{
  "breach_notification_support": {
    "misconfiguration_detection_present": true,
    "incident_evidence_available": true,
    "legal_notification_compliance_verified": false,
    "reason": "Need incident response and legal workflow evidence"
  }
}
```

[1]: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312 "45 CFR 164.312 -- Technical safeguards."
[2]: https://docs.aws.amazon.com/cli/latest/reference/s3api/get-bucket-encryption.html "get-bucket-encryption — AWS CLI 2.34.19 Command Reference"
[3]: https://docs.aws.amazon.com/cli/latest/reference/s3api/get-public-access-block.html "get-public-access-block"
[4]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html "Security best practices for Amazon S3"
[5]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazon-s3-policy-keys.html "Bucket policy examples using condition keys"
[6]: https://docs.aws.amazon.com/cli/latest/reference/s3api/get-bucket-logging.html "get-bucket-logging — AWS CLI 2.34.18 Command Reference"
[7]: https://docs.aws.amazon.com/cli/v1/reference/s3api/get-bucket-logging.html "get-bucket-logging — AWS CLI 1.44.51 Command Reference"
[8]: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketVersioning.html "GetBucketVersioning - Amazon Simple Storage Service"
[9]: https://docs.aws.amazon.com/AmazonS3/latest/API/s3_example_s3_GetObjectLockConfiguration_section.html "Use GetObjectLockConfiguration with an AWS SDK or CLI"
[10]: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164 "45 CFR Part 164 -- Security and Privacy"
[11]: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308 "45 CFR 164.308 -- Administrative safeguards."
[12]: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.502 "45 CFR 164.502 -- Uses and disclosures of protected ..."
[13]: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D "45 CFR Part 164 Subpart D -- Notification in the Case of ..."
[14]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingEncryptionInTransit.html "Protecting data in transit with encryption"
