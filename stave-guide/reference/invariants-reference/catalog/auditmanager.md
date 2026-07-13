---
title: "AUDITMANAGER controls"
sidebar_label: "AUDITMANAGER (1)"
sidebar_position: 8
---

# AUDITMANAGER controls (1)

### CTL.AUDITMANAGER.ENABLED.001

**AWS Audit Manager Not Enabled**

- **Severity:** medium
- **Type:** unsafe_state
- **Domain:** governance
- **Compliance:** nist_800_53_r5: CA-7; scs_c02: 8.11; soc2: CC4.1;

AWS Audit Manager is not enabled. Without Audit Manager, compliance evidence collection is manual, assessments are not automated, and there is no centralized framework for mapping controls to compliance standards.

**Remediation:** Enable Audit Manager and configure a default assessment reports destination: aws auditmanager register-account.

---
