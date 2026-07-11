# Controls Reference

Stave ships with 2,891 controls across 85 domains. Each control defines a safety property that your infrastructure must satisfy.

The full auto-generated catalog is at [docs/controls/reference.md](https://github.com/sufield/stave/blob/main/docs/controls/reference.md), with per-service breakdowns in [docs/controls/reference/](https://github.com/sufield/stave/tree/main/docs/controls/reference).

## Coverage highlights[​](#coverage-highlights "Direct link to Coverage highlights")

* **AWS:** S3 (131), IAM (219), OpenSearch (132), EKS (115), Lambda (85), CloudFront (71), ECS (50), Bedrock (46), DynamoDB (35), Cognito (30+), and 75 more services.
* **Multi-cloud:** GCP Cloud Storage (7), Azure (Key Vault, Functions, App Service), Active Directory (18), M365/Entra (4).
* **Vendor-agnostic:** DNS dangling-reference detection (3), Kubernetes workload controls (8).
* **Compliance profiles:** HIPAA, CIS AWS v3.0, SOC 2, PCI-DSS v4.0, NIST 800-53, FedRAMP, GDPR, FFIEC, ISO 27001, NIST CSF 2.0.

## Coverage benchmarks[​](#coverage-benchmarks "Direct link to Coverage benchmarks")

* Full OWASP Top 10
* 15/15 ATT\&CK cloud techniques tested by Atomic Red Team
* 20/21 Rhino Security Labs privilege-escalation techniques
* 78/78 AWS CIRT Threat Technique Catalog configuration preconditions

## Browse by service[​](#browse-by-service "Direct link to Browse by service")

Per-service reference pages are auto-generated from the control catalog. Browse the [catalog/](/docs/reference/invariants-reference/catalog/.md) directory for detailed per-control documentation including severity, compliance mappings, predicates, and remediation guidance.

Use the CLI to explore interactively:

```
# List all controls
stave catalog list

# Search by keyword
stave controls search "encryption"

# Filter by taxonomy
stave catalog taxonomy

# Inspect a specific control
stave catalog inspect CTL.S3.PUBLIC.001
```
