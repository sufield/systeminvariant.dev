# SERVERLESSREPO controls (1)

### CTL.SERVERLESSREPO.POLICY.PUBLIC.001[​](#ctlserverlessrepopolicypublic001 "Direct link to CTL.SERVERLESSREPO.POLICY.PUBLIC.001")

**Serverless Application Repository Application Must Not Be Publicly Shared**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3; soc2: CC6.1;

Serverless Application Repository (SAR) application has a policy permitting public access. Public SAR applications expose Lambda deployment packages — which may contain embedded secrets, proprietary business logic, or internal API endpoints. Scott Piper's aws\_exposable\_resources lists serverlessrepo:PutApplicationPolicy as a public exposure vector. API: serverlessrepo:GetApplicationPolicy.

**Remediation:** Remove the public sharing statement from the application policy. To share with specific accounts, use explicit account IDs or an aws:PrincipalOrgID condition.

***
