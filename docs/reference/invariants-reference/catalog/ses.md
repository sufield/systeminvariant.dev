# SES controls (3)

### CTL.SES.IDENTITY.DKIM.001[​](#ctlsesidentitydkim001 "Direct link to CTL.SES.IDENTITY.DKIM.001")

**SES Identity Must Have DKIM Signing Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-8; soc2: CC6.6;

SES sending identities (domains and email addresses) must have DomainKeys Identified Mail (DKIM) signing enabled. Without DKIM, emails sent through SES lack a cryptographic signature that receiving mail servers use to verify the sender's identity. An attacker who compromises IAM credentials with ses:SendEmail permission can send phishing emails that appear to originate from the organization's domain. DKIM signing combined with a strict DMARC policy causes receiving servers to reject unsigned emails, limiting the blast radius of compromised SES credentials. Stratus Red Team's ses-enumerate technique specifically checks for SES identities that lack DKIM — these are the identities an attacker would abuse for phishing campaigns.

**Remediation:** Enable DKIM signing for the SES identity using Easy DKIM or BYODKIM. For domains, also configure SPF (via SES MAIL FROM) and a DMARC policy with p=reject. Verify DKIM status shows "Success" in the SES console before relying on it.

***

### CTL.SES.IDENTITY.POLICY.PUBLIC.001[​](#ctlsesidentitypolicypublic001 "Direct link to CTL.SES.IDENTITY.POLICY.PUBLIC.001")

**SES Identity Sending Authorization Must Not Allow External Senders**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3; soc2: CC6.1;

SES identity has an authorization policy permitting ses:SendEmail or ses:SendRawEmail from external principals (Principal: \* or accounts outside the organization). SES sending authorization policies control who can send email using your verified identity. A public policy lets any AWS account send phishing emails from your domain — degrading your domain's reputation and enabling social engineering attacks that appear to originate from your organization. Scott Piper's aws\_exposable\_resources lists ses:PutIdentityPolicy as a public exposure vector. API: ses:GetIdentityPolicies.

**Remediation:** Remove the wildcard principal from the authorization policy. Replace with explicit account ARNs of authorized delegate senders. Add an aws:PrincipalOrgID condition if sharing within the organization.

***

### CTL.SES.IDENTITY.VERIFIED.001[​](#ctlsesidentityverified001 "Direct link to CTL.SES.IDENTITY.VERIFIED.001")

**SES Verified Identities Must Use Organization-Owned Domains**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3; soc2: CC6.1;

SES verified identities should be organization-owned domains, not personal or consumer email addresses (gmail.com, yahoo.com, outlook.com). Verified personal email addresses indicate ad-hoc SES usage outside organizational control.

**Remediation:** Verify organization-owned domains instead. Remove personal email verified identities.

***
