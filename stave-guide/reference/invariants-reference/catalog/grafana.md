---
title: "GRAFANA controls"
sidebar_label: "GRAFANA (1)"
sidebar_position: 50
---

# GRAFANA controls (1)

### CTL.GRAFANA.AUTH.001

**Managed Grafana Workspace Not Using SSO Authentication**

- **Severity:** medium
- **Type:** unsafe_state
- **Domain:** identity
- **Compliance:** nist_800_53_r5: IA-2; scs_c02: 10.11; soc2: CC6.1;

An Amazon Managed Grafana workspace is not configured with IAM Identity Center (SSO) or SAML authentication. Without centralized authentication, workspace access is managed separately from the organization's identity provider, creating credential sprawl and bypassing MFA and session policies enforced by the IdP.

**Remediation:** Configure IAM Identity Center or SAML authentication for the workspace: aws grafana update-workspace-authentication --workspace-id <id> --authentication-providers AWS_SSO.

---
