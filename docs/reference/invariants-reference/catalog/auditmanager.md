# AUDITMANAGER controls (1)

### CTL.AUDITMANAGER.ENABLED.001[​](#ctlauditmanagerenabled001 "Direct link to CTL.AUDITMANAGER.ENABLED.001")

**AWS Audit Manager Not Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: CA-7; scs\_c02: 8.11; soc2: CC4.1;

AWS Audit Manager is not enabled. Without Audit Manager, compliance evidence collection is manual, assessments are not automated, and there is no centralized framework for mapping controls to compliance standards.

**Remediation:** Enable Audit Manager and configure a default assessment reports destination: aws auditmanager register-account.

***
