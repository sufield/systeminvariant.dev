---
title: "Invariants Reference"
sidebar_label: "Overview"
sidebar_position: 0
description: "Complete listing of all 43 Stave S3 invariants by category."
---

# Invariants Reference

Stave ships with 43 S3 invariants organized by category. Each invariant defines a safety property that your infrastructure must satisfy.

## Public Access (15 invariants)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| `INV.S3.PUBLIC.001` | No Public S3 Bucket Read | High | S3 buckets must not allow public read access |
| `INV.S3.PUBLIC.002` | No Public S3 Buckets With Sensitive Data | Critical | Public access on PHI/PII/confidential buckets |
| `INV.S3.PUBLIC.003` | No Public Write Access | Critical | S3 buckets must not allow public write or delete access |
| `INV.S3.PUBLIC.004` | No Public Read via ACL | High | S3 bucket ACLs must not grant read access to AllUsers |
| `INV.S3.PUBLIC.005` | No Latent Public Read Exposure | High | Public read masked only by PAB is still a risk |
| `INV.S3.PUBLIC.006` | No Latent Public Bucket Listing | High | Public listing masked only by PAB is still a risk |
| `INV.S3.PUBLIC.007` | No Public Read via Policy | High | Bucket policies must not grant public read to Principal * |
| `INV.S3.PUBLIC.008` | No Public List via Policy | High | Bucket policies must not grant anonymous listing to Principal * |
| `INV.S3.PUBLIC.LIST.001` | No Public S3 Bucket Listing | High | S3 buckets must not allow anonymous listing |
| `INV.S3.PUBLIC.LIST.002` | Anonymous S3 Listing Must Be Explicitly Intended | Medium | Public listing requires explicit `public_list_intended` tag |
| `INV.S3.PUBLIC.PREFIX.001` | Protected Prefixes Must Not Be Publicly Readable | High | Protected prefixes must not be publicly readable |
| `INV.S3.ACL.WRITE.001` | No Public Write via ACL | Critical | S3 bucket ACLs must not grant write to AllUsers |
| `INV.S3.WEBSITE.PUBLIC.001` | No Public Website Hosting with Public Read | High | Static website hosting must not combine with public read |
| `INV.S3.CONTROLS.001` | Public Access Block Must Be Enabled | High | S3 buckets must have PAB fully enabled |
| `INV.S3.INCOMPLETE.001` | Complete Data Required for Safety Assessment | High | Missing policy/ACL data prevents safety proof |

## Access Control (9 invariants)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| `INV.S3.ACCESS.001` | No Unauthorized Cross-Account Access | High | Bucket policies must not grant access to external accounts |
| `INV.S3.ACCESS.002` | No Wildcard Action Policies | High | Bucket policies must not use wildcard actions (s3:*) |
| `INV.S3.ACCESS.003` | No External Write Access | Critical | No write/delete permissions to external accounts |
| `INV.S3.AUTH.READ.001` | No Authenticated-Users Read Access | Critical | No read access to all authenticated AWS users |
| `INV.S3.AUTH.WRITE.001` | No Authenticated-Users Write Access | Critical | No write/delete access to all authenticated AWS users |
| `INV.S3.NETWORK.001` | Public-Principal Policies Must Have Network Conditions | High | Principal=* policies must have IP/VPC conditions |
| `INV.S3.TENANT.ISOLATION.001` | Shared-Bucket Tenant Isolation Must Enforce Prefix | Critical | Presigned URL signers must enforce tenant prefixes |
| `INV.S3.WRITE.SCOPE.001` | S3 Signed Upload Must Bind To Exact Object Key | High | Upload policies must restrict to exact key, not prefix |
| `INV.S3.WRITE.CONTENT.001` | S3 Signed Upload Must Restrict Content Types | High | Upload policies must restrict allowed content types |

## Encryption (4 invariants)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| `INV.S3.ENCRYPT.001` | Encryption at Rest Required | High | All buckets must have server-side encryption |
| `INV.S3.ENCRYPT.002` | Transport Encryption Required | High | HTTPS must be enforced via bucket policy |
| `INV.S3.ENCRYPT.003` | PHI Buckets Must Use SSE-KMS with CMK | Critical | PHI buckets must use customer-managed KMS keys |
| `INV.S3.ENCRYPT.004` | Sensitive Data Requires KMS Encryption | Critical | Non-public classified data must use SSE-KMS |

## Logging (1 invariant)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| `INV.S3.LOG.001` | Access Logging Required | Medium | S3 server access logging must be enabled |

## Lifecycle and Governance (8 invariants)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| `INV.S3.GOVERNANCE.001` | Data Classification Tag Required | High | All buckets must have a `data-classification` tag |
| `INV.S3.LIFECYCLE.001` | Retention-Tagged Buckets Must Have Lifecycle Rules | Medium | Retention-tagged buckets need lifecycle configuration |
| `INV.S3.LIFECYCLE.002` | PHI Buckets Must Not Expire Data Before Minimum Retention | Critical | PHI data must not expire before 2190 days (6 years) |
| `INV.S3.VERSION.001` | Versioning Required | Medium | Versioning must be enabled on all buckets |
| `INV.S3.VERSION.002` | Backup Buckets Must Have MFA Delete | Critical | Backup-tagged buckets must have MFA delete enabled |
| `INV.S3.LOCK.001` | Compliance-Tagged Buckets Must Have Object Lock | Critical | Compliance-tagged buckets must have WORM protection |
| `INV.S3.LOCK.002` | PHI Buckets Must Use COMPLIANCE Mode Object Lock | Critical | PHI buckets must use COMPLIANCE mode (not GOVERNANCE) |
| `INV.S3.LOCK.003` | PHI Object Lock Retention Must Meet Minimum Period | Critical | PHI WORM retention must be at least 2190 days |

## ACL Privilege Escalation (3 invariants)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| `INV.S3.ACL.ESCALATION.001` | No Public ACL Modification | Critical | ACL must not be writable by AllUsers or AuthenticatedUsers |
| `INV.S3.ACL.RECON.001` | No Public ACL Readability | Medium | ACL should not be readable by unauthenticated users |
| `INV.S3.ACL.FULLCONTROL.001` | No FULL_CONTROL ACL Grants to Public | Critical | ACL must not grant FULL_CONTROL to AllUsers or AuthenticatedUsers |

## Supply Chain and Compliance (3 invariants)

| ID | Name | Severity | Description |
|----|------|----------|-------------|
| `INV.S3.BUCKET.TAKEOVER.001` | Referenced S3 Buckets Must Exist And Be Owned | Critical | Referenced S3 buckets must exist and be owned |
| `INV.S3.DANGLING.ORIGIN.001` | CDN S3 Origins Must Not Be Dangling | Critical | CloudFront must not reference non-existent S3 origins |
| `INV.S3.REPO.ARTIFACT.001` | Public Buckets Must Not Expose VCS Artifacts | High | No .git/ or .svn/ in publicly accessible buckets |

## Severity Distribution

| Severity | Count |
|----------|-------|
| Critical | 18 |
| High | 20 |
| Medium | 5 |
