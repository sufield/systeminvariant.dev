# MACIE controls (4)

### CTL.MACIE.CLASSIFICATION.001[​](#ctlmacieclassification001 "Direct link to CTL.MACIE.CLASSIFICATION.001")

**Macie Must Have Automated Sensitive Data Discovery Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: RA-5; pci\_dss\_v4.0: 3.4.1; soc2: CC7.1;

Macie automated sensitive data discovery must be enabled. Basic Macie enablement (CTL.MACIE.ENABLED.001) activates the service but does not start scanning. Automated discovery continuously samples S3 objects across the account to find PII, financial data, and credentials without requiring manual classification job creation. Without automated discovery, sensitive data detection depends on manually-created jobs that may miss newly created buckets.

**Remediation:** Enable automated discovery: aws macie2 update-automated-discovery-configuration --status ENABLED

***

### CTL.MACIE.ENABLED.001[​](#ctlmacieenabled001 "Direct link to CTL.MACIE.ENABLED.001")

**Amazon Macie Must Be Enabled for S3 Data Discovery**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: RA-5; soc2: CC7.1;

Amazon Macie must be enabled for automated sensitive data discovery in S3 buckets. Without Macie, PII and sensitive data in S3 goes undetected.

**Remediation:** Enable Macie in the account.

***

### CTL.MACIE.GHOST.EXPORT.S3.001[​](#ctlmacieghostexports3001 "Direct link to CTL.MACIE.GHOST.EXPORT.S3.001")

**Macie Findings Export S3 Bucket Deleted**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** hipaa: 164.312(b); nist\_800\_53\_r5: AU-6, SI-4; soc2: CC7.1, CC8.1;

Macie classification export is configured to deliver sensitive-data findings to an S3 bucket that has been deleted. Findings are generated but silently dropped. If the bucket name is re-registered under a different account, Macie may resume delivery to attacker-controlled storage — exfiltrating a catalog of where sensitive data lives across the account.

**Remediation:** Recreate the S3 bucket or update the Macie export configuration to point at an existing bucket: aws macie2 put-classification-export-configuration --configuration s3Destination={bucketName=,kmsKeyArn=}.

***

### CTL.MACIE.ORG.NODELEGATED.001[​](#ctlmacieorgnodelegated001 "Direct link to CTL.MACIE.ORG.NODELEGATED.001")

**Macie Has No Delegated Administrator**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: AC-6(5); scs\_c02: 8.10; soc2: CC6.1;

Amazon Macie has no delegated administrator registered. Macie administration runs from the management account, concentrating data classification operations in the highest-trust account boundary. A dedicated security account should manage Macie across the organization.

**Remediation:** Register a delegated admin: aws macie2 enable-organization-admin-account --admin-account-id .

***
