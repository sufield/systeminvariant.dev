# Scope and support

## In scope[​](#in-scope "Direct link to In scope")

* 2,891 controls across 85 AWS/GCP/K8s/Azure/AD/M365 service domains
* Offline analysis of local configuration snapshots (obs.v0.1)
* Deterministic findings and reports
* 10 compliance framework profiles: HIPAA, CIS AWS v3.0, SOC 2, PCI-DSS v4.0, NIST 800-53, FedRAMP, GDPR, FFIEC, ISO 27001, NIST CSF 2.0
* Coverage benchmarks: full OWASP Top 10, 15/15 ATT\&CK cloud (Atomic Red Team), 20/21 Rhino Security privesc, 78/78 AWS CIRT TTC

## Service domains[​](#service-domains "Direct link to Service domains")

S3, IAM, VPC, EC2, RDS, ELB, Lambda, ECS, EKS, Kubernetes, Backup, CloudTrail, CloudWatch, KMS, Config, Secrets Manager, DynamoDB, SQS, SNS, CloudFormation, GuardDuty, Security Hub, Auto Scaling, Route 53, Cognito, ElastiCache, API Gateway, OpenSearch, Bedrock, CloudFront, SageMaker, WAF, ACM, EventBridge, Step Functions, ECR, EFS, MSK, Kinesis, Batch, Inspector, Macie, Shield, CodeCommit, Grafana, GCS, DNS, Active Directory, Azure (Key Vault, Functions, App Service), M365/Entra, and more

## Out of scope[​](#out-of-scope "Direct link to Out of scope")

* Runtime behavior monitoring or agents
* Application-specific logic (CMS, e-commerce, etc.)
* Organizational processes (training, incident response plans, vendor management)
* Live API call history or metric alarm trigger state

## Supported commands[​](#supported-commands "Direct link to Supported commands")

* `stave apply` — control evaluation (default and profile modes)
* `stave validate` — input validation
* `stave diagnose` — per-control analysis
* `stave ci` — CI/CD baseline and gating
* Tests: `make test`, `make e2e`, `make lint`
