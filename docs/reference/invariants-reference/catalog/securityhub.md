# SECURITYHUB controls (7)

### CTL.SECURITYHUB.AUTOENABLE.001[​](#ctlsecurityhubautoenable001 "Direct link to CTL.SECURITYHUB.AUTOENABLE.001")

**Security Hub Must Auto-Enable for New Organization Accounts**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-4; soc2: CC7.1;

Security Hub must be configured to auto-enable for new member accounts in the organization. Without auto-enable, newly created or invited accounts have no Security Hub coverage until manually configured — a gap that can persist indefinitely if onboarding procedures are missed.

**Remediation:** Enable auto-enable: aws securityhub update-organization-configuration --auto-enable

***

### CTL.SECURITYHUB.ENABLED.001[​](#ctlsecurityhubenabled001 "Direct link to CTL.SECURITYHUB.ENABLED.001")

**AWS Security Hub Must Be Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** fedramp\_moderate: SI-4; ffiec: CAT-D3; gdpr: Art.32; iso\_27001\_2022: A.8.16; nist\_800\_53\_r5: SI-4; nist\_csf\_2.0: DE.CM; pci\_dss\_v4.0: 11.3.1; soc2: CC7.1;

Security Hub must be enabled to aggregate security findings from GuardDuty, Inspector, Macie, and Config into a unified view.

**Remediation:** Enable Security Hub: aws securityhub enable-security-hub --enable-default-standards

***

### CTL.SECURITYHUB.INCOMPLETE.001[​](#ctlsecurityhubincomplete001 "Direct link to CTL.SECURITYHUB.INCOMPLETE.001")

**Complete Data Required for Security Hub Assessment**

* **Severity:** info
* **Type:** unsafe\_state
* **Domain:** exposure

The observation snapshot is missing required Security Hub properties.

**Remediation:** Ensure the extractor calls aws securityhub describe-hub.

***

### CTL.SECURITYHUB.ORG.AGGREGATION.001[​](#ctlsecurityhuborgaggregation001 "Direct link to CTL.SECURITYHUB.ORG.AGGREGATION.001")

**Security Hub Has No Cross-Region Finding Aggregation**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: SI-4; scs\_c02: 4.8; soc2: CC7.1;

Security Hub does not have a finding aggregation region configured. Without cross-region aggregation, findings from each region are visible only in that region's Security Hub console. Security teams must check every active region individually, making it easy to miss findings from regions with lower operational activity. An attacker operating in a non-primary region may go undetected longer.

**Remediation:** Create a finding aggregator in your primary region: aws securityhub create-finding-aggregator --region-linking-mode ALL\_REGIONS.

***

### CTL.SECURITYHUB.ORG.NODELEGATED.001[​](#ctlsecurityhuborgnodelegated001 "Direct link to CTL.SECURITYHUB.ORG.NODELEGATED.001")

**Security Hub Has No Delegated Administrator**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: AC-6(5); scs\_c02: 4.8; soc2: CC6.1;

Security Hub is managed from the management account because no delegated administrator is registered. Security Hub administration — managing standards, integrations, and member account enrollment — should run from a dedicated security account to separate operational security from organizational management.

**Remediation:** Register a security account as delegated admin: aws securityhub enable-organization-admin-account --admin-account-id .

***

### CTL.SECURITYHUB.STANDARDS.001[​](#ctlsecurityhubstandards001 "Direct link to CTL.SECURITYHUB.STANDARDS.001")

**Security Hub Must Have Relevant Standards Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** fedramp\_moderate: SI-4; nist\_800\_53\_r5: SI-4; pci\_dss\_v4.0: 11.3.1; soc2: CC7.1;

Safety mechanism integrity control. Checks that security guardrails are actively enforcing, not just present.

**Remediation:** Review the specific guardrail identified in this finding and restore it to an enforcing state.

***

### CTL.SECURITYHUB.STANDARDS.NONE.001[​](#ctlsecurityhubstandardsnone001 "Direct link to CTL.SECURITYHUB.STANDARDS.NONE.001")

**Security Hub Must Have Security Standards Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-4; pci\_dss\_v4.0: 11.3.1; soc2: CC7.1;

Security Hub must have at least one security standard enabled (AWS Foundational Security Best Practices, CIS Benchmarks, or PCI DSS). Security Hub without standards is a findings aggregator with no baseline — it collects third-party findings but performs no continuous posture evaluation. Standards provide automated security checks that run continuously against account resources.

**Remediation:** Enable security standards in Security Hub: aws securityhub batch-enable-standards. At minimum enable AWS Foundational Security Best Practices (FSBP).

***
