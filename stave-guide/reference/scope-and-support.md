---
title: "Scope and Limits"
sidebar_label: "Scope and Limits"
description: "What Stave covers, what is out of scope, and known technical limitations."
---

# Scope and Limits

## In scope
- 2,891 controls across 85 AWS/GCP/K8s/Azure/AD/M365 service domains
- Offline analysis of local configuration snapshots (obs.v0.1)
- Deterministic findings and reports
- 10 compliance framework profiles: HIPAA, CIS AWS v3.0, SOC 2, PCI-DSS v4.0, NIST 800-53, FedRAMP, GDPR, FFIEC, ISO 27001, NIST CSF 2.0
- Coverage benchmarks: full OWASP Top 10, 15/15 ATT&CK cloud (Atomic Red Team), 20/21 Rhino Security privesc, 78/78 AWS CIRT TTC

## Service domains
S3, IAM, VPC, EC2, RDS, ELB, Lambda, ECS, EKS, Kubernetes, Backup,
CloudTrail, CloudWatch, KMS, Config, Secrets Manager, DynamoDB, SQS,
SNS, CloudFormation, GuardDuty, Security Hub, Auto Scaling, Route 53,
Cognito, ElastiCache, API Gateway, OpenSearch, Bedrock, CloudFront,
SageMaker, WAF, ACM, EventBridge, Step Functions, ECR, EFS, MSK,
Kinesis, Batch, Inspector, Macie, Shield, CodeCommit, Grafana,
GCS, DNS, Active Directory, Azure (Key Vault, Functions, App Service),
M365/Entra, and more

## Out of scope
- Runtime behavior monitoring or agents
- Application-specific logic (CMS, e-commerce, etc.)
- Organizational processes (training, incident response plans, vendor management)
- Live API call history or metric alarm trigger state

## Supported commands
- `stave apply` — control evaluation (default and profile modes)
- `stave validate` — input validation
- `stave diagnose` — per-control analysis
- `stave ci` — CI/CD baseline and gating
- Tests: `make test`, `make e2e`, `make lint`

## Known limitations

### Duration requires two snapshots

Duration-based controls (`unsafe_duration`) need at least two observation snapshots to calculate unsafe periods. A single snapshot cannot establish duration.

### Threshold comparison is strict

The `unsafe_duration` threshold comparison uses strict greater-than (`>`). An asset that has been unsafe for exactly the `--max-unsafe` duration does not trigger a violation — it must exceed the threshold.

### Missing fields and predicate semantics

- Missing fields do **not** match `eq false` — only explicitly set `false` values trigger `eq false`.
- Missing fields **do** match `ne "value"` — absence counts as "not equal."

### Snapshot sensitivity

Terraform plan/state exports and AWS CLI snapshots may contain embedded credentials or sensitive values in rare cases. Stave treats all asset properties as opaque data and does not detect or filter secrets within snapshots. Use `--sanitize` when sharing outputs.

### Provenance verification requires network

SHA-256 checksum and Cosign signature verification work fully offline, but build provenance verification (`gh attestation verify`) requires GitHub connectivity.
