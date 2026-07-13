---
sidebar_position: 3
---
# How to Run an OpenSearch Security Assessment

Evaluate AWS OpenSearch domain configuration against 12 controls
covering the Darkbeam, Wyze, and Microsoft Elasticsearch breach
patterns.

## Prerequisites

- Stave binary built (`cd stave && make build`)
- OpenSearch observations in `obs.v0.1` format

## 1) Extract OpenSearch observations

Use an extractor to produce `obs.v0.1` JSON from AWS OpenSearch APIs.
The extractor must call:

| AWS API | What it produces | Controls that need it |
|---------|-----------------|----------------------|
| `opensearch describe-domain` | Domain config, VPC, encryption, FGAC, HTTPS | All controls |
| `opensearch describe-domain-config` | Full config detail, access policies | ACCESS.POLICY.001 |
| `opensearch list-domain-names` | Domain inventory | Discovery |

### Key field mapping

| AWS API field | obs.v0.1 property |
|---|---|
| `VPCOptions == null` | `search_service.access.publicly_accessible = true` |
| `VPCOptions.VPCId` present | `search_service.access.vpc_enabled = true` |
| `AdvancedSecurityOptions.Enabled` | `search_service.access.fgac_enabled` |
| `AdvancedSecurityOptions.InternalUserDatabaseEnabled` or FGAC | `search_service.access.auth_enabled` |
| Dashboards endpoint + public | `search_service.access.kibana_public` |
| AccessPolicies contains `"Principal":"*"` | `search_service.access.policy_allows_wildcard` |
| `EncryptionAtRestOptions.Enabled` | `search_service.encryption.at_rest_enabled` |
| `NodeToNodeEncryptionOptions.Enabled` | `search_service.encryption.node_to_node_enabled` |
| `DomainEndpointOptions.EnforceHTTPS` | `search_service.transport.https_enforced` |
| `LogPublishingOptions.AUDIT_LOGS.Enabled` | `search_service.logging.audit_logs_enabled` |
| Snapshot repo S3 bucket encrypted | `search_service.snapshots.encrypted` |

## 2) Evaluate

```bash
stave apply \
  --controls controls/opensearch \
  --observations ./opensearch-obs/ \
  --max-unsafe 168h \
  --eval-time 2026-01-15T00:00:00Z \
  --format json > opensearch-findings.json
```

## 3) What the OpenSearch pack covers

12 controls across 4 categories:

| Category | Controls | What they detect |
|----------|----------|-----------------|
| Access control | AUTH.001, PUBLIC.001, VPC.001, FGAC.001, KIBANA.001, ACCESS.POLICY.001 | No auth (Darkbeam root cause), public endpoint, no VPC, no FGAC, public dashboards, wildcard principal |
| Encryption | ENCRYPT.001, ENCRYPT.002, HTTPS.001 | Unencrypted at rest, no node-to-node encryption, HTTP allowed |
| Logging | LOG.001 | No audit logging |
| Data protection | SNAPSHOT.001 | Unencrypted snapshots |
| Completeness | INCOMPLETE.001 | Missing observation data |

## 4) Breach patterns this prevents

| Breach | Records | Root cause | Controls that fire |
|--------|---------|------------|-------------------|
| **Darkbeam (2023)** | 3.8B | Public ES, no auth, no VPC | AUTH.001, PUBLIC.001, VPC.001, FGAC.001, KIBANA.001, ACCESS.POLICY.001 |
| **Wyze (2019)** | 2.4M | Unsecured ES cluster | AUTH.001, PUBLIC.001 |
| **Microsoft (2020)** | 250M | Misconfigured ES, no auth | AUTH.001, FGAC.001 |

## 5) Example observation (Darkbeam pattern — unsafe)

```json
{
  "id": "opensearch-darkbeam-pattern",
  "type": "aws_opensearch_domain",
  "vendor": "aws",
  "properties": {
    "search_service": {
      "kind": "domain",
      "access": {
        "publicly_accessible": true,
        "vpc_enabled": false,
        "auth_enabled": false,
        "fgac_enabled": false,
        "kibana_public": true,
        "policy_allows_wildcard": true
      },
      "encryption": {
        "at_rest_enabled": false,
        "node_to_node_enabled": false
      },
      "transport": {
        "https_enforced": false
      },
      "logging": {
        "audit_logs_enabled": false
      },
      "snapshots": {
        "encrypted": false
      }
    }
  }
}
```

All 11 non-INCOMPLETE controls fire. This is the maximum-exposure configuration.

## Notes

- OpenSearch controls coexist with S3/IAM controls when evaluated together.
- The `search_service.kind == "domain"` discriminator prevents false matches.
