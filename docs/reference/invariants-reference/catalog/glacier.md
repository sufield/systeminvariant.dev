# GLACIER controls (2)

### CTL.GLACIER.POLICY.CROSSACCOUNT.001[​](#ctlglacierpolicycrossaccount001 "Direct link to CTL.GLACIER.POLICY.CROSSACCOUNT.001")

**Glacier Vault Policy Grants Cross-Account Access Without Organizational Boundary**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3; soc2: CC6.1;

Glacier vault access policy grants actions to principals in external AWS accounts without an aws:PrincipalOrgID condition. Glacier vaults store long-term archival data — backups, compliance records, and audit logs. Cross-account access without an org boundary means the external account can initiate retrieval jobs (glacier:InitiateJob), read archive contents (glacier:GetJobOutput), or delete archives (glacier:DeleteArchive). If the external account leaves the organization, access persists.

**Remediation:** Add an aws:PrincipalOrgID condition to restrict access to principals within the organization. For legitimate cross-org access, use explicit account ARNs and document the trust relationship.

***

### CTL.GLACIER.VAULT.POLICY.PUBLIC.001[​](#ctlglaciervaultpolicypublic001 "Direct link to CTL.GLACIER.VAULT.POLICY.PUBLIC.001")

**Glacier Vault Access Policy Must Not Allow Public Access**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3; soc2: CC6.1;

Glacier vault access policy grants actions to Principal "\*" (any AWS account). Glacier vaults store long-term archival data — backups, compliance records, audit logs. A public vault policy lets any AWS account initiate retrieval jobs, read archive contents, or delete archives. Scott Piper's aws\_exposable\_resources lists glacier:SetVaultAccessPolicy as a public exposure vector. API: glacier:GetVaultAccessPolicy.

**Remediation:** Remove the wildcard principal from the vault access policy. Replace with explicit account ARNs and add an aws:PrincipalOrgID condition.

***
