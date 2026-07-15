# ORG controls (6)

### CTL.ORG.ALLFEATURES.001[​](#ctlorgallfeatures001 "Direct link to CTL.ORG.ALLFEATURES.001")

**AWS Organizations Must Be in All Features Mode**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-7; scs\_c02: 1.1; soc2: CC6.1;

AWS Organizations must operate in ALL\_FEATURES mode, not CONSOLIDATED\_BILLING. Consolidated-billing-only mode disables SCPs, tag policies, AI opt-out policies, and backup policies — the entire organizational governance layer is unavailable. Without ALL\_FEATURES mode, the management account cannot enforce guardrails on member accounts. Migrating from consolidated-billing to all-features requires consent from every member account.

**Remediation:** Enable all features in the organization via the AWS Organizations console or EnableAllFeatures API. This sends an invitation to each member account that must be accepted.

***

### CTL.ORG.CONTROLTOWER.DRIFT.001[​](#ctlorgcontroltowerdrift001 "Direct link to CTL.ORG.CONTROLTOWER.DRIFT.001")

**Control Tower Landing Zone Has Configuration Drift**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: CM-3, CM-6; scs\_c02: 1.4; soc2: CC8.1;

The Control Tower landing zone has detected configuration drift from its baseline. Drift occurs when guardrails, OUs, or account configurations are modified outside Control Tower, creating gaps between intended and actual governance state. Drifted guardrails may not enforce intended restrictions.

**Remediation:** Resolve drift by re-registering the affected OU or resetting the landing zone. Review CloudTrail for the change that caused drift.

***

### CTL.ORG.CONTROLTOWER.ENABLED.001[​](#ctlorgcontroltowerenabled001 "Direct link to CTL.ORG.CONTROLTOWER.ENABLED.001")

**AWS Control Tower Must Be Enabled for Landing Zone Governance**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: AC-3, CM-2; scs\_c02: 1.4; soc2: CC6.1, CC8.1;

AWS Control Tower is not enabled. Control Tower provides a governed landing zone with preventive and detective guardrails across member accounts. Without it, account provisioning and baseline security configuration must be managed manually, leading to configuration drift and inconsistent security posture across the organization.

**Remediation:** Enable Control Tower from the management account. Select a home region, configure the log archive and audit accounts, and enable the default guardrails.

***

### CTL.ORG.REGION.SCP.001[​](#ctlorgregionscp001 "Direct link to CTL.ORG.REGION.SCP.001")

**AWS Organizations Must Have an SCP Restricting Resource Creation to Approved Regions**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** fedramp\_moderate: CM-7; gdpr: Art.32; hipaa: 164.312(b); nist\_800\_53\_r5: CM-7; pci\_dss\_v4.0: 12.5.2; soc2: CC7.1;

AWS Organizations must have a Service Control Policy that restricts resource creation to an approved set of AWS regions. Without a region restriction SCP, any IAM principal can create resources in any of 30+ regions — including regions where the organization has no CloudTrail, no GuardDuty, no Config recording, and no monitoring infrastructure. MITRE ATT\&CK T1535 documents this as a defense evasion technique: attackers deliberately operate in unused regions to bypass cloud monitoring. A region restriction SCP closes all unmonitored regions simultaneously with a single organizational policy rather than requiring monitoring deployment to every region. This is the architectural complement to per-region monitoring controls — it eliminates the regions where monitoring is not deployed.

**Remediation:** Attach an SCP to the organization root with a Deny statement conditioned on aws:RequestedRegion that restricts resource creation to the organization's approved operating regions. Example condition: StringNotEquals aws:RequestedRegion \[us-east-1, us-west-2, eu-west-1]. Exclude global services (IAM, CloudFront, Route 53) from the restriction using a NotAction list.

***

### CTL.ORG.SCP.DEPUTYPREVENTION.001[​](#ctlorgscpdeputyprevention001 "Direct link to CTL.ORG.SCP.DEPUTYPREVENTION.001")

**AWS Organizations Must Have an SCP Preventing Confused Deputy Attacks**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-4; soc2: CC6.1;

AWS Organizations must have a Service Control Policy that prevents confused deputy attacks by requiring sts:AssumeRole calls to include the aws:SourceAccount condition. Without this SCP, cross-account role assumption can be exploited by confused deputy attacks where a trusted service is tricked into acting on behalf of an unauthorized principal. This is a foundational cross-account trust boundary control.

**Remediation:** Attach an SCP to the organization root that denies sts:AssumeRole when the aws:SourceAccount condition key is not present. This forces all cross-account role assumptions to declare the source account, preventing confused deputy attacks.

***

### CTL.ORG.TRUSTEDACCESS.001[​](#ctlorgtrustedaccess001 "Direct link to CTL.ORG.TRUSTEDACCESS.001")

**AWS Organizations Trusted Access Must Be Reviewed**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: AC-6; soc2: CC6.3;

AWS Organizations trusted access allows AWS services to perform operations across all accounts in the organization. Each enabled trusted access service (CloudTrail, GuardDuty, Config, etc.) gains cross-account permissions. Unreviewed trusted access means services may have organization-wide permissions that were enabled for a project and never revoked.

**Remediation:** Review all enabled trusted access services. Disable any that are no longer needed. Use aws organizations list-aws-service-access-for-organization to list enabled services and disable-aws-service-access to revoke.

***
