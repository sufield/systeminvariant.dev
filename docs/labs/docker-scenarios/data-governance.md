# Data Governance and Lifecycle

Backup bucket missing data classification, lifecycle rules, MFA delete, versioning, and Public Access Block -- a cascade of governance failures that compounds risk.

## Background[​](#background "Direct link to Background")

Data governance controls enforce organizational policies that prevent silent compliance drift. A bucket tagged `backup: true` and `data-retention: 7-years` declares its intent, but without the technical controls to match, the declaration is empty. Missing data classification means sensitivity-gated controls silently pass. Missing lifecycle rules mean data persists indefinitely. Missing MFA delete means any principal with delete permission can permanently destroy backup versions.

## Bucket[​](#bucket "Direct link to Bucket")

**`backup-compliance-archive`** -- tagged for backup and retention but missing every governance control. No data-classification tag, no versioning, no MFA delete, no lifecycle rules, and no Public Access Block.

## Triggered Controls[​](#triggered-controls "Direct link to Triggered Controls")

| Control                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `CTL.S3.GOVERNANCE.001` | Data Classification Tag Required                   |
| `CTL.S3.VERSION.001`    | Versioning Required                                |
| `CTL.S3.VERSION.002`    | Backup Buckets Must Have MFA Delete                |
| `CTL.S3.LIFECYCLE.001`  | Retention-Tagged Buckets Must Have Lifecycle Rules |
| `CTL.S3.CONTROLS.001`   | Public Access Block Must Be Enabled                |

## Expected Findings[​](#expected-findings "Direct link to Expected Findings")

5 violations on 1 resource.
